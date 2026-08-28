export function planVariantRemovals({
  existingIds,
  incomingIds,
  referencedIds,
}: {
  existingIds: number[];
  incomingIds: number[];
  referencedIds: number[];
}) {
  const incoming = new Set(incomingIds);
  const referenced = new Set(referencedIds);
  const omitted = existingIds.filter((id) => !incoming.has(id));
  return {
    deleteIds: omitted.filter((id) => !referenced.has(id)),
    deactivateIds: omitted.filter((id) => referenced.has(id)),
  };
}
