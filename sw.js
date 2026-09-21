/* ══ e76 — ΑΝΟΙΓΜΑ ΧΩΡΙΣ ΣΥΝΔΕΣΗ (21/09/2026) ══════════════════════════════
   Κρατά ΜΟΝΟ το κέλυφος της εφαρμογής (τη σελίδα και τη βιβλιοθήκη Supabase)
   ώστε το e76 να ανοίγει στο βουνό χωρίς σήμα. ΚΑΝΕΝΑ δεδομένο δεν περνά από
   εδώ: οι κλήσεις στη βάση δεν αποθηκεύονται ποτέ.
   · Σελίδα: πρώτα το δίκτυο (για να έρχεται πάντα η νέα έκδοση) — αν δεν
     απαντήσει σε 4 δευτερόλεπτα ή δεν υπάρχει σύνδεση, η αποθηκευμένη.
   · Βιβλιοθήκη από CDN: από την αποθήκη, αν υπάρχει.
   · Όλα τα υπόλοιπα: περνούν απευθείας, χωρίς αποθήκευση. */
const SHELL = 'e76-shell-v1';
const PAGE = new URL('./index.html', self.registration.scope).href;
const LIB = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => Promise.all([
    c.add(new Request(PAGE, { cache: 'reload' })).catch(() => {}),
    fetch(LIB, { mode: 'no-cors' }).then(r => c.put(LIB, r)).catch(() => {})
  ])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('e76-') && k !== SHELL).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const timeout = (ms) => new Promise((_, no) => setTimeout(() => no(new Error('timeout')), ms));

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Η σελίδα της εφαρμογής (και μόνο αυτή — όχι η neos.html).
  if (req.mode === 'navigate' && url.origin === location.origin && !/neos\.html$/.test(url.pathname)) {
    e.respondWith((async () => {
      const c = await caches.open(SHELL);
      try {
        const r = await Promise.race([fetch(req), timeout(4000)]);
        if (r && r.ok && r.type === 'basic') c.put(PAGE, r.clone());
        return r;
      } catch (_) {
        return (await c.match(PAGE)) || new Response('<h1>Χωρίς σύνδεση</h1><p>Άνοιξε το e76 μία φορά με σύνδεση για να δουλεύει και χωρίς.</p>',
          { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
      }
    })());
    return;
  }
  if (req.url === LIB) {
    e.respondWith(caches.open(SHELL).then(async c => {
      const hit = await c.match(LIB);
      const net = fetch(req).then(r => { c.put(LIB, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
  }
  // Όλα τα άλλα (βάση, αρχεία, γραμματοσειρές): κανονικά από το δίκτυο.
});
