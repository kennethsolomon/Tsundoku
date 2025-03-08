import { useEffect, useState, useCallback } from 'react';
import { View, Text, SafeAreaView, Image, TextInput, FlatList, TouchableOpacity, Alert, RefreshControl, ActivityIndicator } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useGlobalContext } from '@/contexts/GlobalStateContext';
import { BookmarkItem } from '@/services/storageService';
import { formatDate } from '@/utils/common';

const Home = () => {
  const { bookmarks, isLoading, removeBookmark, refreshBookmarks } = useGlobalContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filteredBookmarks, setFilteredBookmarks] = useState<BookmarkItem[]>(bookmarks);
  useEffect(() => {
    const filtered = bookmarks.filter((manga: BookmarkItem) =>
      manga.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBookmarks(filtered);
  }, [searchTerm, bookmarks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshBookmarks();
    setRefreshing(false);
  }, [refreshBookmarks]);

  const handleSearch = useCallback((text: string) => {
    setSearchTerm(text);
  }, []);

  const handleRemoveBookmark = useCallback(async (mangaId: string, title: string) => {
    Alert.alert(
      'Remove from Library',
      `Are you sure you want to remove "${title}" from your library?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeBookmark(mangaId);
          }
        }
      ]
    );
  }, [removeBookmark]);

  const renderItem = useCallback(({ item }: { item: any }) => (
    <View className="px-4">
      <TouchableOpacity
        onPress={() => router.push(`/detail/${item.id}`)}
        onLongPress={() => handleRemoveBookmark(item.id, item.title)}
        delayLongPress={500}
      >
        <View className="flex flex-row">
          <Image
            source={{ uri: item.image }}
            className="w-[100px] h-[160px] rounded-md"
            defaultSource={{ uri: 'https://placehold.co/100x160' }}
          />
          <View className="flex-1 p-4 flex-col justify-between">
            <View>
              <Text className="text-white text-xl font-bold line-clamp-2">{item.title}</Text>
              <Text className="text-slate-400 mt-2 line-clamp-3">{item.description}</Text>
            </View>
            <Text className="text-slate-400 line-clamp-4">{formatDate(item.dateAdded)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  ), [handleRemoveBookmark]);

  const ItemSeparator = useCallback(() => (
    <View className='py-2'>
      <View className='h-[1px] bg-slate-700 mx-4' />
    </View>
  ), []);

  const ListEmptyComponent = useCallback(() => (
    <View className="h-[60vh] items-center justify-center">
      <MaterialCommunityIcons
        name="book-open-variant"
        color="#FFA001"
        size={64}
      />
      <Text className="text-white text-xl font-bold mt-4">
        Your Library is Empty
      </Text>
      <Text className="text-slate-400 text-center mt-2 px-8">
        Browse manga and add them to your library to see them here!
      </Text>
    </View>
  ), []);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#FFA001" />
      </View>
    );
  }

  return (
    <SafeAreaView className="max-h-[100vh] bg-black">
      <View className="h-[100vh]">
        <View className="mt-[2vh] px-4 mb-4">
          <Text className="text-3xl font-bold text-white">Library</Text>
        </View>
        <View className="px-4 mb-2">
          <View className="relative">
            <TextInput
              value={searchTerm}
              onChangeText={handleSearch}
              placeholder='Search your library...'
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
            data={filteredBookmarks}
            renderItem={renderItem}
            ItemSeparatorComponent={ItemSeparator}
            ListEmptyComponent={ListEmptyComponent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            keyExtractor={(item) => item.id}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            initialNumToRender={10}
            windowSize={5}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default Home;