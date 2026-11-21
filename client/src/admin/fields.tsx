import { useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import type { Photo as PhotoT, Theme } from '@shared/types';
import { Photo } from '@/components/Photo';
import { MONTHS, cx } from '@/lib/format';
import { tokenStore } from '@/lib/api';

export type Field =
  | { key: string; label: string; type: 'text' | 'textarea' | 'number' | 'bool' | 'date'; help?: string; required?: boolean }
  | { key: string; label: string; type: 'select'; options: { value: string; label: string }[]; help?: string }
  | { key: string; label: string; type: 'multi'; options: { value: string; label: string }[]; help?: string }
  | { key: string; label: string; type: 'lines'; help?: string }
  | { key: string; label: string; type: 'pairs'; keys: string[]; numeric?: string[]; help?: string }
  | { key: string; label: string; type: 'theme' }
  | { key: string; label: string; type: 'photo' }
  | { key: string; label: string; type: 'photos' }
  | { key: string; label: string; type: 'months' };

type Doc = Record<string, unknown>;

export function FieldInput({ f, doc, set }: { f: Field; doc: Doc; set: (k: string, v: unknown) => void }) {
  const v = doc[f.key];
  switch (f.type) {
    case 'text':
    case 'date':
      return <input className="field" type={f.type} required={'required' in f && f.required} value={(v as string) ?? ''} onChange={(e) => set(f.key, e.target.value)} />;
    case 'number':
      return <input className="field" type="number" step="any" value={v === undefined || v === null ? '' : String(v)} onChange={(e) => set(f.key, e.target.value === '' ? undefined : Number(e.target.value))} />;
    case 'textarea':
      return <textarea className="field" rows={3} value={(v as string) ?? ''} onChange={(e) => set(f.key, e.target.value)} />;
    case 'bool':
      return (
        <label className="inline-flex cursor-pointer items-center gap-3">
          <input type="checkbox" className="h-5 w-5 accent-[var(--c-deep)]" checked={Boolean(v)} onChange={(e) => set(f.key, e.target.checked)} />
          <span className="text-sm">{v ? 'Yes' : 'No'}</span>
        </label>
      );
    case 'select':
      return (
        <select className="field" value={(v as string) ?? ''} onChange={(e) => set(f.key, e.target.value)}>
          <option value="">Choose</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case 'multi': {
      const arr = (v as string[]) ?? [];
      return (
        <div className="flex flex-wrap gap-2">
          {f.options.map((o) => (
            <button type="button" key={o.value} className="chip" aria-pressed={arr.includes(o.value)} onClick={() => set(f.key, arr.includes(o.value) ? arr.filter((x) => x !== o.value) : [...arr, o.value])}>
              {o.label}
            </button>
          ))}
        </div>
      );
    }
    case 'months': {
      const arr = (v as number[]) ?? [];
      return (
        <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-12">
          {MONTHS.map((m, i) => (
            <button type="button" key={m} className={cx('rounded-lg border rule py-2 text-sm', arr.includes(i + 1) && 'border-deep bg-deep text-glow')} onClick={() => set(f.key, arr.includes(i + 1) ? arr.filter((x) => x !== i + 1) : [...arr, i + 1].sort((a, b) => a - b))}>
              {m}
            </button>
          ))}
        </div>
      );
    }
    case 'lines':
      return <LinesInput value={(v as string[]) ?? []} onChange={(x) => set(f.key, x)} />;
    case 'pairs':
      return <PairsInput keys={f.keys} numeric={f.numeric ?? []} value={(v as Doc[]) ?? []} onChange={(x) => set(f.key, x)} />;
    case 'theme':
      return <ThemeInput value={v as Theme | undefined} onChange={(x) => set(f.key, x)} />;
    case 'photo':
      return <PhotoInput value={v as PhotoT | undefined} onChange={(x) => set(f.key, x)} />;
    case 'photos':
      return <PhotosInput value={(v as PhotoT[]) ?? []} onChange={(x) => set(f.key, x)} />;
  }
}

function LinesInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [text, setText] = useState(value.join('\n'));
  return (
    <textarea
      className="field font-mono text-sm"
      rows={Math.min(10, Math.max(3, value.length + 1))}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(e.target.value.split('\n').map((s) => s.trim()).filter(Boolean));
      }}
      placeholder="One item per line"
    />
  );
}

/** Array of small objects edited as "a | b | c" lines; simple and copy-paste friendly. */
function PairsInput({ keys, numeric, value, onChange }: { keys: string[]; numeric: string[]; value: Doc[]; onChange: (v: Doc[]) => void }) {
  const [text, setText] = useState(value.map((o) => keys.map((k) => o[k] ?? '').join(' | ')).join('\n'));
  return (
    <>
      <textarea
        className="field font-mono text-sm"
        rows={Math.min(10, Math.max(3, value.length + 1))}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onChange(
            e.target.value
              .split('\n')
              .filter((l) => l.trim())
              .map((l) => {
                const parts = l.split('|').map((s) => s.trim());
                const o: Doc = {};
                keys.forEach((k, i) => {
                  if (parts[i] === undefined || parts[i] === '') return;
                  o[k] = numeric.includes(k) ? Number(parts[i]) || 0 : parts[i];
                });
                return o;
              }),
          );
        }}
      />
      <span className="mt-1 block text-xs text-stone">One per line: {keys.join(' | ')}</span>
    </>
  );
}

function ThemeInput({ value, onChange }: { value?: Theme; onChange: (t: Theme) => void }) {
  const t: Theme = value ?? { deep: '#18232b', mist: '#e4eaee', accent: '#8fb6cf', stone: '#8b9298', glow: '#f3f6f8' };
  const labels: Record<keyof Theme, string> = { deep: 'Deep (overlays, footer)', mist: 'Mist (page background)', accent: 'Accent (signature)', stone: 'Stone (muted text)', glow: 'Glow (text on deep)' };
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr,220px]">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {(Object.keys(labels) as (keyof Theme)[]).map((k) => (
          <label key={k} className="flex items-center gap-3 rounded-xl border rule p-2">
            <input type="color" value={t[k]} onChange={(e) => onChange({ ...t, [k]: e.target.value })} className="h-9 w-12 cursor-pointer rounded border-0 bg-transparent" />
            <span className="min-w-0 text-sm">
              <span className="block font-medium">{labels[k]}</span>
              <span className="font-mono text-xs text-stone">{t[k]}</span>
            </span>
          </label>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl" style={{ background: t.mist }} aria-label="Theme preview">
        <div className="p-4" style={{ background: t.deep, color: t.glow }}>
          <p className="font-display text-2xl">Preview</p>
          <p className="text-sm opacity-80">Hero overlay and text</p>
          <span className="mt-3 inline-block rounded-full px-3 py-1 text-sm font-semibold" style={{ background: t.accent, color: t.deep }}>
            Explore
          </span>
        </div>
        <p className="p-4 text-sm" style={{ color: t.deep }}>
          Page text <span style={{ color: t.stone }}>and muted notes</span>
        </p>
      </div>
    </div>
  );
}

async function uploadFile(file: File): Promise<{ url: string; w: number }> {
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd, headers: { Authorization: `Bearer ${tokenStore.get()}` } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? 'Upload failed');
  return data;
}

function PhotoInput({ value, onChange }: { value?: PhotoT & { url?: string }; onChange: (p: PhotoT & { url?: string }) => void }) {
  const p = value ?? { path: '', w: 1920 };
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  return (
    <div className="grid gap-4 sm:grid-cols-[180px,1fr]">
      <Photo photo={p} width={960} className="aspect-[4/3] w-full rounded-xl object-cover" />
      <div className="space-y-2">
        <input className="field text-sm" placeholder="Commons path, e.g. 9/9b/Ratargul_0276.jpg" value={p.path ?? ''} onChange={(e) => onChange({ ...p, path: e.target.value, url: '' })} />
        <input className="field text-sm" placeholder="Or image URL (Cloudinary)" value={p.url ?? ''} onChange={(e) => onChange({ ...p, url: e.target.value })} />
        <div className="grid grid-cols-[110px,1fr] gap-2">
          <input className="field text-sm" type="number" placeholder="Width" value={p.w ?? ''} onChange={(e) => onChange({ ...p, w: Number(e.target.value) })} aria-label="Original width in pixels" />
          <input className="field text-sm" placeholder="Alt text" value={p.alt ?? ''} onChange={(e) => onChange({ ...p, alt: e.target.value })} />
        </div>
        <input
          ref={ref}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            setErr('');
            try {
              const r = await uploadFile(file);
              onChange({ ...p, url: r.url, w: r.w, path: '' });
            } catch (x) {
              setErr((x as Error).message);
            } finally {
              setBusy(false);
              e.target.value = '';
            }
          }}
        />
        <button type="button" className="btn-line py-2 text-sm" onClick={() => ref.current?.click()} disabled={busy}>
          <Upload size={15} /> {busy ? 'Uploading' : 'Upload image'}
        </button>
        {err && <p className="text-sm text-red-700">{err}</p>}
      </div>
    </div>
  );
}

function PhotosInput({ value, onChange }: { value: (PhotoT & { url?: string })[]; onChange: (v: PhotoT[]) => void }) {
  return (
    <div className="space-y-4">
      {value.map((p, i) => (
        <div key={i} className="rounded-2xl border rule p-3">
          <PhotoInput value={p} onChange={(np) => onChange(value.map((x, j) => (j === i ? np : x)))} />
          <button type="button" className="mt-2 text-sm font-semibold text-red-700" onClick={() => onChange(value.filter((_, j) => j !== i))}>
            Remove photo
          </button>
        </div>
      ))}
      <button type="button" className="btn-line py-2 text-sm" onClick={() => onChange([...value, { path: '', w: 1920, alt: '' }])}>
        Add photo
      </button>
    </div>
  );
}
