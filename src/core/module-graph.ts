import { readFile } from "node:fs/promises"
import { ModuleResolver } from "./resolver.js"
import { DependencyScanner } from "./dependency-scanner.js"

export interface ModuleNode {
    id: string,
    source: string,
    dependencies: string[]
}

export class ModuleGraph {
    private modules = new Map<string, ModuleNode>()

    constructor(
        private readonly resolver: ModuleResolver,
        private readonly scanner: DependencyScanner
    ) {}

    async build(entry: string): Promise<void> {
        this.modules.clear()
        await this.visit(entry)
    }

    private async visit(id: string): Promise<void> {
        if (this.modules.has(id)) {
            return
        }

        const source = await readFile(id, "utf-8")

        const imports = this.scanner.scan(source)

        const dependencies = imports.map((specifier) => this.resolver.resolve(id, specifier))

        const node: ModuleNode = {
            id,
            source,
            dependencies
        }

        this.modules.set(id, node)

        for(const dependency of dependencies) {
            await this.visit(dependency)
        }
    }

    getModules(): ModuleNode[] {
        return [...this.modules.values()]
    }
}