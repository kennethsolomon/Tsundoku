export function getDescription(description) {
  if (!description) return "";
  return (
    description?.en ||
    description?.["en"] ||
    Object.values(description)[0] ||
    ""
  );
}

export function formatDate(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
