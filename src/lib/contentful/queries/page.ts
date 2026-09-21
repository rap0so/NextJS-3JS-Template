/**
 * Example queries against a `page` content type.
 *
 * `preview: $preview` is threaded through by `fetchContentful`, so the same
 * query serves both published and draft reads.
 */

export const PAGE_FIELDS_FRAGMENT = /* GraphQL */ `
  fragment PageFields on Page {
    sys {
      id
      publishedAt
    }
    slug
    title
    description
    heroImage {
      sys {
        id
      }
      url
      title
      description
      width
      height
    }
  }
`;

export const PAGE_BY_SLUG_QUERY = /* GraphQL */ `
  ${PAGE_FIELDS_FRAGMENT}

  query PageBySlug($slug: String!, $preview: Boolean = false) {
    pageCollection(where: { slug: $slug }, limit: 1, preview: $preview) {
      items {
        ...PageFields
      }
    }
  }
`;

export const ALL_PAGE_SLUGS_QUERY = /* GraphQL */ `
  query AllPageSlugs($preview: Boolean = false) {
    pageCollection(preview: $preview) {
      items {
        slug
      }
    }
  }
`;
