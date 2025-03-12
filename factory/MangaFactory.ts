import { MangaServiceInterface } from '@/interfaces/MangaServiceInterface';
import { mangaDexService } from '@/services/mangadexService';
import { mangaHereService } from '@/services/mangahereService';
import { StorageService } from '@/services/storageService';

export class MangaFactory {
	private providers: { name: string; service: MangaServiceInterface }[] = [];

	constructor() {
		this.providers = [
			{
				name: 'mangadex',
				service: mangaDexService,
			},
			{
				name: 'mangahere',
				service: mangaHereService,
			},
		];
	}

	public async getMangaService(): Promise<MangaServiceInterface> {
		const mangaSource = await StorageService.getMangaSource();
		const serviceProvider = mangaSource;
		const service = this.providers.find((p) => p.name === serviceProvider)?.service;
		if (!service) {
			throw new Error(`Provider ${serviceProvider} not found`);
		}
		return service;
	}
}