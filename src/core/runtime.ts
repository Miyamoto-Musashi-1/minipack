export function createRuntime(
    modules: Record<
    number,
    (module: any, exports: any, require: any) => void
    >
) {
    const cache = new Map<number, {exports: any}>()

    function require(id: number): any {
        const cached = cache.get(id)

        if (cached) {
            return cached.exports
        }

        const factory = modules[id]

        if (!factory) {
            throw new Error(`Module ${id} not found`)
        }

        const module = {
            exports: {}
        }

        cache.set(id, module)

        factory(module, module.exports, require)

        return module.exports
    }

    return require
}