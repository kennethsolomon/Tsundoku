import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = '@tachiyomi:bookmarks';

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
}
