'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const versions = require('./server/versions');

const app = express();
const BUILD_DIR = path.join(__dirname, 'build');
const INDEX_HTML = path.join(BUILD_DIR, 'index.html');

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/api/meta', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.json(versions.getMeta());
});

app.get('/api/chapter', (req, res) => {
  const versionId = req.query.v === undefined ? 'as' : String(req.query.v);
  const rawChapter = req.query.c === undefined ? '1' : String(req.query.c);

  if (!versions.isValidVersion(versionId)) {
    return res.status(400).json({
      error: `Invalid version "${versionId}". Valid versions: ${versions.VERSIONS.map((v) => v.id).join(', ')}`,
    });
  }

  const chapterNum = versions.parseChapterNumber(rawChapter);
  if (chapterNum === null) {
    return res.status(400).json({
      error: `Invalid chapter "${rawChapter}". Expected an integer between 1 and ${versions.TOTAL_CHAPTERS}.`,
    });
  }

  const payload = versions.getChapter(versionId, chapterNum);
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.json(payload);
});

// Legacy endpoints preserved for backwards compatibility
app.get('/m', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.json(versions.getLegacyTitles());
});

app.get('/c', (req, res) => {
  const versionId = req.query.v === undefined ? 'as' : String(req.query.v);
  const rawChapter = req.query.c === undefined ? '1' : String(req.query.c);

  if (!versions.isValidVersion(versionId)) {
    return res.status(400).json({ error: `Invalid version "${versionId}".` });
  }

  const chapterNum = versions.parseChapterNumber(rawChapter);
  if (chapterNum === null) {
    return res.status(400).json({ error: `Invalid chapter "${rawChapter}".` });
  }

  const payload = versions.getLegacyChapter(versionId, chapterNum);
  res.setHeader('Cache-Control', 'public, max-age=3600');
  return res.json(payload);
});

if (fs.existsSync(BUILD_DIR)) {
  app.use(express.static(BUILD_DIR));
}

app.get('*', (req, res) => {
  if (!fs.existsSync(INDEX_HTML)) {
    return res.status(404).send('Frontend build not found. Run npm run build first.');
  }
  return res.sendFile(INDEX_HTML);
});

if (require.main === module) {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Beowulf server listening on port ${PORT}`);
  });
}

module.exports = app;
