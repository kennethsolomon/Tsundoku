import { View, Text, SafeAreaView, Image, TouchableOpacity, FlatList, RefreshControl, Alert, ActivityIndicator, ScrollView } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGlobalContext } from '@/contexts/GlobalStateContext';
import { MangaFactory } from '@/factory/MangaFactory';
import MangaDetail from '@/components/MangaDetail';
import { getDescription } from '@/utils/common';
const Detail = () => {
	const { query } = useLocalSearchParams();
	const [expanded, setExpanded] = useState(false);
	const { setSelectedChapter,
		setSelectedManga,
		downloadChapter,
		deleteDownload,
		isChapterDownloaded,
		getDownloadProgress,
		getMangaInfoOffline,
		hasMangaDownloads,
		isRead,
		removeReadChapter,
		addReadChapter } = useGlobalContext();
	const [manga, setManga] = useState<any>(null);
	const [downloadStates, setDownloadStates] = useState<{ [key: string]: boolean }>({});
	const [readStates, setReadStates] = useState<{ [key: string]: boolean }>({});
	const [downloadProgresses, setDownloadProgresses] = useState<{ [key: string]: number }>({});
	const [downloadStatuses, setDownloadStatuses] = useState<{ [key: string]: 'pending' | 'downloading' | 'completed' | 'error' }>({});
	const [isOfflineMode, setIsOfflineMode] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = async () => {
		setRefreshing(true);
		await getMangaInfo();
		setRefreshing(false);
	};

	async function getMangaInfo() {
		const factory = new MangaFactory();
		const service = await factory.getMangaService();

		if (!service) return;

		setError(null);
		setIsLoading(true);
		try {
			// First check if we have offline access to this manga
			const hasOfflineAccess = await hasMangaDownloads(query as string);
			if (hasOfflineAccess) {
				const offlineMangaInfo = await getMangaInfoOffline(query as string);
				if (offlineMangaInfo) {
					setManga(offlineMangaInfo);
					setIsOfflineMode(true);
					setIsLoading(false);
					return;
				}
			}

			// If no offline access or no offline info, fetch from API
			const mangaInfo = await service.getMangaInfo(query as string);
			if (!mangaInfo) {
				throw new Error('Failed to fetch manga information');
			}
			setManga(mangaInfo);
			setIsOfflineMode(false);
		} catch (error) {
			console.error('Error fetching manga info:', error);
			setError('Failed to load manga information. Please check your internet connection.');
		} finally {
			setIsLoading(false);
		}
	}

	async function getChapters(chapterId: string) {
		const factory = new MangaFactory();
		const service = await factory.getMangaService();

		const chapters = await service.getChapters(chapterId);
		return chapters;
	}

	function handleStartReading(chapter: any) {
		setSelectedChapter(chapter);
		setSelectedManga(manga);
		const encodedChapterId = encodeURIComponent(chapter.id);
		router.push(`/read/${encodedChapterId}`);
	}

	useEffect(() => {
		getMangaInfo();
	}, [query]);

	useEffect(() => {
		if (manga?.chapters) {
			checkDownloadStates();
			checkReadStates();
		}
	}, [manga, readStates]);

	useEffect(() => {
		const interval = setInterval(() => {
			if (manga?.chapters) {
				manga.chapters.forEach((chapter: any) => {
					const progress = getDownloadProgress(chapter.id);
					setDownloadProgresses(prev => ({
						...prev,
						[chapter.id]: progress.progress
					}));
					setDownloadStatuses(prev => ({
						...prev,
						[chapter.id]: progress.status
					}));
				});
			}
		}, 500);

		return () => clearInterval(interval);
	}, [manga, getDownloadProgress]);

	const checkDownloadStates = async () => {
		if (!manga?.chapters) return;

		const states: { [key: string]: boolean } = {};
		for (const chapter of manga.chapters) {
			states[chapter.id] = await isChapterDownloaded(chapter.id);
		}
		setDownloadStates(states);
	};

	const checkReadStates = async () => {
		if (!manga?.chapters) return;

		const states: { [key: string]: boolean } = {};
		for (const chapter of manga.chapters) {
			states[chapter.id] = await isRead(manga.id, chapter.id);
		}
		setReadStates(states);
	};

	const handleRead = async (mangaId: string, chapterId: string) => {
		if (readStates[chapterId]) {
			await removeReadChapter(mangaId, chapterId);
		} else {
			await addReadChapter(mangaId, chapterId);
		}
	};

	const handleDownload = async (chapter: any) => {
		try {
			const isDownloaded = downloadStates[chapter.id];
			if (isDownloaded) {
				Alert.alert(
					'Delete Download',
					`Are you sure you want to delete the downloaded chapter "${chapter.title}"?`,
					[
						{
							text: 'Cancel',
							style: 'cancel'
						},
						{
							text: 'Delete',
							style: 'destructive',
							onPress: async () => {
								await deleteDownload(chapter.id);
								setDownloadStates(prev => ({
									...prev,
									[chapter.id]: false
								}));
							}
						}
					]
				);
			} else {
				// First fetch the chapter pages
				try {
					const chapterPages = await getChapters(chapter.id);
					if (!chapterPages || chapterPages.length === 0) {
						throw new Error('No pages found for this chapter');
					}

					// Now download with the fetched pages
					const success = await downloadChapter(manga, {
						...chapter,
						pages: chapterPages
					});

					if (success) {
						setDownloadStates(prev => ({
							...prev,
							[chapter.id]: true
						}));
					} else {
						throw new Error('Failed to download chapter');
					}
				} catch (error) {
					console.error('Error fetching chapter pages:', error);
					Alert.alert('Error', 'Failed to download chapter. Please try again.');
				}
			}
		} catch (error) {
			console.error('Error handling download:', error);
			Alert.alert('Error', 'Failed to download chapter. Please try again.');
		}
	};

	if (isLoading && !refreshing) {
		return (
			<View className="flex-1 items-center justify-center bg-black">
				<ActivityIndicator size="large" color="#FFA001" />
			</View>
		);
	}

	if (error) {
		return (
			<View className="flex-1 justify-center items-center bg-black">
				<View className="px-4 py-8 items-center">
					<MaterialCommunityIcons name="alert-circle" color="#FFA001" size={64} />
					<Text className="text-white text-xl font-bold mt-4">Something went wrong!</Text>
					<Text className="text-slate-400 text-center mt-2">{error}</Text>
					<TouchableOpacity
						className="mt-4 bg-slate-900 rounded-full px-6 py-3"
						onPress={() => getMangaInfo()}
					>
						<View className="flex-row items-center gap-2">
							<MaterialCommunityIcons name="refresh" color="#FFA001" size={24} />
							<Text className="text-white font-bold">Try Again</Text>
						</View>
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	if (!manga) {
		return (
			<View className="flex-1 justify-center items-center bg-black">
				<Text className="text-white text-xl">No manga found</Text>
			</View>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-black">
			<View className="flex-1 px-4">
				<MangaDetail manga={manga} className='mt-4' />

				<View className='mt-4'>
					<View>
						<Text className='text-white text-xl font-bold'>About this manga</Text>
						<Text className={`text-slate-400 mt-2 ${!expanded ? 'line-clamp-3' : ''}`}>
							{getDescription(manga?.description)}
						</Text>
					</View>
					<View className="flex items-end">
						<TouchableOpacity onPress={() => setExpanded(!expanded)}>
							<Text className="text-amber-500 mt-1">{expanded ? 'See less' : 'See more'}</Text>
						</TouchableOpacity>
					</View>
				</View>

				<TouchableOpacity
					className='bg-amber-500 p-3 rounded-3xl mt-4'
					onPress={() => {
						if (manga?.chapters?.length > 0) {
							handleStartReading(manga.chapters[0]);
						}
					}}
				>
					<Text className="text-white text-center text-md font-semibold">Start Reading</Text>
				</TouchableOpacity>

				<FlatList
					className='mt-2'
					data={manga?.chapters || []}
					renderItem={({ item }) => (
						<TouchableOpacity
							onPress={() => handleStartReading(item)}
							onLongPress={() => {
								Alert.alert(
									'Options',
									`What would you like to do with ${item.title}?`,
									[
										{
											text: readStates[item.id] ? '🗑️ Remove from Read' : '👀 Mark as Read',
											onPress: () => handleRead(manga.id, item.id),
											style: readStates[item.id] ? 'destructive' : 'default'
										},
										{
											text: 'Cancel',
											style: 'cancel'
										}
									]
								);
							}}
						>
							<View className={`flex flex-row justify-between items-center rounded-lg ${readStates[item.id] ? 'bg-slate-800/50' : ''}`}>
								<View className='h-20'>
									<View className='flex-1 justify-center mx-4'>
										<View className="flex-row items-center">
											<Text className='text-white text-lg font-semibold max-w-[70vw] mr-2'>{item.title}</Text>
											{readStates[item.id] && (
												<MaterialCommunityIcons name="eye" size={20} color="#FFA001" style={{ opacity: 0.7 }} />
											)}
										</View>
										<Text className='text-slate-400 text-sm'>Chapter: {item.chapterNumber}</Text>
										{downloadStatuses[item.id] === 'downloading' && (
											<Text className='text-amber-500 text-xs mt-1'>
												Downloading... {Math.round(downloadProgresses[item.id])}%
											</Text>
										)}
									</View>
								</View>
								{/* Download Button */}
								<TouchableOpacity
									className="bg-slate-900 rounded-full p-2 mx-4"
									onPress={() => handleDownload(item)}
									disabled={downloadStatuses[item.id] === 'downloading'}
								>
									<View>
										{downloadStates[item.id] ? (
											<MaterialCommunityIcons name="check-circle" color="#22C55E" size={24} />
										) : downloadStatuses[item.id] === 'downloading' ? (
											<ActivityIndicator size="small" color="#FFA001" />
										) : downloadStatuses[item.id] === 'error' ? (
											<MaterialCommunityIcons name="alert" color="#EF4444" size={24} />
										) : (
											<MaterialCommunityIcons name="download" color="#FFA001" size={24} />
										)}
									</View>
								</TouchableOpacity>

							</View>
						</TouchableOpacity>
					)}
					ItemSeparatorComponent={() => <View className='h-[1px] bg-slate-700 mx-2' />}
					ListEmptyComponent={() => (
						<View className="px-4 py-8 items-center">
							<MaterialCommunityIcons name="book-open-variant" color="#FFA001" size={64} />
							<Text className="text-white text-xl font-bold mt-4">Oops! This shelf is empty</Text>
							<Text className="text-slate-400 text-center mt-2">Looks like there aren't any chapters available yet. Check back later!</Text>
						</View>
					)}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
					}
					initialNumToRender={10}
					maxToRenderPerBatch={10}
					removeClippedSubviews={true}
				/>
			</View>
		</SafeAreaView>
	)
}

export default Detail