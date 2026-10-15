import { parse } from 'acorn'

const source = `
    export function greet(name) {
        return ` + "`${name}`" +`
    }
`

const ast = parse(source, {
    ecmaVersion: "latest",
    sourceType: "module"
})

console.dir(ast, { depth: null})

