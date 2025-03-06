import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { router } from 'expo-router'

const MangaDetail = ({ manga, className = '' }: { manga: any, className?: string }) => {
	return (
		<View className={`flex flex-row ${className}`}>
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
	)
}

export default MangaDetail