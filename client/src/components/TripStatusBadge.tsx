import type { TripStatus } from '@shared/types';
import { cx } from '@/lib/format';

const STYLE: Record<TripStatus, string> = {
  pending: 'bg-amber-100 text-amber-900',
  approved: 'bg-emerald-100 text-emerald-900',
  rejected: 'bg-red-100 text-red-800',
};
const LABEL: Record<TripStatus, string> = { pending: 'Waiting for review', approved: 'Approved', rejected: 'Not approved' };

export function TripStatusBadge({ status }: { status?: TripStatus }) {
  const st = status ?? 'pending';
  return <span className={cx('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold', STYLE[st])}>{LABEL[st]}</span>;
}
