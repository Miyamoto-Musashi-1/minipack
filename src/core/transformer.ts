
import type { ModuleNode } from "./module-graph.js";

export class ModuleTransformer {
  transform(
    module: ModuleNode,
    moduleIds: Map<string, number>
  ): string {
    let code = module.source;

    // 1. Transform named imports
    // import { greet } from "./greet.js"
    // -> const { greet } = require(1);
    code = code.replace(
      /import\s+\{\s*(\w+)\s*\}\s+from\s+["']([^"']+)["'];?/g,
      (_, importedName: string, specifier: string) => {
        const dependency = module.dependencies.find((dep) =>
          dep.endsWith(specifier.replace("./", "/"))
        );

        if (!dependency) {
          throw new Error(`Cannot resolve ${specifier}`);
        }

        const id = moduleIds.get(dependency);

        if (id === undefined) {
          throw new Error(`Missing module ID: ${dependency}`);
        }

        return `const { ${importedName} } = require(${id});`;
      }
    );

    // 2. Transform exported constants
    // export const prefix = "Hello";
    // -> const prefix = "Hello";
    // -> exports.prefix = prefix;
    code = code.replace(
      /export\s+const\s+(\w+)\s*=\s*([^;]+);?/g,
      (_, name: string, value: string) => {
        return `const ${name} = ${value};\nexports.${name} = ${name};`;
      }
    );

    // 3. Transform exported functions
    // Remove "export" without parsing the function body.
    const exportedFunctions: string[] = [];

    code = code.replace(
      /\bexport\s+function\s+([a-zA-Z_$][\w$]*)\s*\(/g,
      (_, name: string) => {
        exportedFunctions.push(name);

        return `function ${name}(`;
      }
    );

    // 4. Append function exports after the module source.
    // This avoids breaking template literals and nested braces.
    for (const name of exportedFunctions) {
      code += `\nexports.${name} = ${name};`;
    }

    return code;
  }
}
