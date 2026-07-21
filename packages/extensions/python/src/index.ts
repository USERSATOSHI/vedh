import { PythonLanguageAdapter } from '@vedh/parser';
import type { VedhExtension } from '@vedh/extension-api';
const extension: VedhExtension = {
  id: 'vedh.python',
  name: 'Python',
  version: '1.0.0',
  languageAdapters: [new PythonLanguageAdapter()],
};
export default extension;
