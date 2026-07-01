import type { SiteAdapter } from './types';

import { fctuckerAdapter } from './fctucker/v1';

import { realtorAdapter } from './realtor/v1';

import { redfinAdapter } from './redfin/v1';

import { zillowAdapter } from './zillow/v1';



const adapters: Record<string, SiteAdapter> = {

  zillow: zillowAdapter,

  fctucker: fctuckerAdapter,

  redfin: redfinAdapter,

  realtor: realtorAdapter,

};



export function getAdapterForSite(siteId: string): SiteAdapter | undefined {

  return adapters[siteId];

}



export { fctuckerAdapter, realtorAdapter, redfinAdapter, zillowAdapter };

