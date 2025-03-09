import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = '@tachiyomi:bookmarks';
const READ_CHAPTERS_KEY = '@tachiyomi:readChapters';
export interface BookmarkItem {
	id: string;
	title: string;
	image: string;
	description: string;
	dateAdded: number;
}

export class StorageService {
	static async getBookmarks(): Promise<BookmarkItem[]> {
		try {
			const bookmarksJson = await AsyncStorage.getItem(BOOKMARKS_KEY);
			return bookmarksJson ? JSON.parse(bookmarksJson) : [];
		} catch (error) {
			console.error('Error getting bookmarks:', error);
			return [];
		}
	}

	static async addBookmark(manga: BookmarkItem): Promise<boolean> {
		try {
			const bookmarks = await this.getBookmarks();
			if (!bookmarks.some(b => b.id === manga.id)) {
				bookmarks.push({
					...manga,
					dateAdded: Date.now()
				});
				await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
				return true;
			}
			return false;
		} catch (error) {
			console.error('Error adding bookmark:', error);
			return false;
		}
	}

	static async removeBookmark(mangaId: string): Promise<boolean> {
		try {
			const bookmarks = await this.getBookmarks();
			const filteredBookmarks = bookmarks.filter(b => b.id !== mangaId);
			await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filteredBookmarks));
			return true;
		} catch (error) {
			console.error('Error removing bookmark:', error);
			return false;
		}
	}

	static async isBookmarked(mangaId: string): Promise<boolean> {
		try {
			const bookmarks = await this.getBookmarks();
			return bookmarks.some(b => b.id === mangaId);
		} catch (error) {
			console.error('Error checking bookmark status:', error);
			return false;
		}
	}

	// Read Chapters
	static async getReadChapters(mangaId: string): Promise<string[]> {
		try {
			const readChapters = await AsyncStorage.getItem(READ_CHAPTERS_KEY);
			const filteredReadChapters = readChapters ? JSON.parse(readChapters).filter((chapter: any) => chapter.id !== mangaId) : [];
			return filteredReadChapters;
		} catch (error) {
			console.error('Error getting read chapters:', error);
			return [];
		}
	}

	static async addReadChapter(mangaId: string, chapterId: string): Promise<boolean> {
		try {
			const readChapters = await this.getReadChapters(mangaId);
			if (!readChapters.includes(chapterId)) {
				readChapters.push(chapterId);
				await AsyncStorage.setItem(READ_CHAPTERS_KEY, JSON.stringify(readChapters));
				// Log data for debugging in emulator
				console.log('Saved read chapters:', await AsyncStorage.getItem(READ_CHAPTERS_KEY));
				return true;
			}
			return false;
		} catch (error) {
			console.error('Error adding read chapter:', error);
			return false;
		}
	}

	static async isRead(mangaId: string, chapterId: string): Promise<boolean> {
		try {
			const readChapters = await this.getReadChapters(mangaId);
			return readChapters.includes(chapterId);
		} catch (error) {
			console.error('Error checking read status:', error);
			return false;
		}
	}

	static async removeReadChapter(mangaId: string, chapterId: string): Promise<boolean> {
		try {
			const readChapters = await this.getReadChapters(mangaId);
			const filteredReadChapters = readChapters.filter(b => b !== chapterId);
			await AsyncStorage.setItem(READ_CHAPTERS_KEY, JSON.stringify(filteredReadChapters));
			return true;
		} catch (error) {
			console.error('Error removing read chapter:', error);
			return false;
		}
	}
}
