import { TypeScriptLanguageAdapter } from '@vedh/parser';
import type { VedhExtension } from '@vedh/extension-api';
const extension: VedhExtension = {
  id: 'vedh.js-ts',
  name: 'JavaScript and TypeScript',
  version: '1.0.0',
  languageAdapters: [
    new TypeScriptLanguageAdapter('typescript'),
    new TypeScriptLanguageAdapter('tsx'),
    new TypeScriptLanguageAdapter('javascript'),
    new TypeScriptLanguageAdapter('jsx'),
  ],
};
export default extension;
