import type { PropertyFacts } from '@list-price-plus/core';

export interface SiteDefinition {
  id: string;
  label: string;
  hostPatterns: string[];
  pathPattern: RegExp;
  contentScriptMatches: string[];
}

export type FieldProvenance = NonNullable<PropertyFacts['fieldProvenance']>[string];

export interface ExtractResult {
  facts: PropertyFacts;
  errors: string[];
  adapterId: string;
  adapterVersion: string;
}

export interface SiteAdapter {
  id: string;
  version: string;
  extract(document: Document, url: string): ExtractResult;
}
