const BASE = "https://worldcup26.ir";
const OPENFOOTBALL_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getToken(): Promise<string> {
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
  tokenExpiry = Date.now() + 80 * 24 * 60 * 60 * 1000;
  return cachedToken!;
}

export async function wc26Fetch(path: string) {
  const token = await getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Error ${res.status} en ${path}`);
  return res.json();
}

export interface OpenMatch {
  round: string;
  date: string;
  time: string;
  team1: string;
  team2: string;
  group: string;
  ground: string;
  score1?: number;
  score2?: number;
}

export async function getMatchesFallback(): Promise<OpenMatch[]> {
  const res = await fetch(OPENFOOTBALL_URL, { next: { revalidate: 3600 } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.matches ?? []) as OpenMatch[];
}
