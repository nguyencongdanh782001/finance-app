export const updateExpandedGroupKeys = (
  current: ReadonlySet<string>,
  groupKey: string,
  open: boolean,
) => {
  const next = new Set(current);

  if (open) {
    next.add(groupKey);
  } else {
    next.delete(groupKey);
  }

  return next;
};
