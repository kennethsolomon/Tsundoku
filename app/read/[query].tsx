import { View, Text, SafeAreaView, Image, TouchableOpacity, Dimensions, FlatList, RefreshControl } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGlobalContext } from '@/contexts/GlobalStateContext';
import MangaDetail from '@/components/MangaDetail';
import { Chapter as IChapter, ChapterPage as IChapterPage } from '@/interfaces/MangaServiceInterface';
import { MangaFactory } from '@/factory/MangaFactory';

interface Chapter extends IChapter {}
interface ChapterPage extends IChapterPage {}

const Read = () => {
	const { query } = useLocalSearchParams();
	const { selectedChapter, selectedManga, setSelectedChapter, setSelectedManga, isChapterDownloaded, downloads, getDownloadProgress, addReadChapter, isRead } = useGlobalContext();
	const [isChapterListVisible, setIsChapterListVisible] = useState(false);
	const [chapters, setChapter] = useState<Chapter[]>([]);
	const [loading, setLoading] = useState(true);
	const [chapterId, setChapterId] = useState<string | null>(null);
	const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
	const [loadingProgress, setLoadingProgress] = useState(0);
	const [showNavigatorBar, setShowNavigatorBar] = useState(false);
	const [lastTap, setLastTap] = useState<number | null>(null);
	const [showMangaDetail, setShowMangaDetail] = useState(false);
	const [isOfflineMode, setIsOfflineMode] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [markedAsRead, setMarkedAsRead] = useState<boolean>(false);

	const win = Dimensions.get('window');
	const [mangaService, setMangaService] = useState<any>(null);

	// Initialize Chapter
	const fetchChapter = async () => {
		const factory = new MangaFactory();
		const service = await factory.getMangaService();
		setMangaService(service);

		if(!mangaService) return;

		setLoading(true);
		const readState = await isRead(selectedManga.id, chapterId ?? query as string);
		setMarkedAsRead(readState);
		setError(null);
		try {
			setLoadingProgress(0);
			const currentChapterId = chapterId ?? query as string;

			// Check if chapter is downloaded
			const isDownloaded = await isChapterDownloaded(currentChapterId);
			setIsOfflineMode(isDownloaded);

			let chapterPages: ChapterPage[] = [];
			if (isDownloaded) {
				// Use downloaded chapter
				const downloadedChapter = downloads.find((d: { chapterId: string }) => d.chapterId === currentChapterId);
				if (downloadedChapter) {
					chapterPages = downloadedChapter.pages.map((uri: string, index: number) => ({
						img: uri,
						page: index + 1
					}));
				} else {
					throw new Error('Downloaded chapter not found');
				}
			} else {
				// Fetch from API
				try {
					chapterPages = await mangaService?.getChapters(currentChapterId);
					if (!chapterPages || chapterPages.length === 0) {
						throw new Error('No pages found for this chapter');
					}
				} catch (error) {
					console.error('Error fetching chapter from API:', error);
					setError('Failed to load chapter. Please check your internet connection and try again.');
					setLoading(false);
					return;
				}
			}

			// Process initial batch of 5 images
			const processInitialBatch = async (startIndex: number, batchSize: number): Promise<Chapter[]> => {
				const batch = chapterPages.slice(startIndex, startIndex + batchSize);
				const processedBatch = batch.map((chapter: ChapterPage, index: number) => new Promise<Chapter>(async (resolve) => {
					try {
						// Use default dimensions based on screen size
						const defaultDimensions = {
							width: win.width,
							height: win.height * 1.5 // Portrait orientation for manga
						};

						// Try to get actual dimensions, but don't wait too long
						const getImageDimensions = () => new Promise<{ width: number; height: number }>((resolve, reject) => {
							const timeoutId = setTimeout(() => {
								console.warn('Image size detection timed out, using default dimensions');
								resolve(defaultDimensions);
							}, 3000); // 3 second timeout

							Image.getSize(
								chapter.img,
								(width, height) => {
									clearTimeout(timeoutId);
									resolve({ width, height });
								},
								(error) => {
									clearTimeout(timeoutId);
									console.warn('Failed to get image size:', error);
									resolve(defaultDimensions);
								}
							);
						});

						const { width, height } = await getImageDimensions();

						const ratio = win.width / width;
						const imageHeight = height * ratio;
						const imageWidth = win.width;

						setLoadingProgress(((startIndex + index + 1) / chapterPages.length) * 100);

						resolve({
							img: chapter.img,
							page: chapter.page,
							width: Math.round(imageWidth),
							height: Math.round(imageHeight),
							...(chapter.headerForImage && { headerForImage: chapter.headerForImage })
						});
					} catch (error) {
						console.error('Error processing image:', error);
						// Use portrait-oriented fallback size
						resolve({
							img: chapter.img,
							page: chapter.page,
							width: Math.round(win.width),
							height: Math.round(win.height * 1.4),
							...(chapter.headerForImage && { headerForImage: chapter.headerForImage })
						});
					}
				}));

				try {
					return await Promise.all(processedBatch);
				} catch (error) {
					console.error('Error processing images:', error);
					throw new Error('Failed to load chapter images');
				}
			};

			// Load initial batch
			const initialBatchSize = 3;
			const initialChapters = await processInitialBatch(0, initialBatchSize);
			setChapter(initialChapters);
			setLoading(false);

			// Process remaining images in background
			if (chapterPages.length > initialBatchSize) {
				const loadRemainingImages = async () => {
					try {
						for (let i = initialBatchSize; i < chapterPages.length; i += 2) {
							const nextBatch = await processInitialBatch(i, 2);
							setChapter(prev => [...prev, ...nextBatch]);
						}
					} catch (error) {
						console.error('Error loading remaining images:', error);
						setError('Some images failed to load. Please try refreshing.');
					}
				};
				loadRemainingImages();
			}
		} catch (error) {
			console.error('Error fetching chapter:', error);
			setError('Failed to load chapter. Please try again.');
			setLoading(false);
		}
	};

	useEffect(() => {
		setChapterId(selectedChapter.id);
		fetchChapter();
	}, [chapterId]);

	// Refresh
	const [refreshing, setRefreshing] = useState(false);
	const onRefresh = async () => {
		setRefreshing(true);
		await fetchChapter();
		setRefreshing(false);
	};

	// Navigation
	useEffect(() => {
		if (selectedManga?.chapters) {
			const index = selectedManga.chapters.findIndex((chapter: any) => chapter.id === selectedChapter.id);
			setCurrentChapterIndex(index);
		}
	}, [selectedChapter]);

	function handleChapterClick(chapter: any) {
		setSelectedChapter(chapter);
		setSelectedManga(selectedManga);
		setIsChapterListVisible(false);
		setChapterId(chapter.id);
	}

	const handlePreviousChapter = () => {
		if (currentChapterIndex > 0) {
			const previousChapter = selectedManga.chapters[currentChapterIndex - 1];
			handleChapterClick(previousChapter);
		}
	};

	const handleNextChapter = () => {
		if (currentChapterIndex < selectedManga.chapters.length - 1) {
			const nextChapter = selectedManga.chapters[currentChapterIndex + 1];
			handleChapterClick(nextChapter);
		}
	};

	// Loading or Error State
	if (loading || (refreshing && chapters.length === 0)) {
		return (
			<View className="flex-1 items-center justify-center bg-black">
				<View className="w-3/4">
					<View className="h-2 bg-gray-200 rounded-full">
						<View
							className="h-full bg-[#FFA001] rounded-full"
							style={{ width: `${loadingProgress}%` }}
						/>
					</View>
					<Text className="text-center mt-2 text-[#FFA001]">
						{isOfflineMode ? 'Loading offline chapter' : 'Loading chapter online'}... {Math.round(loadingProgress)}%
					</Text>
				</View>
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
						onPress={() => fetchChapter()}
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

	return (
		<SafeAreaView className="flex-1 bg-black">
			<View className="flex-1 relative">
				<View className="flex-1">
					<FlatList
						data={chapters}
						renderItem={({ item: chapter }) => (
							<TouchableOpacity
								activeOpacity={1}
								onPress={() => {
									if (lastTap && (new Date().getTime() - lastTap) < 300) {
										// Double tap
										setLastTap(null);
										if (showNavigatorBar && showMangaDetail) {
											// Hide both on double tap if both are showing
											setShowNavigatorBar(false);
											setShowMangaDetail(false);
										} else {
											// Show both on double tap
											setShowNavigatorBar(true);
											setShowMangaDetail(true);
										}
									} else {
										// Single tap
										setLastTap(new Date().getTime());
										if (!showMangaDetail) {
											// Only toggle navigation bar on single tap if manga detail is not shown
											setShowNavigatorBar(!showNavigatorBar);
										}
									}
								}}
								onLongPress={() => router.back()}
							>
								<Image
									source={{
										uri: chapter.img,
										...(chapter.headerForImage && { headers: chapter.headerForImage }),
										cache: 'force-cache'
									}}
									resizeMode="contain"
									style={{ width: chapter.width, height: chapter.height }}
								/>
							</TouchableOpacity>
						)}
						keyExtractor={(_, index) => index.toString()}
						refreshControl={
							<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
						}
						onViewableItemsChanged={({ viewableItems }) => {
							viewableItems.forEach(({ item }) => {
								if (!markedAsRead) {
									if (chapters.length === 1 || chapters.length === 2) {
										setMarkedAsRead(true);
										addReadChapter(selectedManga.id, chapterId ?? query as string);
									} else if (item.page === 3 && chapters.length >= 3) {
										setMarkedAsRead(true);
										addReadChapter(selectedManga.id, chapterId ?? query as string);
									}
								}
							});
						}}
						viewabilityConfig={{
							itemVisiblePercentThreshold: 50 // Item is considered visible when 50% or more is visible
						}}
						ListEmptyComponent={() => (
							<View className="px-4 py-8 items-center">
								<MaterialCommunityIcons name="book-open-variant" color="#FFA001" size={64} />
								<Text className="text-white text-xl font-bold mt-4">Oops! This shelf is empty</Text>
								<Text className="text-slate-400 text-center mt-2">Looks like there aren't any chapters available yet. Check back later!</Text>
							</View>
						)}
					/>
				</View>

				{/* Bottom controls container */}
				<View className="absolute bottom-0 left-0 right-0">
					{showMangaDetail && selectedManga?.chapters && (
						<View>
							<MangaDetail manga={selectedManga} className='bg-black w-full p-4' />
							<View className="h-[1px] bg-slate-700" />
						</View>
					)}

					{showNavigatorBar && selectedManga?.chapters && (
						<View className="bg-black py-4">
							<View className="flex flex-row justify-between items-center mx-12">
								<TouchableOpacity
									className="bg-slate-900 rounded-full p-2"
									onPress={handleNextChapter}
									disabled={currentChapterIndex === selectedManga?.chapters?.length - 1}
									style={{ opacity: currentChapterIndex === selectedManga?.chapters?.length - 1 ? 0.5 : 1 }}
								>
									<MaterialCommunityIcons name="arrow-left" color="#FFA001" size={24} />
								</TouchableOpacity>
								<TouchableOpacity
									activeOpacity={0.7}
									onPress={() => setIsChapterListVisible(!isChapterListVisible)}
									className="bg-slate-900 rounded-full p-2 w-full flex-1 mx-4">
									<View className="flex flex-row items-center gap-2 px-2 justify-between">
										<Text className="text-white text-lg font-bold">{selectedChapter?.title}</Text>
										<MaterialCommunityIcons name={isChapterListVisible ? "chevron-up" : "chevron-down"} color="#FFA001" size={24} />
									</View>
									{isChapterListVisible && selectedManga?.chapters && (
										<View className="bg-slate-900 absolute bottom-12 w-full p-2 rounded-lg left-2">
											<FlatList
												className="max-h-72 w-full"
												data={selectedManga?.chapters || []}
												keyExtractor={(_, index) => index.toString()}
												renderItem={({ item: chapter, index }) => (
													<View key={index}>
														<TouchableOpacity
															onPress={() => handleChapterClick(chapter)}
															key={index}>
															<View className="py-1">
																<Text className="text-white text-base text-center">Title: {chapter.title}</Text>
																<Text className="text-white text-base text-center">Chapter: {chapter.chapterNumber}</Text>
															</View>
														</TouchableOpacity>
														<View className="h-1 bg-slate-800" />
													</View>
												)}
												initialNumToRender={10}
												maxToRenderPerBatch={10}
												windowSize={5}
												removeClippedSubviews={true}
											/>
										</View>
									)}
								</TouchableOpacity>
								<TouchableOpacity
									className="bg-slate-900 rounded-full p-2"
									onPress={handlePreviousChapter}
									disabled={currentChapterIndex === 0}
									style={{ opacity: currentChapterIndex === 0 ? 0.5 : 1 }}
								>
									<MaterialCommunityIcons name="arrow-right" color="#FFA001" size={24} />
								</TouchableOpacity>
							</View>
						</View>
					)}
				</View>
				{isOfflineMode && (
					<View className="absolute top-4 right-4 bg-slate-900 rounded-full px-4 py-2 z-10">
						<Text className="text-white text-sm">Reading Offline</Text>
					</View>
				)}
			</View>
		</SafeAreaView>
	)
}

export default Read