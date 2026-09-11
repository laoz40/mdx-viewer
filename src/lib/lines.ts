export function parseLineRange(lines: string): number[] {
  const trimmed = lines.trim();
  if (trimmed.includes("-")) {
    const [startRaw, endRaw] = trimmed.split("-").map((part) => part.trim());
    const start = Number(startRaw);
    const end = Number(endRaw);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return [];
    const result: number[] = [];
    for (let line = start; line <= end; line += 1) {
      result.push(line);
    }
    return result;
  }

  const single = Number(trimmed);
  return Number.isFinite(single) ? [single] : [];
}
