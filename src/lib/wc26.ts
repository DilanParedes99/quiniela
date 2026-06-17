const BASE = "https://worldcup26.ir";

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getToken(): Promise<string> {
  // Reutiliza token si no ha expirado (tokens válidos 84 días)
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const res = await fetch(`${BASE}/auth/authenticate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.WC26_EMAIL,
      password: process.env.WC26_PASSWORD,
    }),
  });

  const data = await res.json();
  if (!data.token) throw new Error("No se pudo obtener token de worldcup26.ir");

  cachedToken = data.token;
  tokenExpiry = Date.now() + 80 * 24 * 60 * 60 * 1000; // 80 días
  return cachedToken!;
}

export async function wc26Fetch(path: string) {
  const token = await getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 }, // caché 5 minutos
  });
  if (!res.ok) throw new Error(`Error ${res.status} en ${path}`);
  return res.json();
}
