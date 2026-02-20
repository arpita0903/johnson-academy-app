/**
 * Extracts unique top-level prefixes from path-like strings.
 * Example: ["JA01/PNO/MW6", "JA02/PNO/MW3"] → ["JA01", "JA02"]
 */
export function getTopLevelPrefixes(items: string[]): string[] {
  const prefixes = new Set<string>();
  items.forEach((item) => {
    const prefix = item.split("/")[0];
    if (prefix) {
      prefixes.add(prefix);
    }
  });
  return Array.from(prefixes).sort();
}

/**
 * Filters items that start with the given prefix and returns unique full paths.
 * Example: items=["JA01/PNO/MW6", "JA01/PNO/MW6", "JA01/PNO/MW8"], prefix="JA01"
 *          → ["JA01/PNO/MW6", "JA01/PNO/MW8"]
 */
export function getItemsByPrefix(items: string[], prefix: string): string[] {
  const matching = items.filter(
    (item) => item === prefix || item.startsWith(`${prefix}/`)
  );
  return Array.from(new Set(matching)).sort();
}

/**
 * Filters classes whose name matches the given prefix.
 * Returns all matching classes (no deduplication - same name can be different courses).
 */
export function getClassesByPrefix<T extends { name: string }>(
  classes: T[],
  prefix: string
): T[] {
  return classes.filter(
    (c) => c.name === prefix || c.name.startsWith(`${prefix}/`)
  );
}

/**
 * Extracts the last segment from a path-like class code.
 * Example: "JA01/PNO/MW6" → "MW6", "JA02/PNO/MW3" → "MW3"
 */
export function getLastSegment(classCode: string): string {
  const parts = classCode.split("/").filter(Boolean);
  return parts.length > 0 ? parts[parts.length - 1] : classCode;
}

export interface ClassGroup<T> {
  groupKey: string;
  classes: T[];
}

/**
 * Groups classes by the last segment of their name (e.g., MW6, MW8).
 * Maintains backward compatibility: classes without "/" are grouped by full name.
 */
export function groupClassesByLastSegment<T extends { name: string }>(
  classes: T[]
): ClassGroup<T>[] {
  const map = new Map<string, T[]>();
  classes.forEach((c) => {
    const key = getLastSegment(c.name);
    const list = map.get(key) ?? [];
    list.push(c);
    map.set(key, list);
  });
  return Array.from(map.entries())
    .map(([groupKey, classesInGroup]) => ({ groupKey, classes: classesInGroup }))
    .sort((a, b) => a.groupKey.localeCompare(b.groupKey));
}
