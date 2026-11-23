import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App } from './App';
import { ChapterPayload, ReaderMetadata } from './types';

const MOCK_METADATA: ReaderMetadata = {
  totalChapters: 43,
  versions: [
    {
      id: 'as',
      name: 'Old English (Original)',
      shortName: 'Old English',
      translator: 'Cotton MS Vitellius A.xv',
      year: 'c. 700–1000',
      form: 'Old English',
      isProse: false,
      license: 'Public Domain',
      licenseUrl: 'https://www.gutenberg.org/policy/license.html',
      description: 'Plain Old English text.',
      sourceLabel: 'Old English Edition',
      sourceUrl: 'https://www.gutenberg.org/ebooks/9700',
    },
    {
      id: 'g',
      name: 'Francis B. Gummere (1910)',
      shortName: 'Gummere',
      translator: 'Francis Barton Gummere',
      year: '1910',
      form: 'Verse',
      isProse: false,
      license: 'Public Domain',
      licenseUrl: 'https://www.gutenberg.org/policy/license.html',
      description: 'Alliterative verse.',
      sourceLabel: 'Project Gutenberg #981',
      sourceUrl: 'https://www.gutenberg.org/ebooks/981',
    },
  ],
  chapters: [
    {
      number: 1,
      roman: 'I',
      title: 'The Life and Death of Scyld',
      lineStart: 1,
      lineEnd: 52,
    },
    {
      number: 2,
      roman: 'II',
      title: "Scyld's Successors",
      lineStart: 53,
      lineEnd: 114,
    },
    {
      number: 5,
      roman: 'V',
      title: 'The Geats Reach Heorot',
      lineStart: 258,
      lineEnd: 319,
    },
  ],
};

function createChapterResponse(
  versionId: string,
  chapterParam: string
): ChapterPayload {
  const chapter =
    MOCK_METADATA.chapters.find(
      (item) => item.number === Number(chapterParam)
    ) || MOCK_METADATA.chapters[0];
  const isGummere = versionId === 'g';
  return {
    version: versionId,
    chapter: chapter.number,
    roman: chapter.roman,
    title: chapter.title,
    lineStart: chapter.lineStart,
    lineEnd: chapter.lineEnd,
    isProse: false,
    form: isGummere ? 'Verse' : 'Old English',
    text: isGummere
      ? `LO, praise of chapter ${chapter.number}`
      : `Hwæt chapter ${chapter.number}`,
    sidenotes: [
      {
        id: `${chapter.number}-0`,
        position: 0,
        lineIndex: 0,
        text: `Note for chapter ${chapter.number}`,
      },
    ],
  };
}

beforeEach(() => {
  window.localStorage.clear();
  window.scrollTo = jest.fn();
  global.fetch = jest.fn((input: RequestInfo | URL) => {
    const parsedUrl = new URL(String(input), 'http://localhost');
    if (parsedUrl.pathname === '/api/meta') {
      return Promise.resolve({
        ok: true,
        json: async () => MOCK_METADATA,
      } as Response);
    }
    if (parsedUrl.pathname === '/api/chapter') {
      const versionId = parsedUrl.searchParams.get('v') || 'as';
      const chapterParam = parsedUrl.searchParams.get('c') || '1';
      return Promise.resolve({
        ok: true,
        json: async () => createChapterResponse(versionId, chapterParam),
      } as Response);
    }
    return Promise.resolve({ ok: false, status: 404 } as Response);
  }) as jest.Mock;
});

afterEach(() => {
  jest.resetAllMocks();
});

test('renders initial chapter and hydrates URL query parameters', async () => {
  render(
    <MemoryRouter initialEntries={['/?c=5&v=g']}>
      <App />
    </MemoryRouter>
  );

  expect(
    await screen.findByText(/LO, praise of chapter 5/i)
  ).toBeInTheDocument();
  expect(
    screen.getByRole('heading', { name: /The Geats Reach Heorot/i })
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Gummere/i })).toBeInTheDocument();
});

test('navigates between chapters and switches translations', async () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );

  expect(await screen.findByText(/Hwæt chapter 1/i)).toBeInTheDocument();

  userEvent.click(screen.getByRole('button', { name: /Next chapter/i }));
  expect(await screen.findByText(/Hwæt chapter 2/i)).toBeInTheDocument();

  userEvent.click(screen.getByRole('button', { name: /Old English/i }));
  userEvent.click(
    screen.getByRole('menuitem', { name: /Francis B\. Gummere/i })
  );
  expect(
    await screen.findByText(/LO, praise of chapter 2/i)
  ).toBeInTheDocument();
});

test('toggles side-by-side compare mode', async () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );

  expect(await screen.findByText(/Hwæt chapter 1/i)).toBeInTheDocument();

  userEvent.click(screen.getByRole('button', { name: /Compare/i }));

  await waitFor(() => {
    expect(screen.getByLabelText('Primary translation')).toBeInTheDocument();
    expect(screen.getByLabelText('Comparison translation')).toBeInTheDocument();
  });
  expect(
    await screen.findByText(/LO, praise of chapter 1/i)
  ).toBeInTheDocument();
});

test('opens marginal note popover and settings drawer', async () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>
  );

  expect(await screen.findByText(/Hwæt chapter 1/i)).toBeInTheDocument();

  userEvent.click(screen.getByRole('button', { name: /Marginal note 1/i }));
  expect(
    await screen.findByRole('dialog', { name: /Marginal gloss/i })
  ).toBeInTheDocument();
  expect(screen.getByText(/Note for chapter 1/i)).toBeInTheDocument();

  userEvent.click(
    screen.getByRole('button', { name: /Reader settings and sources/i })
  );
  expect(
    await screen.findByRole('heading', { name: /Settings & Sources/i })
  ).toBeInTheDocument();
});
