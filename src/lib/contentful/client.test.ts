import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ContentfulFetchError, fetchContentful } from './client';
import { ContentfulConfigError } from './config';

const QUERY = 'query Ping { __typename }';

function stubEnv() {
  vi.stubEnv('CONTENTFUL_SPACE_ID', 'space');
  vi.stubEnv('CONTENTFUL_DELIVERY_TOKEN', 'delivery');
  vi.stubEnv('CONTENTFUL_PREVIEW_TOKEN', 'preview');
  vi.stubEnv('CONTENTFUL_ENVIRONMENT', 'master');
}

function mockFetch(body: unknown, init: { ok?: boolean; status?: number } = {}) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: init.ok ?? true,
    status: init.status ?? 200,
    statusText: 'OK',
    json: async () => body,
  });

  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('fetchContentful', () => {
  describe('without configuration', () => {
    beforeEach(() => {
      vi.stubEnv('CONTENTFUL_SPACE_ID', '');
      vi.stubEnv('CONTENTFUL_DELIVERY_TOKEN', '');
      vi.stubEnv('CONTENTFUL_PREVIEW_TOKEN', '');
    });

    it('names every missing variable', async () => {
      await expect(fetchContentful(QUERY)).rejects.toBeInstanceOf(ContentfulConfigError);
    });
  });

  describe('with configuration', () => {
    beforeEach(stubEnv);

    it('returns the data payload', async () => {
      mockFetch({ data: { __typename: 'Query' } });

      await expect(fetchContentful(QUERY)).resolves.toEqual({ __typename: 'Query' });
    });

    it('targets the space environment endpoint with the delivery token', async () => {
      const fetchMock = mockFetch({ data: {} });

      await fetchContentful(QUERY);

      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];

      expect(url).toBe(
        'https://graphql.contentful.com/content/v1/spaces/space/environments/master',
      );
      expect((init.headers as Record<string, string>).Authorization).toBe('Bearer delivery');
    });

    it('uses the preview token and disables caching in preview mode', async () => {
      const fetchMock = mockFetch({ data: {} });

      await fetchContentful(QUERY, { preview: true });

      const [, init] = fetchMock.mock.calls[0] as [string, RequestInit & { next?: unknown }];

      expect((init.headers as Record<string, string>).Authorization).toBe('Bearer preview');
      expect(init.next).toEqual({ revalidate: 0 });
    });

    it('surfaces GraphQL errors', async () => {
      mockFetch({ errors: [{ message: 'Unknown field' }] });

      await expect(fetchContentful(QUERY)).rejects.toBeInstanceOf(ContentfulFetchError);
    });

    it('surfaces transport errors', async () => {
      mockFetch({}, { ok: false, status: 401 });

      await expect(fetchContentful(QUERY)).rejects.toThrow('401');
    });
  });
});
