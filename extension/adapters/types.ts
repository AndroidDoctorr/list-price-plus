export interface SiteDefinition {
  id: string;
  label: string;
  hostPatterns: string[];
  pathPattern: RegExp;
  /** Manifest match patterns for the content script */
  contentScriptMatches: string[];
}

export interface SiteAdapter {
  id: string;
  extract(): Promise<{ facts: unknown; errors: string[] }>;
}
