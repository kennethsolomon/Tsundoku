import React from 'react'
import { Stack } from 'expo-router'
import '@/global.css';

import { StatusBar } from 'expo-status-bar'
import GlobalProvider from '@/contexts/GlobalStateContext';
const RootLayout = () => {
  return (
    <GlobalProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: '' }} />
        <Stack.Screen name="read/[query]" options={{ headerShown: false, title: '', }} />
        <Stack.Screen name="detail/[query]" options={{ headerShown: false, title: '', }} />
      </Stack>
      <StatusBar style="auto" />
    </GlobalProvider>
  )
}

export default RootLayout
