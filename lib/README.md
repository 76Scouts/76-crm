# lib/ — βιβλιοθήκες που σερβίρει το ίδιο το e.76.life
22/11/2026 (Οδηγία Αρχείων Καταγραφής 27/10, σημείο 3 · «ναι» Α.Σ. 22/11): καμία βιβλιοθήκη από jsDelivr/cdnjs,
ώστε η IP του χρήστη να μη φεύγει σε τρίτους. Όλα από npm (`npm pack`), αυτούσια — ίδιο sha384 με τα αρχεία των CDN
που χρησιμοποιούσαμε (έλεγχος 22/11). Νέα έκδοση = νέο αρχείο με την έκδοση στο όνομα + νέο hash στο LIB_SRI.

| Αρχείο | Πακέτο npm |
|---|---|
| supabase-js-2.118.0.umd.js | @supabase/supabase-js@2.118.0 dist/umd/supabase.js |
| fontkit-1.1.1.umd.min.js | @pdf-lib/fontkit@1.1.1 dist/fontkit.umd.min.js |
| exceljs-4.4.0.min.js | exceljs@4.4.0 dist/exceljs.min.js |
| pdfjs-3.11.174/ | pdfjs-dist@3.11.174 build/pdf.min.js, pdf.worker.min.js |
| pdf-lib-1.17.1.min.js | pdf-lib@1.17.1 dist/pdf-lib.min.js |
| jszip-3.10.1.min.js | jszip@3.10.1 dist/jszip.min.js |
| mammoth-1.6.0.browser.min.js | mammoth@1.6.0 mammoth.browser.min.js |
| tesseract-5.1.1/ | tesseract.js@5.1.1 dist/tesseract.min.js, worker.min.js |
| tesseract-core-5.1.1/ | tesseract.js-core@5.1.1 tesseract-core-lstm.wasm.js, tesseract-core-simd-lstm.wasm.js |
| tessdata-4.0.0_best_int/ | @tesseract.js-data/ell@1.0.0, @tesseract.js-data/eng@1.0.0 (4.0.0_best_int) |

Άδειες: `LICENSES/` (το @pdf-lib/fontkit είναι MIT· το πακέτο δεν έχει αρχείο άδειας).
