import React from 'react'
import { Tabs } from 'expo-router'
import { MaterialCommunityIcons } from '@expo/vector-icons'

const TabLayout = () => {
	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: "#FFA001",
				tabBarInactiveTintColor: "#CDCDE0",
				tabBarShowLabel: false,
				tabBarStyle: {
					backgroundColor: "#161622",
					borderTopWidth: 1,
					borderTopColor: "#232533",
					height: 84,
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					headerShown: false,
					title: 'Library',
					tabBarIcon: ({ color }) => (
						<MaterialCommunityIcons name="book-open-page-variant" color={color} size={28} />
					),
				}}
			/>
			<Tabs.Screen
				name="browse"
				options={{
					headerShown: false,
					title: 'Browse',
					tabBarIcon: ({ color }) => (
						<MaterialCommunityIcons name="apple-safari" color={color} size={28} />
					),
				}}
			/>
			<Tabs.Screen
				name="downloads"
				options={{
					headerShown: false,
					title: 'Downloads',
					tabBarIcon: ({ color }) => (
						<MaterialCommunityIcons name="download" color={color} size={28} />
					),
				}}
			/>
			<Tabs.Screen
				name="credit"
				options={{
					headerShown: false,
					title: 'Credits',
					tabBarIcon: ({ color }) => (
						<MaterialCommunityIcons name="code-braces" color={color} size={28} />
					),
				}}
			/>
		</Tabs>
	)
}

export default TabLayout