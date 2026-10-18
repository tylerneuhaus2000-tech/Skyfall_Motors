export function csvCell(value: string | number | boolean | null | undefined) {
  let text = value === null || value === undefined ? "" : String(value);
  let first = 0;
  while (first < text.length) {
    const character = text[first];
    const code = character?.charCodeAt(0) ?? 0;
    if (character && code > 0x20 && code !== 0x7f && !/\s/.test(character))
      break;
    first += 1;
  }
  if (first < text.length && "=+-@".includes(text[first] ?? ""))
    text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function toCsv(
  headers: string[],
  rows: Array<Array<string | number | boolean | null | undefined>>,
) {
  return [headers, ...rows]
    .map((row) => row.map(csvCell).join(";"))
    .join("\r\n");
}
