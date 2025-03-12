import axios from 'axios';
import { MangaServiceInterface } from '@/interfaces/MangaServiceInterface';
import { config } from '@/config';

class MangaDexService implements MangaServiceInterface {
	private readonly baseUrl: string = config('env.API_BASE_URL') + '/manga/mangadex';

	async searchManga(searchString: string): Promise<any> {
		try {
			console.log(`${this.baseUrl}/${searchString}`);
			const response = await axios.get(`${this.baseUrl}/${searchString}`);
			return response.data;
		} catch (error) {
			console.error('Error searching manga:', error);
			throw error;
		}
	}

	async getMangaInfo(id: string): Promise<any> {
		try {
			console.log(`${this.baseUrl}/info/${id}`);
			const response = await axios.get(`${this.baseUrl}/info/${id}`);
			return response.data;
		} catch (error) {
			console.error('Error getting manga info:', error);
			throw error;
		}
	}

	async getChapters(mangaId: string): Promise<any> {
		try {
			console.log(`${this.baseUrl}/read/${mangaId}`);
			const response = await axios.get(`${this.baseUrl}/read/${mangaId}`);
			return response.data;
		} catch (error) {
			console.error('Error getting chapters:', error);
			throw error;
		}
	}
}

export const mangaDexService = new MangaDexService();
