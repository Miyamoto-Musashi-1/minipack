import { parse } from 'acorn'

import type { ModuleNode } from "./module-graph.js"
import { SourceEditor } from './source-editor.js'
export class ModuleTransformer {
  transform(
    module: ModuleNode,
    moduleIds: Map<string, number>
  ): string {
    const ast = parse(module.source, {
      ecmaVersion: "latest",
      sourceType: "module",
    });

    const editor = new SourceEditor(module.source);
    const exportedNames: string[] = [];

    for (const node of ast.body) {
      if (node.type === "ImportDeclaration") {

        const specifier = node.source.value;

        if (typeof specifier !== "string") {
          throw new Error("Invalid import specifier");
        }

        const dependency = module.dependencies.get(specifier);

        if (!dependency) {
          throw new Error(`Cannot resolve ${specifier}`);
        }

        const id = moduleIds.get(dependency);

        if (id === undefined) {
          throw new Error(`Missing module ID: ${dependency}`);
        }

        const imports = node.specifiers.map((item) => {
          if (item.type !== "ImportSpecifier") {
            throw new Error("Only named imports supported");
          }

          const imported =
            item.imported.type === "Identifier"
              ? item.imported.name
              : item.imported.value;

          const local = item.local.name;

          return imported === local
            ? imported
            : `${imported}: ${local}`;
        });

        const replacement =
          imports.length > 0
            ? `const { ${imports.join(", ")} } = require(${id});`
            : `require(${id});`;

        editor.replace(node.start, node.end, replacement);
      }

      if (node.type === "ExportNamedDeclaration") {
        const declaration = node.declaration;

        if (!declaration) {
          throw new Error("Re-exports not supported yet");
        }

        if (declaration.type === "FunctionDeclaration") {
          if (!declaration.id) {
            throw new Error("Anonymous function export");
          }

          exportedNames.push(declaration.id.name);
        } else if (declaration.type === "VariableDeclaration") {
          for (const declarator of declaration.declarations) {
            if (declarator.id.type !== "Identifier") {
              throw new Error(
                "Destructured exports not supported yet"
              );
            }

            exportedNames.push(declarator.id.name);
          }
        } else {
          throw new Error(
            `Unsupported export: ${declaration.type}`
          );
        }

        // Remove only the "export" prefix.
        editor.replace(
          node.start,
          declaration.start,
          ""
        );
      }
    }

    const transformed = editor.generate();

    const exports = exportedNames
      .map((name) => `exports.${name} = ${name};`)
      .join("\n");

    return `${transformed}\n${exports}`;
  }
}
