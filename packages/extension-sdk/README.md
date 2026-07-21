# Vedh Extension SDK

Create an extension with a typed manifest:

```ts
import { defineEventExtension } from '@vedh/extension-sdk';

export default defineEventExtension({
  id: 'acme.vedh-wordpress',
  name: 'Acme WordPress conventions',
  version: '1.0.0',
  eventCalls: {
    fires: {
      do_action: { eventArgument: 0, eventKind: 'action' },
    },
  },
});
```

For a language, use `language()` with declaration node kinds and focused
relation handlers. The SDK handles tree walking, source ranges, and relation
location metadata:

```ts
import Go from 'tree-sitter-go';
import {
  defineLanguageExtension,
  field,
  language,
  referenceRelation,
} from '@vedh/extension-sdk';

export default defineLanguageExtension({
  id: 'acme.go',
  name: 'Go',
  version: '1.0.0',
  languages: [
    language({
      id: 'go',
      extensions: ['.go'],
      grammar: Go,
      declarations: ['function_declaration', 'method_declaration'],
      relations: {
        call_expression(node, context) {
          const target = field(node, 'function');
          return target
            ? referenceRelation(context, target, {
                target: target.text,
                role: 'call',
              })
            : undefined;
        },
      },
    }),
  ],
});
```

`importRelation`, `exportRelation`, `referenceRelation`, and `eventRelation` add
the source file and exact range automatically. `field`, `namedChildren`, `walk`,
`sourceRange`, and `unquote` cover common Tree-sitter work. Custom adapters that
extend `BaseLanguageAdapter` remain supported.

Keep grammar packages in the extension package, then install and register it
from the target project:

```sh
npm install --save-dev @acme/vedh-extension-go
vedh extensions add @acme/vedh-extension-go
```

Vedh resolves registered packages from the target project's dependency tree.
JavaScript/TypeScript, Python, and PHP remain the three built-in language
extensions; additional languages and framework conventions such as WordPress are
intentionally SDK packages rather than core features.
