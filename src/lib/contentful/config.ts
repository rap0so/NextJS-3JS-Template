/**
 * Contentful environment configuration.
 *
 * Resolution is lazy and only throws when a request is actually made, so the
 * project still builds and runs before a space has been wired up.
 */
export interface ContentfulConfig {
  spaceId: string;
  environment: string;
  deliveryToken: string;
  previewToken: string;
}

export class ContentfulConfigError extends Error {
  constructor(missing: string[]) {
    super(
      `Missing Contentful environment variable(s): ${missing.join(', ')}. ` +
        'Copy .env.example to .env.local and fill them in.',
    );

    this.name = 'ContentfulConfigError';
  }
}

export function getContentfulConfig(): ContentfulConfig {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const deliveryToken = process.env.CONTENTFUL_DELIVERY_TOKEN;
  const previewToken = process.env.CONTENTFUL_PREVIEW_TOKEN;

  const missing = [
    ['CONTENTFUL_SPACE_ID', spaceId],
    ['CONTENTFUL_DELIVERY_TOKEN', deliveryToken],
    ['CONTENTFUL_PREVIEW_TOKEN', previewToken],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name as string);

  if (missing.length > 0) throw new ContentfulConfigError(missing);

  return {
    spaceId: spaceId as string,
    environment: process.env.CONTENTFUL_ENVIRONMENT ?? 'master',
    deliveryToken: deliveryToken as string,
    previewToken: previewToken as string,
  };
}

export function getContentfulEndpoint(config: ContentfulConfig): string {
  return `https://graphql.contentful.com/content/v1/spaces/${config.spaceId}/environments/${config.environment}`;
}
