/** Locate a field in the displayed JSON, following its full object/array path. */
export function jsonFieldRange(json: string, target: string) {
  const tokens = [
    ...json.matchAll(
      /"(?:\\.|[^"\\])*"|[{}[\]:,]|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|true|false|null/g
    ),
  ]
  let index = 0
  let result: { start: number; end: number } | undefined
  function value(path: string): number {
    const token = tokens[index++]
    if (!token) return json.length
    if (token[0] === "{") {
      while (index < tokens.length && tokens[index][0] !== "}") {
        const key = tokens[index++]
        const name = JSON.parse(key[0]) as string
        index++ // colon
        const child = path ? `${path}.${name}` : name
        const end = value(child)
        if (child === target) result = { start: key.index, end }
        if (tokens[index]?.[0] !== ",") break
        index++
      }
      const close = tokens[index++]
      return close ? close.index + 1 : json.length
    }
    if (token[0] === "[") {
      let item = 0
      while (index < tokens.length && tokens[index][0] !== "]") {
        value(`${path}[${item++}]`)
        if (tokens[index]?.[0] !== ",") break
        index++
      }
      const close = tokens[index++]
      return close ? close.index + 1 : json.length
    }
    return token.index + token[0].length
  }
  value("")
  return result
}
