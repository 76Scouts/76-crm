/* ══ e76 — ΑΝΟΙΓΜΑ ΧΩΡΙΣ ΣΥΝΔΕΣΗ (21/09/2026) ══════════════════════════════
   Κρατά ΜΟΝΟ το κέλυφος της εφαρμογής (τη σελίδα και τη βιβλιοθήκη Supabase)
   ώστε το e76 να ανοίγει στο βουνό χωρίς σήμα. ΚΑΝΕΝΑ δεδομένο δεν περνά από
   εδώ: οι κλήσεις στη βάση δεν αποθηκεύονται ποτέ.
   · Σελίδα: πρώτα το δίκτυο (για να έρχεται πάντα η νέα έκδοση) — αν δεν
     απαντήσει σε 4 δευτερόλεπτα ή δεν υπάρχει σύνδεση, η αποθηκευμένη.
   · Βιβλιοθήκη από CDN: από την αποθήκη, αν υπάρχει.
   · Όλα τα υπόλοιπα: περνούν απευθείας, χωρίς αποθήκευση. */
// 28/10: η βιβλιοθήκη ΚΛΕΙΔΩΘΗΚΕ σε έκδοση με έλεγχο ακεραιότητας (index.html) — το LIB πρέπει να
// είναι ΑΚΡΙΒΩΣ το ίδιο URL, και η αποθήκευση με mode 'cors' (αλλιώς ο browser δεν μπορεί να ελέγξει
// το hash και η εφαρμογή δεν ανοίγει χωρίς σήμα). Νέα έκδοση βιβλιοθήκης = αλλαγή ΚΑΙ εδώ.
const SHELL = 'e76-shell-v2';
const PAGE = new URL('./index.html', self.registration.scope).href;
const LIB = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.118.0/dist/umd/supabase.js';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => Promise.all([
    c.add(new Request(PAGE, { cache: 'reload' })).catch(() => {}),
    fetch(LIB, { mode: 'cors' }).then(r => { if (r.ok) return c.put(LIB, r); }).catch(() => {})
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
  // Η σελίδα της εφαρμογής (και μόνο αυτή — όχι η neos.html ούτε η anevasma.html: αυτόνομες
  // σελίδες· αν περνούσαν από εδώ, θα έπαιρναν τη θέση της εφαρμογής στην αποθήκη).
  if (req.mode === 'navigate' && url.origin === location.origin && !/(neos|anevasma)\.html$/.test(url.pathname)) {
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
      const net = fetch(req).then(r => { if (r.ok) c.put(LIB, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
  }
  // Όλα τα άλλα (βάση, αρχεία, γραμματοσειρές): κανονικά από το δίκτυο.
});

/* ══ ΕΙΔΟΠΟΙΗΣΕΙΣ (28/10) ══ Τις στέλνει η push-send· το κείμενο είναι σύντομο και χωρίς ευαίσθητα —
   τα στοιχεία τα βλέπει ο χρήστης μέσα στην e76, αφού συνδεθεί. Πάτημα = άνοιγμα της e76 στη σωστή οθόνη. */
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) { d = { title: 'e76', body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'e76', {
    body: d.body || '', tag: d.tag || 'e76', icon: 'icon-192.png', badge: 'icon-192.png',
    data: { url: d.url || './' } }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(ws => {
    for (const w of ws) {
      if (w.url.startsWith(self.registration.scope)) { w.focus(); return w.navigate ? w.navigate(url) : undefined; }
    }
    return self.clients.openWindow(url);
  }));
});
