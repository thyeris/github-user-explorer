const STORAGE_KEY = 'github-finder:search-history';
const MAX_ITEMS = 5;

export function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToHistory(username) {
  const current = getHistory().filter(
    (item) => item.username.toLowerCase() !== username.toLowerCase()
  );

  const updated = [
    { username, searchedAt: new Date().toISOString() },
    ...current,
  ].slice(0, MAX_ITEMS);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}
