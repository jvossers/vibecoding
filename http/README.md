# HTTP requests: a click-along demo

Ten plain static HTML pages for teaching how HTTP requests work (GCSE computer
science). Open Chrome DevTools on the Network tab, click between the pages, and
watch one row appear per file fetched.

Live at <https://labs.vossers.com/http/>.

## Requests per page

| Page | Requests | Made up of |
| --- | --- | --- |
| `index.html` | 1 | HTML |
| `devtools.html` | 1 | HTML |
| `one-image.html` | 2 | HTML + 1 PNG |
| `three-images.html` | 4 | HTML + 2 PNG + 1 SVG |
| `stylesheet.html` | 2 | HTML + `extra.css` |
| `big-image.html` | 2 | HTML + 1.8 MB PNG |
| `cache.html` | 3 | HTML + 2 PNGs already used elsewhere |
| `not-found.html` | 2 | HTML (200) + a missing image (404) |
| `quiz.html` | 2 | HTML + 1 PNG |
| `glossary.html` | 1 | HTML |

The browser may also request `/favicon.ico` on its own; `index.html` explains
that so it doesn't confuse the count.

## Deliberate choices

- No JavaScript anywhere, and no build step. Every page is readable with
  **View page source**.
- CSS is inline in every page *except* `stylesheet.html`, so the request count
  stays predictable and the one external stylesheet stands out.
- `images/missing.png` genuinely does not exist — that's how `not-found.html`
  produces a 404.
- Images are generated PNGs of very different sizes (973 B to 1.8 MB) so the
  Size and Time columns show something interesting, plus one SVG whose source
  is readable text.
