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

  {

    id: 'fctucker',

    label: 'FC Tucker',

    hostPatterns: ['www.talktotucker.com', 'talktotucker.com'],

    pathPattern: /^\/homes\/[^/]+\/[^/]+\/?$/,

    contentScriptMatches: [

      '*://www.talktotucker.com/homes/*/*',

      '*://talktotucker.com/homes/*/*',

    ],

  },

  {

    id: 'redfin',

    label: 'Redfin',

    hostPatterns: ['www.redfin.com', 'redfin.com'],

    pathPattern: /\/home\/\d+\/?$/,

    contentScriptMatches: ['*://www.redfin.com/*', '*://redfin.com/*'],

  },

  {

    id: 'realtor',

    label: 'Realtor.com',

    hostPatterns: ['www.realtor.com', 'realtor.com'],

    pathPattern: /^\/realestateandhomes-detail\/.+/,

    contentScriptMatches: [

      '*://www.realtor.com/realestateandhomes-detail/*',

      '*://realtor.com/realestateandhomes-detail/*',

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

