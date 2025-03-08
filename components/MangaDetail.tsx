import { View, Text, TouchableOpacity, Image, SafeAreaView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useGlobalContext } from '@/contexts/GlobalStateContext'
import { getDescription } from '@/utils/common';
const MangaDetail = ({ manga, className = '' }: { manga: any, className?: string }) => {
	const { addBookmark, removeBookmark, isBookmarked } = useGlobalContext();
	const [isBookmarkedState, setIsBookmarkedState] = useState(false);

	useEffect(() => {
		checkBookmarkStatus();
	}, [manga]);

	const checkBookmarkStatus = async () => {
		if (manga?.id) {
			const status = await isBookmarked(manga.id);
			setIsBookmarkedState(status);
		}
	};

	const handleBookmarkToggle = async () => {
		if (!manga?.id) return;

		if (isBookmarkedState) {
			const success = await removeBookmark(manga.id);
			if (success) {
				setIsBookmarkedState(false);
			}
		} else {
			const success = await addBookmark({ ...manga, description: getDescription(manga?.description) });
			if (success) {
				setIsBookmarkedState(true);
			}
		}
	};

	return (
		<SafeAreaView>
			<View className={`flex flex-row gap-2 ${className}`}>
				<Image
					source={{ uri: manga?.image }}
					defaultSource={{ uri: 'https://placehold.co/100x160' }}
					style={{
						width: 120,
						height: 180,
						borderRadius: 8
					}}
					resizeMode="cover"
				/>

				<View className="flex-1">
					<Text className="text-3xl font-bold text-white line-clamp-2">{manga?.title}</Text>
					<Text className="text-slate-400 mt-2">Source: <Text className="text-white">MangaDex</Text></Text>
					<Text className="text-slate-400 mt-2">Status: <Text className="text-white">{manga?.status}</Text></Text>
					<Text className="text-slate-400 mt-2">Genres: <Text className="text-white line-clamp-2">{manga?.genres?.join(', ')}</Text></Text>
					<Text className="text-slate-400 mt-2">Themes: <Text className="text-white line-clamp-2">{manga?.themes?.join(', ')}</Text></Text>
					<Text className="text-slate-400 mt-2">Release Date: <Text className="text-white">{manga?.releaseDate}</Text></Text>
					<View className='w-full mt-2 items-end'>
						<TouchableOpacity
							className="flex flex-row bg-slate-900 items-center p-2 rounded-full"
							onPress={handleBookmarkToggle}
						>
							<MaterialCommunityIcons
								name={isBookmarkedState ? "bookmark" : "bookmark-outline"}
								color="#FFA001"
								size={24}
							/>
							<Text className="text-white text-sm font-semibold">
								{isBookmarkedState ? 'In Library' : 'Add to Library'}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</SafeAreaView>
	)
}

export default MangaDetail