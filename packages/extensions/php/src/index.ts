import { PhpLanguageAdapter } from '@vedh/parser';
import type { VedhExtension } from '@vedh/extension-api';
const extension: VedhExtension = {
  id: 'vedh.php',
  name: 'PHP',
  version: '1.0.0',
  languageAdapters: [new PhpLanguageAdapter()],
};
export default extension;
