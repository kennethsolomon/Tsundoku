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
	const { setSelectedChapter, setSelectedManga } = useGlobalContext();
	const [manga, setManga] = useState<any>(null);

	const [refreshing, setRefreshing] = useState(false);

	const onRefresh = async () => {
		setRefreshing(true);
		await getMangaInfo();
		setRefreshing(false);
	};

	const mangaService = useRef(new MangaFactory().getMangaService('mangadex')).current;

	async function getMangaInfo() {
		try {
			const manga = await mangaService.getMangaInfo(query as string);
			setManga(manga);
		} catch (error) {
			console.error('Error fetching manga info:', error);
			return (
				<View className="flex-1 justify-center items-center">
					<View className="px-4 py-8 items-center">
						<MaterialCommunityIcons name="alert-circle" color="#FFA001" size={64} />
						<Text className="text-white text-xl font-bold mt-4">Something went wrong!</Text>
						<Text className="text-slate-400 text-center mt-2">We're having trouble connecting to our servers. Please try again later.</Text>
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
	}

	function handleStartReading(chapter: any) {
		setSelectedChapter(chapter);
		setSelectedManga(manga);
		router.push(`/read/${chapter.id}`);
	}

	useEffect(() => {
		getMangaInfo();
	}, []);

	if (!manga) {
		return (
			<View className="flex-1 items-center justify-center bg-black">
				<ActivityIndicator size="large" color="#FFA001" />
			</View>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-black">
			<View className="flex-1 px-4">
				<MangaDetail manga={manga} />

				<View className='mt-4'>
					<View>
						<Text className='text-white text-xl font-bold'>About this manga</Text>
						<Text className={`text-slate-400 mt-2 ${!expanded ? 'line-clamp-3' : ''}`}>
							{getDescription(manga.description)}
						</Text>
					</View>
					<View className="flex items-end">
						<TouchableOpacity onPress={() => setExpanded(!expanded)}>
							<Text className="text-amber-500 mt-1">{expanded ? 'See less' : 'See more'}</Text>
						</TouchableOpacity>
					</View>
				</View>

				<TouchableOpacity className='bg-amber-500 p-3 rounded-3xl mt-4' onPress={() => setExpanded(!expanded)}>
					<Text className="text-white text-center text-md font-semibold">Start Reading</Text>
				</TouchableOpacity>

				<FlatList
					className='mt-4 flex-1'
					data={manga.chapters}
					renderItem={({ item }) => (
						<TouchableOpacity
							onPress={() => handleStartReading(item)}
							onLongPress={() => {
								Alert.alert(
									'Options',
									`What would you like to do with ${item.title}?`,
									[
										{
											text: '🗑️ Delete',
											onPress: () => {
												console.log('Delete', item.title);
											},
											style: 'destructive'
										},
										{
											text: 'Cancel',
											style: 'cancel'
										}
									]
								);
							}}
						>
							<View className='flex flex-row justify-between items-center'>
								<View className='h-20'>
									<View className='flex-1 justify-center'>
										<Text className='text-white text-lg font-semibold'>{item.title}</Text>
										<Text className='text-slate-400 text-sm'>Chapter: {item.chapterNumber}</Text>
									</View>
								</View>
								{/* Download Button */}
								<TouchableOpacity
									className="bg-slate-900 rounded-full p-2 mr-4"
								>
									<View>
										<MaterialCommunityIcons name="download" color="#FFA001" size={24} />
									</View>
								</TouchableOpacity>
							</View>
						</TouchableOpacity>
					)}
					ItemSeparatorComponent={() => <View className='h-[1px] bg-slate-700' />}
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