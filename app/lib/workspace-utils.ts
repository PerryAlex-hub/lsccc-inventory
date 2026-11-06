export const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
export const today = () => new Date().toISOString();

// datetime-local has no timezone. Forms and records consistently use Lagos time.
export function localDateTime(date = new Date()) {
  return new Date(date.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16);
}

export function parseLocalDateTime(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}:00+01:00`);
  if (!Number.isFinite(date.getTime()) || localDateTime(date) !== value) return null;
  return date.toISOString();
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos", dateStyle: "medium", timeStyle: "short",
  }).format(new Date(value));
}

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((row) =>
      row.map((value) => {
        const text = String(value);
        const safe = /^[=+@\-\t\r]/.test(text) ? `'${text}` : text;
        return `"${safe.replaceAll('"', '""')}"`;
      }).join(","),
    )
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
