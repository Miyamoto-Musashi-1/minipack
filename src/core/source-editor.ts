interface Edit {
    start: number
    end: number
    replacement: string
}

export class SourceEditor {
    private edits: Edit[] = []

    constructor(private readonly source: string) {}

    replace(start: number, end: number, replacement: string) {
        if (start < 0 || end < start ||  end > this.source.length) {
            throw new Error("Invalid source range")
        }

        this.edits.push({ start, end, replacement })
    }

    generate(): string {
        const edits = [...this.edits].sort(
            (a, b) => b.start - a.start
        )

        let output = this.source
        let previousStart = this.source.length

        for (const edit of edits) {
            if (edit.end > previousStart) {
                throw new Error("Overlapping source edits")
            }

            output = output.slice(0, edit.start) +
            edit.replacement + output.slice(edit.end)

            previousStart = edit.start
        }

        return output
    }
}