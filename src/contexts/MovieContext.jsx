import { createContext, useContext, useEffect, useState } from "react";
import {
  getFavorites,
  addFavorite,
  removeFavoriteBackend,
} from "../services/api";

const MovieContext = createContext();

export function MovieProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  // ----- LOAD USER FAVORITES -----
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    async function loadFavs() {
      const favs = await getFavorites(userId);
      setFavorites(favs);
    }

    loadFavs();
  }, []);

  // ----- CHECK IF FAVORITE -----
  function isFavorite(movieId) {
    return favorites.some((f) => f.movie.id === movieId);
  }

  // ----- ADD FAVORITE -----
  async function addToFavorites(movie) {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please login first!");
      return;
    }

    const result = await addFavorite(userId, movie);
    setFavorites([...favorites, result.newFav]);
  }

  // ----- REMOVE FAVORITE -----
  async function removeFromFavorites(movieId) {
    const fav = favorites.find((f) => f.movie.id === movieId);

    if (!fav) return;

    await removeFavoriteBackend(fav.id);

    setFavorites(favorites.filter((f) => f.movie.id !== movieId));
  }

  return (
    <MovieContext.Provider
      value={{
        favorites,
        isFavorite,
        addToFavorites,
        removeFromFavorites,
      }}
    >
      {children}
    </MovieContext.Provider>
  );
}

export function useMovieContext() {
  return useContext(MovieContext);
}
