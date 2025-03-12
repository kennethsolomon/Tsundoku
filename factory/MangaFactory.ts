import { MangaServiceInterface } from '@/interfaces/MangaServiceInterface';
import { mangaDexService } from '@/services/mangadexService';
import { mangaHereService } from '@/services/mangahereService';

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

	public getMangaService(provider: string): MangaServiceInterface {
		const service = this.providers.find((p) => p.name === provider)?.service;
		if (!service) {
			throw new Error(`Provider ${provider} not found`);
		}
		return service;
	}
}