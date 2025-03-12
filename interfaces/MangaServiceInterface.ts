// Base interfaces
export interface BaseChapter {
	img: string;
	page: number;
	width: number;
	height: number;
}

export interface BaseChapterPage {
	img: string;
	page: number;
}

// Optional headers for sources that need them
export interface WithHeaders {
	headerForImage?: {
		Referer: string;
	};
}

// Combined interfaces
export type Chapter = BaseChapter & WithHeaders;
export type ChapterPage = BaseChapterPage & WithHeaders;

// Source-specific interfaces (for type safety)
export interface MangaHereChapter extends BaseChapter {
	headerForImage: {
		Referer: string;
	};
}

export interface MangaHereChapterPage extends BaseChapterPage {
	headerForImage: {
		Referer: string;
	};
}

export interface MangaDexChapter extends BaseChapter {
	// Add MangaDex specific properties here if needed
}

export interface MangaDexChapterPage extends BaseChapterPage {
	// Add MangaDex specific properties here if needed
}

export interface MangaServiceInterface {
	searchManga(searchString: string): Promise<any>;
	getMangaInfo(id: string): Promise<any>;
	getChapters(mangaId: string): Promise<ChapterPage[]>;
}