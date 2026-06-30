import { Helmet } from "react-helmet-async";

const BASE_URL = "https://bridgepathnetwork.com";
const SITE_NAME = "Bridgepath Africa";
const DEFAULT_IMAGE = `${BASE_URL}/opengraph.jpg`;

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface PageSEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  breadcrumbs?: BreadcrumbItem[];
  type?: "website" | "article";
  noIndex?: boolean;
  jsonLd?: object | object[];
}

export function PageSEO({
  title,
  description,
  path = "/",
  image = DEFAULT_IMAGE,
  breadcrumbs,
  type = "website",
  noIndex = false,
  jsonLd,
}: PageSEOProps) {
  const fullTitle = title.includes(SITE_NAME)
    ? title
    : `${title} | ${SITE_NAME}`;
  const canonical = `${BASE_URL}${path}`;

  const breadcrumbSchema =
    breadcrumbs && breadcrumbs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: `${BASE_URL}/`,
            },
            ...breadcrumbs.map((b, i) => ({
              "@type": "ListItem",
              position: i + 2,
              name: b.name,
              item: `${BASE_URL}${b.path}`,
            })),
          ],
        }
      : null;

  const extraSchemas = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={image} />

      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
      {extraSchemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
