import path from "node:path"
import { mkdir, writeFile } from "node:fs/promises";

import { ModuleGraph } from "./core/module-graph.js"
import { ModuleResolver } from "./core/resolver.js"
import { DependencyScanner } from "./core/dependency-scanner.js"
import { BundleGenerator } from "./core/bundle-generator.js"
import { ModuleTransformer } from "./core/transformer.js"

async function main() {
    const entry = path.resolve(
        "examples/basic/src/main.js"
    )

    const graph = new ModuleGraph(
        new ModuleResolver(),
        new DependencyScanner()
    )

    await graph.build(entry)

    const generator = new BundleGenerator(
        new ModuleTransformer()
    )

    const bundle = generator.generate(graph.getModules())

    const outputDirectory = path.resolve(
        "examples/basic/dist"
    )

    await mkdir(outputDirectory, { recursive: true });

    const output = path.join(outputDirectory, "bundle.js")

    await writeFile(output, bundle, "utf-8")

    console.log(`Bundle generated: ${output}`)

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});