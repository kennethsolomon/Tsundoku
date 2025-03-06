import React, { createContext, useContext, useEffect, useState } from "react";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedManga, setSelectedManga] = useState(null);

  useEffect(() => {
    setSelectedChapter(null);
    setSelectedManga(null);
  }, []);

  return (
    <GlobalContext.Provider
      value={{
        selectedChapter,
        setSelectedChapter,
        selectedManga,
        setSelectedManga,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
