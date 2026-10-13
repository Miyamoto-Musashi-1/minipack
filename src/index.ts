import path from "node:path"

import { ModuleResolver } from "./core/resolver.js"
import { DependencyScanner } from "./core/dependency-scanner.js"
import { ModuleGraph } from "./core/module-graph.js"

async function main() {
    const entry = path.resolve(
        "examples/basic/src/main.js"
    )

    const graph = new ModuleGraph(
        new ModuleResolver(),
        new DependencyScanner()
    )

    await graph.build(entry)

    for (const module of graph.getModules()) {
        console.log({
            module: path.basename(module.id),
            dependencies: module.dependencies.map(
                dependency => path.basename(dependency)
            )
        })
    }
}

main().catch(console.error)