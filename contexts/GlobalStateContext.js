import React, { createContext, useContext, useEffect, useState } from "react";
import { StorageService, BookmarkItem } from "@/services/storageService";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedManga, setSelectedManga] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    setIsLoading(true);
    const savedBookmarks = await StorageService.getBookmarks();
    setBookmarks(savedBookmarks);
    setIsLoading(false);
  };

  const addBookmark = async (manga) => {
    const bookmarkItem = {
      id: manga.id,
      title: manga.title,
      image: manga.image,
      description: manga.description.en,
    };

    const success = await StorageService.addBookmark(bookmarkItem);
    if (success) {
      setBookmarks((prev) => [
        ...prev,
        { ...bookmarkItem, dateAdded: Date.now() },
      ]);
    }
    return success;
  };

  const removeBookmark = async (mangaId) => {
    const success = await StorageService.removeBookmark(mangaId);
    if (success) {
      setBookmarks((prev) => prev.filter((b) => b.id !== mangaId));
    }
    return success;
  };

  const isBookmarked = async (mangaId) => {
    return await StorageService.isBookmarked(mangaId);
  };

  return (
    <GlobalContext.Provider
      value={{
        selectedChapter,
        setSelectedChapter,
        selectedManga,
        setSelectedManga,
        bookmarks,
        isLoading,
        addBookmark,
        removeBookmark,
        isBookmarked,
        refreshBookmarks: loadBookmarks,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
