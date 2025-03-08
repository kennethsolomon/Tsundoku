import { useEffect, useState, useCallback } from 'react';
import { View, Text, SafeAreaView, Image, TextInput, FlatList, TouchableOpacity, Alert, RefreshControl, ActivityIndicator } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useGlobalContext } from '@/contexts/GlobalStateContext';
import { DownloadedChapter } from '@/services/downloadService';

const Downloads = () => {
	const { downloads, deleteDownload, refreshDownloads, setSelectedChapter } = useGlobalContext();
	const [searchTerm, setSearchTerm] = useState('');
	const [refreshing, setRefreshing] = useState(false);
	const [filteredDownloads, setFilteredDownloads] = useState<DownloadedChapter[]>(downloads);

	useEffect(() => {
		const filtered = downloads.filter((chapter: DownloadedChapter) =>
			chapter.title.toLowerCase().includes(searchTerm.toLowerCase())
		);
		setFilteredDownloads(filtered);
	}, [searchTerm, downloads]);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await refreshDownloads();
		setRefreshing(false);
	}, [refreshDownloads]);

	const handleSearch = useCallback((text: string) => {
		setSearchTerm(text);
	}, []);

	const handleDeleteDownload = useCallback(async (chapterId: string, title: string) => {
		Alert.alert(
			'Delete Download',
			`Are you sure you want to delete "${title}"?`,
			[
				{
					text: 'Cancel',
					style: 'cancel'
				},
				{
					text: 'Delete',
					style: 'destructive',
					onPress: async () => {
						await deleteDownload(chapterId);
					}
				}
			]
		);
	}, [deleteDownload]);

	const handleDownloadedChapter = useCallback((chapterId: string) => {
		setSelectedChapter(chapterId);
		router.push(`/read/${chapterId}`);
	}, []);

	const renderItem = useCallback(({ item }: { item: DownloadedChapter }) => (
		<View className="px-4">
			<TouchableOpacity
				onPress={() => handleDownloadedChapter(item.chapterId)}
				onLongPress={() => handleDeleteDownload(item.chapterId, item.title)}
				delayLongPress={500}
			>
				<View className="flex flex-row justify-between items-center py-4">
					<View className="flex-1">
						<Text className="text-white text-lg font-semibold">{item.title}</Text>
						<Text className="text-slate-400 text-sm">Chapter {item.chapterNumber}</Text>
						<Text className="text-slate-400 text-xs mt-1">
							Downloaded {new Date(item.dateDownloaded).toLocaleDateString()}
						</Text>
					</View>
					<TouchableOpacity
						onPress={() => handleDeleteDownload(item.chapterId, item.title)}
						className="bg-slate-900 rounded-full p-2"
					>
						<MaterialCommunityIcons name="delete" color="#EF4444" size={24} />
					</TouchableOpacity>
				</View>
			</TouchableOpacity>
		</View>
	), [handleDeleteDownload]);

	const ItemSeparator = useCallback(() => (
		<View className='h-[1px] bg-slate-700 mx-4' />
	), []);

	const ListEmptyComponent = useCallback(() => (
		<View className="h-[60vh] items-center justify-center">
			<MaterialCommunityIcons
				name="download"
				color="#FFA001"
				size={64}
			/>
			<Text className="text-white text-xl font-bold mt-4">
				No Downloads Yet
			</Text>
			<Text className="text-slate-400 text-center mt-2 px-8">
				Download your favorite manga chapters to read them offline!
			</Text>
		</View>
	), []);

	return (
		<SafeAreaView className="flex-1 bg-black">
			<View className="h-[100vh]">
				<View className="mt-[2vh] px-4 mb-4">
					<Text className="text-3xl font-bold text-white">Downloads</Text>
				</View>
				<View className="px-4 mb-2">
					<View className="relative">
						<TextInput
							value={searchTerm}
							onChangeText={handleSearch}
							placeholder='Search downloads...'
							placeholderTextColor='#7B7B8B'
							className='w-full bg-slate-900 text-white rounded-3xl p-2 h-12 pl-14'
							autoCapitalize="none"
							autoCorrect={false}
						/>
						<View className="absolute left-4 top-3">
							<MaterialCommunityIcons name="magnify" color="#FFA001" size={24} />
						</View>
					</View>
				</View>

				<View className="h-[72vh]">
					<FlatList
						data={filteredDownloads}
						renderItem={renderItem}
						ItemSeparatorComponent={ItemSeparator}
						ListEmptyComponent={ListEmptyComponent}
						refreshControl={
							<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
						}
						keyExtractor={(item) => item.chapterId}
						removeClippedSubviews={true}
						maxToRenderPerBatch={10}
						initialNumToRender={10}
						windowSize={5}
					/>
				</View>
			</View>
		</SafeAreaView>
	);
};

export default Downloads;