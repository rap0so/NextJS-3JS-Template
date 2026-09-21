import { getContentfulConfig, getContentfulEndpoint } from './config';

export interface GraphQLError {
  message: string;
  path?: (string | number)[];
}

export interface FetchContentfulOptions {
  variables?: Record<string, unknown>;
  /** Use the preview token so draft entries are returned. */
  preview?: boolean;
  /** Seconds; `false` opts out of the Next.js data cache entirely. */
  revalidate?: number | false;
  /** Cache tags, so a webhook can call `revalidateTag` on publish. */
  tags?: string[];
}

export class ContentfulFetchError extends Error {
  readonly errors: GraphQLError[];

  constructor(message: string, errors: GraphQLError[] = []) {
    super(message);

    this.name = 'ContentfulFetchError';
    this.errors = errors;
  }
}

/**
 * Thin typed wrapper over the Contentful GraphQL Content API.
 *
 * Uses the platform `fetch` that Next.js instruments, so `revalidate` and `tags`
 * behave like any other cached server request. Server-only: the tokens must
 * never be exposed with a `NEXT_PUBLIC_` prefix.
 */
export async function fetchContentful<TData>(
  query: string,
  options: FetchContentfulOptions = {},
): Promise<TData> {
  const { variables, preview = false, revalidate = 60, tags } = options;

  const config = getContentfulConfig();
  const token = preview ? config.previewToken : config.deliveryToken;

  const response = await fetch(getContentfulEndpoint(config), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables: { ...variables, preview } }),
    // Draft content must never be cached across requests.
    next: preview ? { revalidate: 0 } : { revalidate, tags },
  });

  if (!response.ok) {
    throw new ContentfulFetchError(
      `Contentful responded with ${response.status} ${response.statusText}`,
    );
  }

  const payload = (await response.json()) as { data?: TData; errors?: GraphQLError[] };

  if (payload.errors?.length) {
    throw new ContentfulFetchError('Contentful returned GraphQL errors', payload.errors);
  }

  if (!payload.data) {
    throw new ContentfulFetchError('Contentful returned an empty data payload');
  }

  return payload.data;
}
