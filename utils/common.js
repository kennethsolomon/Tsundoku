export function getDescription(description) {
	if (!description) return "";
	return description?.en || description?.["en"] || Object.values(description)[0] || "";
}