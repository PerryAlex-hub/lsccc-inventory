export async function apiRequest<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    requestKey?: string;
    signal?: AbortSignal;
  } = {},
): Promise<T> {
  const response = await fetch(path, {
    method: options.method || "GET",
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(options.requestKey ? { "Idempotency-Key": options.requestKey } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
    signal: options.signal || AbortSignal.timeout(30000),
  });
  if (response.status === 401) {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- Discard all prefetched account data when the session expires.
    window.location.assign("/sign-in");
    throw new Error("Your session has expired. Sign in again.");
  }
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "We couldn’t save this change. Please try again.");
  return data as T;
}
