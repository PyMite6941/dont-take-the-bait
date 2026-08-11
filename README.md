# Don't Take the Bait

> **and.... BOOM** — you could have been phished.

A free, plain-English guide to spotting phishing emails, scam texts and fraud phone
calls. Built for people who are **not** technically confident — the aesthetic is
terminal-dark and technical, but every word on the page is jargon-free.

**Live:** https://pymite6941.is-a.dev/dont-take-the-bait/

---

## What's in it

| Page | What it does |
|---|---|
| `index.html` | The full guide — a dramatised "attack" terminal, the five warning signs, three scam messages you can pull apart flag by flag, an eight-question test, and incident-response steps |
| `guide.html` | A one-page checklist designed to be **printed** and stuck on a fridge. Prints two-column on a single sheet |

Interactive pieces (all in `app.js`, no dependencies):

1. **Hero terminal** — a scripted simulation of a phishing attack succeeding, then the reveal
2. **Teardown tabs** — fake bank email / fake delivery text / fake support call
3. **Flag markers** — click any ⚑ inside a message to read exactly why it's a giveaway
4. **Real-or-scam quiz** — 8 messages, 3 of them genuine on purpose

## Stack

Plain HTML, CSS and JavaScript. No build step, no framework, no dependencies, no
network calls at runtime. Four files plus this README.

```
index.html    the guide
guide.html    the printable checklist
styles.css    all styling, including print rules
app.js        terminal, tabs, flags, quiz
```

Open `index.html` in a browser. That's the whole development workflow.

## Principles baked into the code

- **Look technical, read plain.** Monospace, dark, section IDs like `VEC_02` — but the
  prose never assumes knowledge. Where a technical detail appears (the raw email headers
  in the teardown), it is behind a disclosure marked *"optional — you do not need these"*
  and immediately translated.
- **Body text never drops below 17px.** Every tappable target is at least 44px tall.
- **Nothing depends on colour alone** — icons and words carry the same meaning.
- **`prefers-reduced-motion` is respected.** The terminal skips to its finished state.
- **Works without JavaScript.** A `<noscript>` block reveals the hero and expands all
  three examples inline.
- **Zero data collection.** No analytics, no cookies, no fonts or scripts from other
  servers. The footer promises this, so keep it true.
- **The quiz includes genuine messages.** Teaching "be suspicious of everything" produces
  people who ignore real fraud alerts.

## On the examples

Every scam message on the site is an invented recreation for teaching. The companies
(NorthPoint Bank, and the deliberately misspelled delivery brand) are fictional, no link
is clickable, and the hero terminal is pure theatre — it reads nothing about the visitor
and the page says so immediately underneath.

## Deploying

Hosted on GitHub Pages from the `main` branch, root folder. Push to `main` and it
redeploys. `.nojekyll` stops GitHub trying to process the files as a Jekyll site.

To point a custom domain at it, add a `CNAME` file containing the bare domain and set the
DNS records at the registrar.

## Licence

Public domain — do whatever you like with it. Copy it, print it, translate it, hand it
out. That is the point.
