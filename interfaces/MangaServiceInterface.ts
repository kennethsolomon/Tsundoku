export interface MangaServiceInterface {
	searchManga(searchString: string): Promise<any>;
	getMangaInfo(id: string): Promise<any>;
	getChapters(mangaId: string): Promise<any>;
}