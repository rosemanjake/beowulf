# Beowulf (`hwaet.io`)

A multi-translation reader and side-by-side comparison web app for the Old English epic *Beowulf*, powered by a Node/Express backend and a React frontend.

## Sources Included

- **Old English (Plain)** (`as`) — Cotton MS Vitellius A.xv (Public Domain)
- **Old English — Macrons** (`hs`) — James A. Harrison & Robert Sharp, 1894 ([Project Gutenberg #9701](https://www.gutenberg.org/ebooks/9701), Public Domain)
- **John Lesslie Hall** (`hall`) — 1892 verse translation & marginal glosses ([Project Gutenberg #16328](https://www.gutenberg.org/ebooks/16328), Public Domain)
- **William Morris & A. J. Wyatt** (`mw`) — 1895 verse translation ([Project Gutenberg #20431](https://www.gutenberg.org/ebooks/20431), Public Domain)
- **Francis B. Gummere** (`g`) — 1910 alliterative verse translation ([Project Gutenberg #981](https://www.gutenberg.org/ebooks/981), Public Domain)
- **Ernest J. B. Kirtlan** (`p`) — 1914 modern English prose translation ([Project Gutenberg #50742](https://www.gutenberg.org/ebooks/50742), Public Domain)
- **C. K. Scott Moncrieff** (`sm`) — 1921 alliterative verse translation with caesurae ([Internet Archive](https://archive.org/details/widsithbeowulff00scotuoft), Public Domain)
- **Benjamin Slade** (`slade`) — 2002–2020 Modern English line-by-line translation ([Beowulf on Steorarume](https://heorot.dk/), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/))

## Local Development

```bash
# 1. Install backend dependencies, compile TypeScript, and start server (port 8080)
npm install
npm run build:server
npm start

# 2. In a separate terminal, install frontend dependencies & run dev server
cd react
npm install
npm start
```

## Typechecking & Formatting

```bash
npm run typecheck
npm run format
```

## Production Build & Deployment

```bash
# Compile TypeScript backend (./dist) and build React frontend (./build)
npm run build:all

# Deploy to Google App Engine (ensure project billing is enabled)
gcloud app deploy --project=beowulf
```
