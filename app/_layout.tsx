import React from 'react'
import { Stack } from 'expo-router'
import { useColorScheme } from '@/hooks/useColorScheme';
import { DefaultTheme, DarkTheme, ThemeProvider } from '@react-navigation/native';
import '@/global.css';

import { StatusBar } from 'expo-status-bar'
import GlobalProvider from '@/contexts/GlobalStateContext';
const RootLayout = () => {
  const colorScheme = useColorScheme();
  return (
    <GlobalProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false, title: '' }} />
          <Stack.Screen name="read/[query]" options={{ headerShown: true, title: '', }} />
          <Stack.Screen name="detail/[query]" options={{ headerShown: true, title: '', }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GlobalProvider>
  )
}

export default RootLayout
