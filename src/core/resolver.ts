import path from 'node:path'

export class ModuleResolver {
    resolve(importer: string, specifier: string): string {
        if (!specifier.startsWith('./') && !specifier.startsWith("../")) {
            throw new Error(`Unsupported import: ${specifier}`)
        }

        const directory = path.dirname(importer)

        return path.resolve(directory, specifier)
    }
}