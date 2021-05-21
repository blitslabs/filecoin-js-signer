export function printDecimal(buffer: Buffer) {
    let s = "[";
    for (const e of buffer) {
        s += e.toString(10) + ","
    }
    return s + "]"
}
