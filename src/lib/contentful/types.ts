/**
 * Hand-written shapes for the queries in `./queries`.
 *
 * Once the content model exists, replace this file with generated types:
 *
 *   yarn add -D @graphql-codegen/cli @graphql-codegen/client-preset
 *   npx graphql-codegen init
 *
 * Point codegen at the same endpoint `client.ts` uses and commit the output.
 */

export interface ContentfulSys {
  id: string;
  publishedAt?: string | null;
}

export interface ContentfulAsset {
  sys: ContentfulSys;
  url: string;
  title?: string | null;
  description?: string | null;
  width?: number | null;
  height?: number | null;
}

export interface ContentfulCollection<TItem> {
  total: number;
  items: TItem[];
}

/** Example entry type -- rename to match your real content type. */
export interface PageEntry {
  sys: ContentfulSys;
  slug: string;
  title: string;
  description?: string | null;
  heroImage?: ContentfulAsset | null;
}
