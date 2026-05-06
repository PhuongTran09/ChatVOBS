export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type ApiRequestOptions<TBody = unknown> = {
  method?: HttpMethod
  body?: TBody
  headers?: HeadersInit
  signal?: AbortSignal
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

async function request<TResponse, TBody = unknown>(
  path: string,
  options: ApiRequestOptions<TBody> = {},
): Promise<TResponse> {
  const { method = 'GET', body, headers, signal } = options
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`)
  }

  if (response.status === 204) {
    return undefined as TResponse
  }

  return response.json() as Promise<TResponse>
}

export const apiClient = {
  get: <TResponse>(path: string, options?: Omit<ApiRequestOptions, 'method'>) =>
    request<TResponse>(path, { ...options, method: 'GET' }),
  post: <TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options?: Omit<ApiRequestOptions<TBody>, 'method' | 'body'>,
  ) => request<TResponse, TBody>(path, { ...options, method: 'POST', body }),
  put: <TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options?: Omit<ApiRequestOptions<TBody>, 'method' | 'body'>,
  ) => request<TResponse, TBody>(path, { ...options, method: 'PUT', body }),
  patch: <TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options?: Omit<ApiRequestOptions<TBody>, 'method' | 'body'>,
  ) => request<TResponse, TBody>(path, { ...options, method: 'PATCH', body }),
  delete: <TResponse>(
    path: string,
    options?: Omit<ApiRequestOptions, 'method'>,
  ) => request<TResponse>(path, { ...options, method: 'DELETE' }),
}
