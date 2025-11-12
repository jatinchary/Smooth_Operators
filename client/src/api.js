const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export async function apiGet(path) {
  const url = `${apiBaseUrl}${path}`;
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      Accept: 'application/json'
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed: ${res.status} ${res.statusText} - ${text}`);
  }
  return res.json();
}


