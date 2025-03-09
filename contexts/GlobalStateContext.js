import React, { createContext, useContext, useEffect, useState } from "react";
import { StorageService, BookmarkItem } from "@/services/storageService";
import { getDescription } from "@/utils/common";
import { downloadService } from "@/services/downloadService";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedManga, setSelectedManga] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [downloads, setDownloads] = useState([]);
  const [downloadProgress, setDownloadProgress] = useState({});

  useEffect(() => {
    loadBookmarks();
    loadDownloads();
  }, []);

  const loadBookmarks = async () => {
    setIsLoading(true);
    const savedBookmarks = await StorageService.getBookmarks();
    setBookmarks(savedBookmarks);
    setIsLoading(false);
  };

  const loadDownloads = async () => {
    const savedDownloads = await downloadService.getDownloadedChapters();
    setDownloads(savedDownloads);
  };

  const addBookmark = async (manga) => {
    const bookmarkItem = {
      id: manga.id,
      title: manga.title,
      image: manga.image,
      description: manga.description,
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

  const downloadChapter = async (manga, chapter) => {
    const success = await downloadService.downloadChapter(
      manga.id,
      chapter.id,
      chapter.title,
      chapter.chapterNumber,
      chapter.pages || [],
      manga
    );
    if (success) {
      loadDownloads();
    }
    return success;
  };

  const deleteDownload = async (chapterId) => {
    const success = await downloadService.deleteDownloadedChapter(chapterId);
    if (success) {
      loadDownloads();
    }
    return success;
  };

  const isChapterDownloaded = async (chapterId) => {
    return await downloadService.isChapterDownloaded(chapterId);
  };

  const getDownloadProgress = (chapterId) => {
    return downloadService.getDownloadProgress(chapterId);
  };

  const getMangaInfoOffline = async (mangaId) => {
    return await downloadService.getMangaInfo(mangaId);
  };

  const hasMangaDownloads = async (mangaId) => {
    return await downloadService.hasMangaDownloads(mangaId);
  };

  const isRead = async (mangaId, chapterId) => {
    return await StorageService.isRead(mangaId, chapterId);
  };

  const addReadChapter = async (mangaId, chapterId) => {
    return await StorageService.addReadChapter(mangaId, chapterId);
  };

  const removeReadChapter = async (mangaId, chapterId) => {
    return await StorageService.removeReadChapter(mangaId, chapterId);
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
        downloads,
        downloadChapter,
        deleteDownload,
        isChapterDownloaded,
        getDownloadProgress,
        refreshDownloads: loadDownloads,
        getMangaInfoOffline,
        hasMangaDownloads,
        isRead,
        addReadChapter,
        removeReadChapter,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
