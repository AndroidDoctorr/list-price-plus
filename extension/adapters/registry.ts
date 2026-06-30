import type { SiteDefinition } from './types';

export const sites: SiteDefinition[] = [
  {
    id: 'zillow',
    label: 'Zillow',
    hostPatterns: ['www.zillow.com', 'zillow.com'],
    pathPattern: /^\/homedetails\//,
    contentScriptMatches: [
      '*://www.zillow.com/homedetails/*',
      '*://zillow.com/homedetails/*',
    ],
  },
];

export function getContentScriptMatches(): string[] {
  return sites.flatMap((site) => site.contentScriptMatches);
}

export function getSiteForUrl(url: string): SiteDefinition | null {
  try {
    const parsed = new URL(url);
    return (
      sites.find(
        (site) =>
          site.hostPatterns.includes(parsed.hostname) &&
          site.pathPattern.test(parsed.pathname),
      ) ?? null
    );
  } catch {
    return null;
  }
}

export function getSiteById(id: string): SiteDefinition | undefined {
  return sites.find((site) => site.id === id);
}
