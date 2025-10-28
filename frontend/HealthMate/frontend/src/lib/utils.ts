// Utility helpers: date, rounding, aggregates, CSV download

export function fmtDateTime(iso: string | number | Date) {
  const d = new Date(iso);
  return d.toLocaleString();
}

export function round(n: number, digits = 1) {
  const k = Math.pow(10, digits);
  return Math.round(n * k) / k;
}

export function daysAgoISO(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export function avg(nums: number[]) {
  const valid = nums.filter(x => Number.isFinite(x));
  if (!valid.length) return undefined;
  return round(valid.reduce((a,b)=>a+b,0)/valid.length, 1);
}

export function sum(nums: number[]) {
  const valid = nums.filter(x => Number.isFinite(x));
  if (!valid.length) return undefined;
  return valid.reduce((a,b)=>a+b,0);
}

export function toCSV(rows: Record<string, any>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (v:any) => {
    if (v == null) return "";
    const s = String(v).replace(/"/g, '""');
    return /[,"\n]/.test(s) ? `"${s}"` : s;
  };
  return [
    headers.join(","),
    ...rows.map(r => headers.map(h => escape(r[h])).join(","))
  ].join("\n");
}

export function downloadTextFile(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(()=> URL.revokeObjectURL(url), 0);
}
