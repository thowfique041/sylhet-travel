import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cx } from '@/lib/format';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

/** Password field with a button that shows or hides what was typed. */
export const PasswordInput = forwardRef<HTMLInputElement, Props>(function PasswordInput({ className, ...rest }, ref) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input ref={ref} type={show ? 'text' : 'password'} className={cx('field pr-12', className)} {...rest} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        aria-pressed={show}
        className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-stone transition hover:bg-black/5 hover:text-deep"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
});
