const API_BASE = "http://localhost:5173";

// ----- AUTH -----
export async function signup(email, password) {
  const res = await fetch(`${API_BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

// ----- FAVORITES -----
export async function getFavorites(userId) {
  const res = await fetch(`${API_BASE}/favorites?userId=${userId}`);
  return res.json();
}

export async function addFavorite(userId, movie) {
  const res = await fetch(`${API_BASE}/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, movie }),
  });
  return res.json();
}

export async function removeFavoriteBackend(favId) {
  const res = await fetch(`${API_BASE}/favorites/${favId}`, {
    method: "DELETE",
  });
  return res.json();
}
