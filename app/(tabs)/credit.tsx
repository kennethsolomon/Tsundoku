import { View, Text, SafeAreaView, Image, Linking, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Credit = () => {
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
						This app was created with React Native, Expo, and TailwindCSS. All manga data is sourced from MangaDex.
					</Text>
				</View>
			</View>
		</SafeAreaView>
	)
}

export default Credit

