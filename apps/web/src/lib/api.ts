const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL n'est pas configurée");
}

export async function apiFetch<T>(
    path: string,
    init?: RequestInit,
): Promise<T> {
    const response = await fetch(
        `${API_URL}${path}`,
        {
            ...init,
            headers: {
                Accept: "application/json",
                ...init?.headers,
            },
            credentials: "include",
        },
    );

    if (!response.ok) {
        throw new Error(
            `Erreur API : ${response.status} ${response.statusText}`,
        );
    }

    return response.json() as Promise<T>;
}