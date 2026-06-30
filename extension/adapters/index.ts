import type { SiteAdapter } from './types';
import { zillowAdapter } from './zillow/v1';

const adapters: Record<string, SiteAdapter> = {
  zillow: zillowAdapter,
};

export function getAdapterForSite(siteId: string): SiteAdapter | undefined {
  return adapters[siteId];
}

export { zillowAdapter };
