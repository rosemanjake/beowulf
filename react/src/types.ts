export type FontSize = 'sm' | 'md' | 'lg';

export interface VersionMetadata {
  id: string;
  name: string;
  shortName: string;
  translator: string;
  year: string;
  form: string;
  isProse: boolean;
  license: string;
  licenseUrl: string;
  description: string;
  sourceLabel: string;
  sourceUrl: string;
}

export interface ChapterMetadata {
  number: number;
  roman: string;
  title: string;
  lineStart: number;
  lineEnd: number;
}

export interface ReaderMetadata {
  totalChapters: number;
  versions: VersionMetadata[];
  chapters: ChapterMetadata[];
}

export interface SideNote {
  id: string;
  position: number;
  lineIndex: number;
  text: string;
}

export interface ChapterPayload {
  version: string;
  chapter: number;
  roman: string;
  title: string;
  lineStart: number;
  lineEnd: number;
  isProse: boolean;
  form: string;
  text: string;
  sidenotes: SideNote[];
}

export interface ReadingPreferences {
  fontSize: FontSize;
  showLineNumbers: boolean;
  showSideNotes: boolean;
}
