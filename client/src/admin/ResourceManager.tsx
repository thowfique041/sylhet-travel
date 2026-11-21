import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { invalidate } from '@/hooks/useData';
import { FieldInput, type Field } from './fields';

type Doc = Record<string, unknown> & { _id?: string };

export interface Column {
  key: string;
  label: string;
  render?: (d: Doc) => React.ReactNode;
}

interface Props {
  resource: string;
  title: string;
  fields: Field[];
  columns: Column[];
  defaults: Doc;
  /** Public cache prefixes to clear after a change, so the site shows edits at once */
  publicPaths?: string[];
  prepare?: (d: Doc) => Doc;
  quickToggle?: { key: string; label: string };
}

/** Generic list + editor for one admin collection. */
export function ResourceManager({ resource, title, fields, columns, defaults, publicPaths = [], prepare, quickToggle }: Props) {
  const [items, setItems] = useState<Doc[]>([]);
  const [editing, setEditing] = useState<Doc | null>(null);
  const [q, setQ] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await api<Doc[]>(`/admin/${resource}`));
      setErr('');
    } catch (e) {
      setErr((e as ApiError).message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resource]);

  const refreshPublic = () => publicPaths.forEach((p) => invalidate(p));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    setErr('');
    const { _id, createdAt: _c, updatedAt: _u, __v: _v, rating: _r, reviewCount: _rc, ...body } = editing;
    try {
      const payload = prepare ? prepare(body) : body;
      if (_id) await api(`/admin/${resource}/${_id}`, { method: 'PUT', json: payload });
      else await api(`/admin/${resource}`, { method: 'POST', json: payload });
      setEditing(null);
      refreshPublic();
      await load();
    } catch (e2) {
      setErr((e2 as ApiError).message);
    } finally {
      setBusy(false);
    }
  };

  const del = async (d: Doc) => {
    if (!window.confirm(`Delete "${String(d.name ?? d.title ?? d.slug)}"? This cannot be undone.`)) return;
    try {
      await api(`/admin/${resource}/${d._id}`, { method: 'DELETE' });
      refreshPublic();
      await load();
    } catch (e) {
      setErr((e as ApiError).message);
    }
  };

  const toggle = async (d: Doc) => {
    if (!quickToggle) return;
    try {
      await api(`/admin/${resource}/${d._id}`, { method: 'PATCH', json: { [quickToggle.key]: !d[quickToggle.key] } });
      refreshPublic();
      await load();
    } catch (e) {
      setErr((e as ApiError).message);
    }
  };

  const shown = items.filter((d) => !q || JSON.stringify(d).toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-4xl">{title}</h2>
        <div className="flex gap-3">
          <label className="relative">
            <span className="sr-only">Filter</span>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone" />
            <input className="field h-11 py-2 pl-9" placeholder="Filter" value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          <button className="btn-deep" onClick={() => setEditing(structuredClone(defaults))}>
            <Plus size={17} /> Add new
          </button>
        </div>
      </div>
      {err && !editing && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">
          {err}
        </p>
      )}
      <div className="mt-6 overflow-x-auto rounded-2xl border rule bg-white/60">
        <table className="w-full min-w-[640px] text-left text-[15px]">
          <thead className="text-sm text-stone">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3 font-semibold">
                  {c.label}
                </th>
              ))}
              {quickToggle && <th className="px-4 py-3 font-semibold">{quickToggle.label}</th>}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length + 2} className="px-4 py-6 text-stone">
                  Loading
                </td>
              </tr>
            )}
            {!loading && !shown.length && (
              <tr>
                <td colSpan={columns.length + 2} className="px-4 py-6 text-stone">
                  Nothing here yet. Use Add new to create the first one.
                </td>
              </tr>
            )}
            {shown.map((d) => (
              <tr key={d._id} className="border-t rule">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 align-middle">
                    {c.render ? c.render(d) : String(d[c.key] ?? '')}
                  </td>
                ))}
                {quickToggle && (
                  <td className="px-4 py-3">
                    <button onClick={() => toggle(d)} className={`chip ${d[quickToggle.key] ? 'border-deep bg-deep text-glow' : ''}`} aria-pressed={Boolean(d[quickToggle.key])}>
                      {d[quickToggle.key] ? 'On' : 'Off'}
                    </button>
                  </td>
                )}
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <button className="p-2 hover:text-accent" aria-label="Edit" onClick={() => setEditing(structuredClone(d))}>
                    <Pencil size={17} />
                  </button>
                  <button className="p-2 hover:text-red-700" aria-label="Delete" onClick={() => del(d)}>
                    <Trash2 size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div className="fixed inset-0 z-[80] flex justify-end bg-black/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.form
              onSubmit={save}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.4, ease: [0.77, 0, 0.18, 1] }}
              className="flex h-full w-full max-w-3xl flex-col bg-mist shadow-2xl"
              role="dialog"
              aria-modal
              aria-label={editing._id ? 'Edit item' : 'New item'}
            >
              <div className="flex items-center justify-between border-b rule px-6 py-4">
                <h3 className="text-3xl">{editing._id ? 'Edit' : 'New'} {title.toLowerCase().replace(/s$/, '')}</h3>
                <button type="button" className="p-2" onClick={() => setEditing(null)} aria-label="Close">
                  <X />
                </button>
              </div>
              <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
                {fields.map((f) => (
                  <div key={f.key}>
                    <span className="label">{f.label}</span>
                    <FieldInput f={f} doc={editing} set={(k, v) => setEditing((e) => (e ? { ...e, [k]: v } : e))} />
                    {'help' in f && f.help && <span className="mt-1 block text-xs text-stone">{f.help}</span>}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 border-t rule px-6 py-4">
                <button className="btn-deep" disabled={busy}>
                  {busy ? 'Saving' : 'Save changes'}
                </button>
                <button type="button" className="btn-line" onClick={() => setEditing(null)}>
                  Cancel
                </button>
                {err && (
                  <p role="alert" className="ml-2 text-sm text-red-700">
                    {err}
                  </p>
                )}
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
