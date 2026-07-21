import type { EventCallConfig, LanguageAdapter } from '@vedh/parser';

export interface VedhExtension {
  id: string;
  name: string;
  version: string;
  languageAdapters?: readonly LanguageAdapter[];
  eventCalls?: EventCallConfig;
}

export interface VedhExtensionModule {
  default: VedhExtension;
}
