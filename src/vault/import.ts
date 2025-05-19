import {
  UpsertResult,
  VaultEntry,
  tryAcceptEntry,
  upsertVaultEntries,
} from ".";

export interface ImportResult {
  accepted: VaultEntry[];
  rejected: any[];
  upsertResult: UpsertResult;
}

export function importResultMessage({
  accepted,
  rejected,
  upsertResult: { created, overwriten, skipped },
}: ImportResult): string {
  return [
    accepted.length &&
      `Successfully resolved ${accepted.length} entries of which ` +
        [
          created.length && `${created.length} were newly created`,
          overwriten.length && `${overwriten.length} were overwrites`,
          skipped.length && `${skipped.length} were skipped`,
        ]
          .filter(Boolean)
          .reduce(reduceComaAndJoin, "") +
        ".",
    rejected.length && `Failed to convert ${rejected.length} entries.`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export async function importPartials(
  partials: Partial<VaultEntry>[]
): Promise<ImportResult> {
  const accepted = <VaultEntry[]>[];
  const rejected = <any[]>[];
  for (const partial of partials) {
    const result = tryAcceptEntry(partial);
    if (result) accepted.push(result);
    else rejected.push(partial);
  }
  const upsertResult = await upsertVaultEntries(...accepted);
  return { accepted, rejected, upsertResult };
}

function reduceComaAndJoin<T>(
  state: string,
  current: T,
  index: number,
  list: T[]
): string {
  if (!state) return String(current);
  if (index === list.length - 1) return `${state} and ${current}`;
  return `${state}, ${current}`;
}
