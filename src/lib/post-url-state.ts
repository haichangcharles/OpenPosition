export function clearSelectedPostId(params: URLSearchParams) {
  const next = new URLSearchParams(params);
  next.delete("id");
  return next;
}

export function getSelectedPostId(params: URLSearchParams) {
  const rawId = params.get("id");
  if (!rawId) {
    return null;
  }
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function setSelectedPostId(params: URLSearchParams, id: number) {
  const next = new URLSearchParams(params);
  next.set("id", String(id));
  return next;
}
