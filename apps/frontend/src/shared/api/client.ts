const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string | string[] };
    const message = Array.isArray(body.message)
      ? body.message.join('\n')
      : (body.message ?? `Request failed with status ${res.status}`);
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}
