import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getChapterPayload,
  getLegacyChapterPayload,
  getLegacyChapterTitles,
  getReaderMetadata,
  isValidVersion,
  parseChapterNumber,
  TOTAL_CHAPTERS,
  VERSIONS,
} from './server/versions.js';

const CURRENT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(CURRENT_DIR, '..');
const BUILD_DIR = path.join(PROJECT_ROOT, 'build');
const INDEX_HTML_PATH = path.join(BUILD_DIR, 'index.html');
const CACHE_CONTROL_HEADER = 'public, max-age=3600';

export const app = express();

app.use((_request: Request, response: Response, next: NextFunction) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/api/meta', (_request: Request, response: Response) => {
  response.setHeader('Cache-Control', CACHE_CONTROL_HEADER);
  response.json(getReaderMetadata());
});

app.get('/api/chapter', (request: Request, response: Response) => {
  const versionId =
    request.query.v === undefined ? 'as' : String(request.query.v);
  const chapterParam =
    request.query.c === undefined ? '1' : String(request.query.c);

  if (!isValidVersion(versionId)) {
    const validIds = VERSIONS.map((item) => item.id).join(', ');
    response.status(400).json({
      error: `Invalid version "${versionId}". Valid versions: ${validIds}`,
    });
    return;
  }

  const chapterNumber = parseChapterNumber(chapterParam);
  if (chapterNumber === null) {
    response.status(400).json({
      error: `Invalid chapter "${chapterParam}". Expected an integer between 1 and ${TOTAL_CHAPTERS}.`,
    });
    return;
  }

  response.setHeader('Cache-Control', CACHE_CONTROL_HEADER);
  response.json(getChapterPayload(versionId, chapterNumber));
});

app.get('/m', (_request: Request, response: Response) => {
  response.setHeader('Cache-Control', CACHE_CONTROL_HEADER);
  response.json(getLegacyChapterTitles());
});

app.get('/c', (request: Request, response: Response) => {
  const versionId =
    request.query.v === undefined ? 'as' : String(request.query.v);
  const chapterParam =
    request.query.c === undefined ? '1' : String(request.query.c);

  if (!isValidVersion(versionId)) {
    response.status(400).json({ error: `Invalid version "${versionId}".` });
    return;
  }

  const chapterNumber = parseChapterNumber(chapterParam);
  if (chapterNumber === null) {
    response.status(400).json({ error: `Invalid chapter "${chapterParam}".` });
    return;
  }

  response.setHeader('Cache-Control', CACHE_CONTROL_HEADER);
  response.json(getLegacyChapterPayload(versionId, chapterNumber));
});

if (fs.existsSync(BUILD_DIR)) {
  app.use(express.static(BUILD_DIR));
}

app.get('*', (_request: Request, response: Response) => {
  if (!fs.existsSync(INDEX_HTML_PATH)) {
    response
      .status(404)
      .send('Frontend build not found. Run npm run build:client first.');
    return;
  }
  response.sendFile(INDEX_HTML_PATH);
});

startServerIfEntrypoint();

function startServerIfEntrypoint(): void {
  const entryScript = process.argv[1];
  if (!entryScript) {
    return;
  }
  if (path.resolve(entryScript) !== fileURLToPath(import.meta.url)) {
    return;
  }
  const port = process.env.PORT || 8080;
  app.listen(port, () => {
    console.log(`Beowulf server listening on port ${port}`);
  });
}
