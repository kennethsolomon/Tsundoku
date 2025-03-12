import axios from 'axios';
import { MangaServiceInterface } from '@/interfaces/MangaServiceInterface';
import { config } from '@/config';

class MangaHereService implements MangaServiceInterface {
	private readonly baseUrl: string = config('env.API_BASE_URL') + '/manga/mangahere';

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
			console.log(`${this.baseUrl}/info?id=${id}`);
			const response = await axios.get(`${this.baseUrl}/info?id=${id}`);
			console.log(response);
			return response.data;
		} catch (error) {
			console.error('Error getting manga info:', error);
			throw error;
		}
	}

	async getChapters(mangaId: string): Promise<any> {
		try {
			console.log(`${this.baseUrl}/read?chapterId=${mangaId}`);
			const encodedMangaId = encodeURIComponent(mangaId);
			const response = await axios.get(`${this.baseUrl}/read?chapterId=${encodedMangaId}`);
			console.log('Manga Here Chapters');

			// Transform the image URLs
			const transformedData = response.data.map((item: any) => ({
				...item,
				img: item.img.replace('zjcdn.mangahere.org', 'zjcdn.mangahere.cc'),
				headerForImage: {
					Referer: item.headerForImage.Referer.replace('zjcdn.mangahere.org', 'zjcdn.mangahere.cc')
				}
			}));

			console.log(transformedData);
			return transformedData;
		} catch (error) {
			console.error('Error getting chapters:', error);
			throw error;
		}
	}
}

export const mangaHereService = new MangaHereService();
