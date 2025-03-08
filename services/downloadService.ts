import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

const DOWNLOADS_KEY = '@downloads';
const DOWNLOAD_DIR = `${FileSystem.documentDirectory}downloads/`;

export interface DownloadedChapter {
	mangaId: string;
	chapterId: string;
	title: string;
	chapterNumber: string;
	pages: string[]; // Array of local file URIs
	dateDownloaded: number;
	mangaInfo?: any; // Store manga details for offline access
}

interface DownloadProgress {
	[key: string]: {
		progress: number;
		status: 'pending' | 'downloading' | 'completed' | 'error';
	};
}

class DownloadService {
	private downloadProgress: DownloadProgress = {};

	constructor() {
		this.ensureDownloadDirectory();
	}

	private async ensureDownloadDirectory() {
		const dirInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
		if (!dirInfo.exists) {
			await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
		}
	}

	async getDownloadedChapters(): Promise<DownloadedChapter[]> {
		try {
			const downloadsJson = await AsyncStorage.getItem(DOWNLOADS_KEY);
			return downloadsJson ? JSON.parse(downloadsJson) : [];
		} catch (error) {
			console.error('Error getting downloaded chapters:', error);
			return [];
		}
	}

	async getMangaInfo(mangaId: string): Promise<any | null> {
		try {
			const downloads = await this.getDownloadedChapters();
			const chapter = downloads.find(d => d.mangaId === mangaId);
			return chapter?.mangaInfo || null;
		} catch (error) {
			console.error('Error getting manga info:', error);
			return null;
		}
	}

	async isChapterDownloaded(chapterId: string): Promise<boolean> {
		const downloads = await this.getDownloadedChapters();
		return downloads.some(chapter => chapter.chapterId === chapterId);
	}

	async hasMangaDownloads(mangaId: string): Promise<boolean> {
		const downloads = await this.getDownloadedChapters();
		return downloads.some(chapter => chapter.mangaId === mangaId);
	}

	getDownloadProgress(chapterId: string) {
		return this.downloadProgress[chapterId] || { progress: 0, status: 'pending' };
	}

	async downloadChapter(
		mangaId: string,
		chapterId: string,
		title: string,
		chapterNumber: string,
		pages: { img: string; page: number }[],
		mangaInfo?: any
	): Promise<boolean> {
		try {
			// Initialize download progress
			this.downloadProgress[chapterId] = { progress: 0, status: 'downloading' };

			const downloads = await this.getDownloadedChapters();

			// Check if already downloaded
			if (downloads.some(d => d.chapterId === chapterId)) {
				return true;
			}

			const downloadedPages: string[] = [];
			const totalPages = pages.length;

			// Download each page
			for (let i = 0; i < pages.length; i++) {
				const page = pages[i];
				const filename = `${chapterId}_${page.page}.jpg`;
				const fileUri = `${DOWNLOAD_DIR}${filename}`;

				try {
					// Download the image
					await FileSystem.downloadAsync(page.img, fileUri);
					downloadedPages.push(fileUri);

					// Update progress
					this.downloadProgress[chapterId] = {
						progress: ((i + 1) / totalPages) * 100,
						status: 'downloading'
					};
				} catch (error) {
					console.error(`Error downloading page ${page.page}:`, error);
					throw error;
				}
			}

			// Save download info
			const downloadedChapter: DownloadedChapter = {
				mangaId,
				chapterId,
				title,
				chapterNumber,
				pages: downloadedPages,
				dateDownloaded: Date.now(),
				mangaInfo // Store manga info with the first downloaded chapter
			};

			downloads.push(downloadedChapter);
			await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(downloads));

			// Update final status
			this.downloadProgress[chapterId] = { progress: 100, status: 'completed' };
			return true;
		} catch (error) {
			console.error('Error downloading chapter:', error);
			this.downloadProgress[chapterId] = { progress: 0, status: 'error' };
			return false;
		}
	}

	async deleteDownloadedChapter(chapterId: string): Promise<boolean> {
		try {
			const downloads = await this.getDownloadedChapters();
			const chapter = downloads.find(d => d.chapterId === chapterId);

			if (!chapter) {
				return false;
			}

			// Delete all downloaded page files
			for (const pageUri of chapter.pages) {
				try {
					await FileSystem.deleteAsync(pageUri);
				} catch (error) {
					console.error(`Error deleting page ${pageUri}:`, error);
				}
			}

			// Update downloads list
			const updatedDownloads = downloads.filter(d => d.chapterId !== chapterId);
			await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(updatedDownloads));

			return true;
		} catch (error) {
			console.error('Error deleting downloaded chapter:', error);
			return false;
		}
	}
}

export const downloadService = new DownloadService();