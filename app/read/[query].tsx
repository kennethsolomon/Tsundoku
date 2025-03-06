import { View, Text, SafeAreaView, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions, FlatList, RefreshControl } from 'react-native'
import React, { useState, useEffect } from 'react'
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { mangaDexService } from '@/services/mangadexService';
import { useGlobalContext } from '@/contexts/GlobalStateContext';


interface Chapter {
	img: string;
	page: number;
	width: number;
	height: number;
}

const Read = () => {
	const { query } = useLocalSearchParams();
	const { selectedChapter, selectedManga, setSelectedChapter, setSelectedManga } = useGlobalContext();
	const [isChapterListVisible, setIsChapterListVisible] = useState(false);
	const [chapters, setChapter] = useState<Chapter[]>([]);
	const [loading, setLoading] = useState(true);
	const [chapterId, setChapterId] = useState<string | null>(null);
	const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
	const [loadingProgress, setLoadingProgress] = useState(0);

	const win = Dimensions.get('window');

	// Initialize Chapter
	const fetchChapter = async () => {
		setLoading(true);
		try {
			setLoadingProgress(0);
			const response = await mangaDexService.getChapters(chapterId ?? query as string);

			// Process initial batch of 5 images
			const processInitialBatch = async (startIndex: number, batchSize: number) => {
				const batch = response.slice(startIndex, startIndex + batchSize);
				const processedBatch = batch.map((chapter: any, index: number) => new Promise((resolve) => {
					Image.getSize(chapter.img, (width, height) => {
						const ratio = win.width / width;
						const imageHeight = height * ratio;
						const imageWidth = win.width;
						setLoadingProgress(((startIndex + index + 1) / response.length) * 100);
						resolve({ img: chapter.img, page: chapter.page, width: Math.round(imageWidth), height: Math.round(imageHeight) });
					});
				}));
				return await Promise.all(processedBatch);
			};

			// Load initial 5 images
			const initialBatchSize = 5;
			const initialChapters = await processInitialBatch(0, initialBatchSize);
			setChapter(initialChapters);
			setLoading(false);

			// Process remaining images in background
			if (response.length > initialBatchSize) {
				const loadRemainingImages = async () => {
					for (let i = initialBatchSize; i < response.length; i += 5) {
						const nextBatch = await processInitialBatch(i, 5);
						setChapter(prev => [...prev, ...nextBatch]);
					}
				};
				loadRemainingImages();
			}

		} catch (error) {
			console.error('Error fetching chapter:', error);
			setLoading(false);
			return (
				<View className="flex-1 justify-center items-center">
					<View className="px-4 py-8 items-center">
						<MaterialCommunityIcons name="alert-circle" color="#FFA001" size={64} />
						<Text className="text-white text-xl font-bold mt-4">Something went wrong!</Text>
						<Text className="text-slate-400 text-center mt-2">We're having trouble connecting to our servers. Please try again later.</Text>
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

	// Loading
	if (loading || (refreshing && chapters.length === 0)) {
		return (
			<View className="flex-1 items-center justify-center">
				<View className="w-3/4">
					<View className="h-2 bg-gray-200 rounded-full">
						<View
							className="h-full bg-[#FFA001] rounded-full"
							style={{ width: `${loadingProgress}%` }}
						/>
					</View>
					<Text className="text-center mt-2 text-[#FFA001]">
						Loading... {Math.round(loadingProgress)}%
					</Text>
				</View>
			</View>
		);
	}

	return (
		<SafeAreaView>
			<View>
				<View className="max-h-[85vh]">
					<FlatList
						data={chapters}
						renderItem={({ item: chapter }) => (
							<Image
								source={{ uri: chapter.img }}
								resizeMode="contain"
								style={{ width: chapter.width, height: chapter.height }}
							/>
						)}
						keyExtractor={(_, index) => index.toString()}
						refreshControl={
							<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
						}
						ListEmptyComponent={() => (
							<View className="px-4 py-8 items-center">
								<MaterialCommunityIcons name="book-open-variant" color="#FFA001" size={64} />
								<Text className="text-white text-xl font-bold mt-4">Oops! This shelf is empty</Text>
								<Text className="text-slate-400 text-center mt-2">Looks like there aren't any chapters available yet. Check back later!</Text>
							</View>
						)}
					/>
				</View>
				<View className="flex flex-row justify-between items-center mx-12 h-[70px]">
					<TouchableOpacity
						className="bg-slate-900 rounded-full p-2"
						onPress={handleNextChapter}
						disabled={currentChapterIndex === selectedManga?.chapters?.length - 1}
						style={{ opacity: currentChapterIndex === selectedManga?.chapters?.length - 1 ? 0.5 : 1 }}
					>
						<MaterialCommunityIcons name="arrow-left" color="#FFA001" size={24} />
					</TouchableOpacity>
					<TouchableOpacity
						onPress={() => setIsChapterListVisible(!isChapterListVisible)}
						className="bg-slate-900 rounded-full p-2 w-full flex-1 mx-4">
						<View className="flex flex-row items-center gap-2 px-2 justify-between">
							<Text className="text-white text-lg font-bold">{selectedChapter?.title}</Text>
							<MaterialCommunityIcons name={isChapterListVisible ? "chevron-up" : "chevron-down"} color="#FFA001" size={24} />
						</View>
						{isChapterListVisible && (
							<View className="absolute bottom-12 bg-slate-900 w-full p-2 flex-1 rounded-lg left-2">
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
		</SafeAreaView>
	)
}

export default Read