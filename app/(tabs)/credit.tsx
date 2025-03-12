import { View, Text, SafeAreaView, Linking, TouchableOpacity, Alert } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StorageService } from '@/services/storageService';
import { useState, useEffect } from 'react';

const Credit = () => {
	const [currentSource, setCurrentSource] = useState('mangahere');

	useEffect(() => {
		const getSource = async () => {
			const source = await StorageService.getMangaSource();
			setCurrentSource(source);
		};
		getSource();
	}, []);

	return (
		<SafeAreaView className="max-h-[100vh] bg-black">
			<View className="h-[100vh]">
				<View className="mt-[2vh] px-4 mb-4">
					<Text className="text-3xl font-bold text-white">Credits</Text>
				</View>

				<View className="flex-1 items-center justify-center px-4">
					<MaterialCommunityIcons name="code-braces" size={64} color="#FFA001" />

					<Text className="text-white text-2xl font-bold mt-4">
						Kenneth Solomon
					</Text>

					<Text className="text-slate-400 text-center mt-2">
						Developer & Designer
					</Text>

					<TouchableOpacity
						className="mt-8 bg-[#FFA001] px-6 py-3 rounded-full flex-row items-center"
						onPress={() => Linking.openURL('https://github.com/kennethsolomon')}
					>
						<MaterialCommunityIcons name="github" size={24} color="black" />
						<Text className="text-black font-bold ml-2">GitHub Profile</Text>
					</TouchableOpacity>

					<Text className="text-slate-400 text-center mt-12 px-8">
						This app was created with React Native, Expo, and TailwindCSS. All manga data is sourced from{' '}
						<TouchableOpacity
							onPress={() => {
								Alert.alert(
									'Select Manga Source',
									'Choose your preferred manga source',
									[
										{
											text: 'MangaDex',
											onPress: async () => {
												try {
													await StorageService.setMangaSource('mangadex');
													setCurrentSource('mangadex');
													Alert.alert('Success', 'Manga source updated to MangaDex');
												} catch (error) {
													console.error('Error updating manga source:', error);
													Alert.alert('Error', 'Failed to update manga source');
												}
											}
										},
										{
											text: 'MangaHere',
											onPress: async () => {
												try {
													await StorageService.setMangaSource('mangahere');
													setCurrentSource('mangahere');
													Alert.alert('Success', 'Manga source updated to MangaHere');
												} catch (error) {
													console.error('Error updating manga source:', error);
													Alert.alert('Error', 'Failed to update manga source');
												}
											}
										},
										{
											text: 'Cancel',
											style: 'cancel'
										}
									]
								);
							}}
						>
							<Text className="text-[#FFA001]">{currentSource === 'mangadex' ? 'MangaDex' : 'MangaHere'}</Text>
						</TouchableOpacity>
					</Text>
				</View>
			</View>
		</SafeAreaView>
	)
}

export default Credit

