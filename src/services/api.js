const API_KEY = "a0e72d9e4dc62fa3c98e0fc426dd87d1";
const BASE_URL = "https://api.themoviedb.org/3";

export const getPopularMovies = async () => {
  const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
  const data = await response.json();
  return data.results;
};

export const searchMovies = async (query) => {
  const response = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
      query
    )}`
  );
  const data = await response.json();
  return data.results;
};

// ===== FAVORITES API (Backend Integration) =====

const API_URL = import.meta.env.VITE_API_URL;

export async function getFavorites() {
  const res = await fetch(`${API_URL}/favorites`);
  return res.json();
}

export async function addFavorite(movie) {
  const res = await fetch(`${API_URL}/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(movie)
  });

  return res.json();
}

export async function deleteFavorite(id) {
  const res = await fetch(`${API_URL}/favorites/${id}`, {
    method: "DELETE"
  });

  return res.json();
}