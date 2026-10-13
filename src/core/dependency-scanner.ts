export class DependencyScanner {
    scan(source: string): string[] {
        const imports: string[] = []

        const pattern = /\bimport\s+(?:[\w*{}\s,]+\s+from\s+)?["']([^"']+)["']/g

        for (const match of source.matchAll(pattern)) {
            imports.push(match[1])
        }

        return imports
    }
}