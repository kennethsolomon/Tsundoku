import { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, SafeAreaView, Image, TextInput, FlatList, TouchableOpacity, Alert, RefreshControl, ActivityIndicator } from 'react-native'
import { MangaFactory } from '@/factory/MangaFactory';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import debounce from 'lodash/debounce';

const Home = () => {
  const [manga, setManga] = useState<any>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create mangaService instance once
  const mangaService = useRef(new MangaFactory().getMangaService('mangadex')).current;

  // Memoize the fetch function
  const fetchManga = useCallback(async (query: string = 'demonic emperor') => {
    if (loading) return; // Prevent multiple simultaneous requests

    setLoading(true);
    setError(null);

    try {
      const result = await mangaService.searchManga(query);
      setManga(result.results);
    } catch (error) {
      console.error('Error fetching manga:', error);
      setError('Failed to fetch manga. Please try again.');
      setManga([]); // Clear results on error
    } finally {
      setLoading(false);
    }
  }, [loading]);

  // Improved debounced search with cleanup
  const debouncedFetch = useCallback(
    debounce((query: string) => {
      fetchManga(query);
    }, 300), // Reduced debounce time for better responsiveness
    []
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchManga(searchTerm || 'solo leveling');
    setRefreshing(false);
  }, [searchTerm, fetchManga]);

  const handleSearch = useCallback((text: string) => {
    setSearchTerm(text);
    const trimmedText = text.trim();

    if (trimmedText.length >= 3) {
      debouncedFetch(trimmedText);
    } else if (trimmedText.length === 0) {
      debouncedFetch('demonic emperor');
    }
  }, [debouncedFetch]);

  useEffect(() => {
    fetchManga();

    return () => {
      debouncedFetch.cancel();
    };
  }, []);

  const renderItem = useCallback(({ item }: { item: any }) => (
    <View className="px-4">
      <TouchableOpacity
        onPress={() => router.push(`/detail/${item.id}`)}
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
          <Image
            source={{ uri: item.image }}
            className="w-[100px] h-[160px] rounded-md"
            defaultSource={{ uri: 'https://placehold.co/100x160' }}
          />
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
  ), []);

  const ItemSeparator = useCallback(() => (
    <View className='h-[1px] bg-slate-700 mx-4' />
  ), []);

  const ListEmptyComponent = useCallback(() => (
    <View className="h-[50vh] items-center justify-center">
      <MaterialCommunityIcons
        name={error ? "alert-circle" : "book-search"}
        color="#FFA001"
        size={64}
      />
      <Text className="text-white text-xl font-bold mt-4">
        {error || "Oops! The shelf is empty"}
      </Text>
      <Text className="text-slate-400 text-center mt-2 px-8">
        {error ? "Please try again later" : "Looks like we couldn't find any manga. Try adjusting your search or check back later for new titles!"}
      </Text>
    </View>
  ), [error]);

  return (
    <SafeAreaView className="max-h-[78vh]">
      <View>
        <View className="mt-[2vh] px-4 mb-4">
          <Text className="text-3xl font-bold text-white">Library</Text>
        </View>
        <View className="px-4 mb-2">
          <View className="relative">
            <TextInput
              value={searchTerm}
              onChangeText={handleSearch}
              placeholder='Sky is the limit ...'
              placeholderTextColor='#7B7B8B'
              className='w-full bg-slate-900 text-white rounded-3xl p-2 h-12 pl-14'
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View className="absolute left-4 top-3">
              {loading ? (
                <ActivityIndicator size="small" color="#FFA001" />
              ) : (
                <MaterialCommunityIcons name="magnify" color="#FFA001" size={24} />
              )}
            </View>
          </View>
        </View>

        <FlatList
          data={manga}
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
    </SafeAreaView>
  );
}

export default Home;