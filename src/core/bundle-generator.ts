import type { ModuleNode } from "./module-graph.js"
import { ModuleTransformer } from "./transformer.js"

export class BundleGenerator {
    constructor(private readonly transformer: ModuleTransformer) {}

    generate(modules: ModuleNode[]): string {
        const moduleIds = new Map(
            modules.map((module) => [
                module.id,
                module.numbericId
            ])
        )

        const factories = modules.map((module) => {
            const transformed = this.transformer.transform(module, moduleIds)

            return `
                ${module.numbericId}: function(module, exports, require) {
                    ${transformed}
                }
            `
        })

        return `
        (function(modules) {
            const cache = {};

            function require(id) {
            if (Object.prototype.hasOwnProperty.call(cache, id)) {
                return cache[id].exports;
            }

            const factory = modules[id];

            if (!factory) {
                throw new Error("Module " + id + " not found");
            }

            const module = { exports: {} };

            cache[id] = module;

            factory(module, module.exports, require);

            return module.exports;
            }

            require(0);
        })({
            ${factories.join(",")}
        });
        `
    }
}