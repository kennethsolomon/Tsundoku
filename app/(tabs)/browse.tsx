import { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, Image, TextInput, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native'
import { MangaFactory } from '@/factory/MangaFactory';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const Browse = () => {
	const [manga, setManga] = useState<any>([]);

	const [refreshing, setRefreshing] = useState(false);

	async function fetchManga() {
		const mangaService = new MangaFactory().getMangaService('mangadex');
		const manga = await mangaService.searchManga('one piece');
		console.log(manga.results);
		setManga(manga.results);
	}

	const onRefresh = async () => {
		setRefreshing(true);
		console.log('refreshing');
		fetchManga();
		setRefreshing(false);
	};

	useEffect(() => {
		fetchManga();
	}, []);

	return (
		<SafeAreaView className="max-h-[91vh]">
			<View className="mt-[2vh] px-4 mb-4">
				<Text className="text-3xl font-bold text-white">Browse</Text>
			</View>
			<View className="px-4 mb-2">
				{/* Search Bar */}
				<View className="relative">
					<TextInput
						placeholder='Sky is the limit ...'
						placeholderTextColor='#7B7B8B'
						className='w-full bg-slate-900 text-white rounded-3xl p-2 h-12 pl-14'
					/>
					<View className="absolute left-4 top-3">
						<MaterialCommunityIcons name="magnify" color="#FFA001" size={24} />
					</View>
				</View>
			</View >

			<FlatList
				data={manga}
				renderItem={({ item }) => (
					<View className="px-4">
						<TouchableOpacity
							onPress={() => router.push(`/detail/${item.title}`)}
							onLongPress={() => {
								Alert.alert(
									'Long Pressed',
									`You long pressed ${item.title}`,
									[
										{
											text: '🔖 Bookmark',
											onPress: () => console.log('Bookmark Pressed'),
											style: 'default',
										},
										{
											text: '👁️ Mark as read',
											onPress: () => console.log('Mark as read Pressed'),
											style: 'default',
										},
										{
											text: 'Close',
											onPress: () => console.log('Remove Pressed'),
											style: 'destructive',
										}
									],
								);
							}}
							delayLongPress={500}
						>
							<View className="flex flex-row">
								<Image source={{ uri: item.image }} width={12} height={12} className="w-[100px] h-[160px]" />
								<View className="p-4 flex-auto flex justify-between">
									<View>
										<Text className="text-white text-xl font-bold line-clamp-2">{item.title}</Text>
										<Text className="text-slate-400 mt-2 line-clamp-2">{item.description}</Text>
									</View>
									<View className="flex items-end justify-items-center">
										<TouchableOpacity
											className="bg-slate-900 rounded-full p-2"
											onPress={() => router.push("/browse")}
										>
											<MaterialCommunityIcons name="bookmark-outline" color="#FFA001" size={24} />
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</TouchableOpacity>
					</View>
				)}
				ItemSeparatorComponent={() => <View className='h-[1px] bg-slate-700 mx-4' />}
				ListEmptyComponent={() => (
					<View className="px-4">
						<Text className="text-white text-xl font-bold">No manga found</Text>
					</View>
				)}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			/>
		</SafeAreaView >
	);
}

export default Browse