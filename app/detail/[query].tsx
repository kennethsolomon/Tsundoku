import { View, Text, SafeAreaView, Image, TouchableOpacity, FlatList, RefreshControl, Alert, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams, router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useGlobalContext } from '@/contexts/GlobalStateContext';
import { MangaFactory } from '@/factory/MangaFactory';

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

	async function getMangaInfo() {
		try {
			const mangaService = new MangaFactory().getMangaService('mangadex');
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
			<View className="flex-1 items-center justify-center">
				<ActivityIndicator size="large" color="#FFA001" />
			</View>
		);
	}

	return (
		<SafeAreaView className="max-h-[91vh] max-w-[100vw]">
			<View className="mt-[2vh] mb-4 px-4">
				<View className='flex flex-row'>
					<View className='flex-1 max-h-[200px] max-w-[120px]'>
						<Image source={{ uri: manga?.image }} className="w-[100%] h-[100%]" resizeMode='contain' />
					</View>
					<View className='flex-1 ml-4 flex flex-col justify-between'>
						<View>
							<Text className="text-3xl font-bold text-white line-clamp-4">{manga?.title}</Text>
							<Text className="text-slate-400 mt-2">Source: <Text className="text-white">MangaDex</Text></Text>
							<Text className="text-slate-400 mt-2">Status: <Text className="text-white">{manga?.status}</Text></Text>
							<Text className="text-slate-400 mt-2">Genres: <Text className="text-white line-clamp-2">{manga?.genres.join(', ')}</Text></Text>
							<Text className="text-slate-400 mt-2">Themes: <Text className="text-white line-clamp-2">{manga?.themes.join(', ')}</Text></Text>
							<Text className="text-slate-400 mt-2">Release Date: <Text className="text-white">{manga?.releaseDate}</Text></Text>
						</View>
						<View className='flex flex-row justify-start'>
							<TouchableOpacity
								className="bg-slate-900 rounded-full p-2 mt-2 mx-2"
								onPress={() => router.push("/browse")}
							>
								<View className='flex flex-row items-center gap-1 px-2 py-1'>
									<MaterialCommunityIcons name="bookmark-outline" color="#FFA001" size={24} />
									<Text className='text-white text-sm font-semibold'>Library</Text>
								</View>
							</TouchableOpacity>
							<TouchableOpacity
								className="bg-slate-900 rounded-full p-2 mt-2 mx-2"
								onPress={() => router.push("/browse")}
							>
								<View className='flex flex-row items-center gap-1 px-2 py-1'>
									<MaterialCommunityIcons name="bookmark" color="#FFA001" size={24} />
									<Text className='text-white text-sm font-bold'>In Library</Text>
								</View>
							</TouchableOpacity>
						</View>
					</View>
				</View>
				<View className='mt-4 flex flex-col'>
					<View>
						<Text className='text-white text-xl font-bold'>About this manga</Text>
						<Text className={`text-slate-400 mt-2 ${!expanded ? 'line-clamp-3' : ''}`}>{manga?.description?.en}</Text>
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
					className='max-h-[45vh] mt-2'
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
				/>
			</View>
		</SafeAreaView >
	)
}

export default Detail