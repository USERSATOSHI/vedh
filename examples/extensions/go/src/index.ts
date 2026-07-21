import Go from 'tree-sitter-go';
import {
  defineLanguageExtension,
  field,
  importRelation,
  language,
  namedChildren,
  referenceRelation,
  unquote,
} from '@vedh/extension-sdk';

export default defineLanguageExtension({
  id: 'example.vedh-go',
  name: 'Go',
  version: '0.1.0',
  languages: [
    language({
      id: 'go',
      extensions: ['.go'],
      grammar: Go,
      declarations: [
        'function_declaration',
        'method_declaration',
        'type_declaration',
      ],
      relations: {
        import_declaration(node, context) {
          return namedChildren(node).flatMap((spec) => {
            const path = field(spec, 'path');
            return path
              ? [importRelation(context, path, { module: unquote(path.text) })]
              : [];
          });
        },
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
