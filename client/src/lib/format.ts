export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const taka = (n: number) => `৳${Math.round(n).toLocaleString('en-IN')}`;

export const range = (min: number, max: number) => (min === max ? taka(min) : `${taka(min)} to ${taka(max)}`);

export function niceDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function addDays(iso: string, n: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');
