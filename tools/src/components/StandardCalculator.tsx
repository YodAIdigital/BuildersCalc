import React from 'react';
import { useSettings } from '../hooks/useSettings';

// A simple, modern calculator with extra actions: backspace, undo, +GST, -GST
// - Maintains a small history stack to support undo of the last operation
// - Uses Settings.gstRate for GST-related transforms
// - Keyboard support for digits, dot, operators, Enter, Backspace, Escape

export default function StandardCalculator({ className = '' }: { className?: string }) {
  const { settings } = useSettings();
  const gstRate = settings.gstRate ?? 0.15;
  const rootRef = React.useRef<HTMLDivElement | null>(null);

  const focusRing =
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(142,118,233,0.4)] focus-visible:ring-offset-0 focus-visible:ring-offset-transparent';
  const buttonAccent = `inline-flex items-center justify-center rounded-xl border border-white/10 bg-[#5B2A86] px-3 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-[#4A2170] ${focusRing}`;
  const buttonSoft = `inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-medium text-cyan-100 transition hover:bg-white/20 ${focusRing}`;
  const buttonGhost = `inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-cyan-50 transition hover:bg-white/10 ${focusRing}`;
  const buttonWarning = `inline-flex items-center justify-center rounded-xl border border-[#EFBDE8]/40 bg-[#EFBDE8]/20 px-3 py-2 text-sm font-medium text-[#FCE8F6] shadow-sm transition hover:bg-[#EFBDE8]/30 ${focusRing}`;

  type Snapshot = {
    display: string;
    acc: number | null;
    op: string | null;
    waiting: boolean;
  };

  const [display, setDisplay] = React.useState<string>('0');
  const [acc, setAcc] = React.useState<number | null>(null);
  const [op, setOp] = React.useState<string | null>(null);
  const [waiting, setWaiting] = React.useState<boolean>(false);
  const [history, setHistory] = React.useState<Snapshot[]>([]);

  function pushHistory() {
    setHistory((h) => [...h.slice(-19), { display, acc, op, waiting }]);
  }

  function restore(snapshot: Snapshot) {
    setDisplay(snapshot.display);
    setAcc(snapshot.acc);
    setOp(snapshot.op);
    setWaiting(snapshot.waiting);
  }

  function clearAll() {
    pushHistory();
    setDisplay('0');
    setAcc(null);
    setOp(null);
    setWaiting(false);
  }

  function clearEntry() {
    pushHistory();
    setDisplay('0');
    setWaiting(false);
  }

  function inputDigit(d: string) {
    if (waiting) {
      pushHistory();
      setDisplay(d);
      setWaiting(false);
    } else {
      pushHistory();
      setDisplay((prev) => (prev === '0' ? d : prev + d));
    }
  }

  function inputDot() {
    pushHistory();
    if (waiting) {
      setDisplay('0.');
      setWaiting(false);
      return;
    }
    setDisplay((prev) => (prev.includes('.') ? prev : prev + '.'));
  }

  function doBackspace() {
    pushHistory();
    setDisplay((prev) => {
      const next = prev.length > 1 ? prev.slice(0, -1) : '0';
      return next === '-' ? '0' : next;
    });
  }

  function compute(a: number, b: number, operator: string): number {
    switch (operator) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
      case '*':
        return a * b;
      case '÷':
      case '/':
        return b === 0 ? NaN : a / b;
      default:
        return b;
    }
  }

  function performOperation(nextOp: string) {
    const input = parseFloat(display) || 0;
    pushHistory();

    if (acc === null) {
      setAcc(input);
    } else if (op) {
      const res = compute(acc, input, op);
      setAcc(res);
      setDisplay(String(res));
    }
    setOp(nextOp);
    setWaiting(true);
  }

  function equals() {
    const input = parseFloat(display) || 0;
    pushHistory();
    if (acc === null) {
      setAcc(input);
    } else if (op) {
      const res = compute(acc, input, op);
      setAcc(res);
      setDisplay(String(res));
      setOp(null);
    }
    setWaiting(true);
  }

  function undo() {
    setHistory((h) => {
      const last = h[h.length - 1];
      if (!last) return h;
      restore(last);
      return h.slice(0, -1);
    });
  }

  function addGST() {
    const input = parseFloat(display) || 0;
    pushHistory();
    const r = 1 + (gstRate || 0);
    const res = input * r;
    setDisplay(String(round2(res)));
    setWaiting(true);
  }

  function removeGST() {
    const input = parseFloat(display) || 0;
    pushHistory();
    const r = 1 + (gstRate || 0);
    const res = r === 0 ? 0 : input / r;
    setDisplay(String(round2(res)));
    setWaiting(true);
  }

  function round2(n: number): number {
    return Math.round(n * 100) / 100;
  }

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const root = rootRef.current;
      const active = document.activeElement as HTMLElement | null;
      // Only handle keys if focus is inside the calculator (container or any child)
      if (!root || !active || !root.contains(active)) return;

      const k = e.key;
      if (/^[0-9]$/.test(k)) {
        e.preventDefault();
        inputDigit(k);
        return;
      }
      if (k === '.') {
        e.preventDefault();
        inputDot();
        return;
      }
      if (k === 'Backspace') {
        e.preventDefault();
        doBackspace();
        return;
      }
      if (k === 'Enter' || k === '=') {
        e.preventDefault();
        equals();
        return;
      }
      if (k === 'Escape') {
        e.preventDefault();
        clearAll();
        return;
      }
      if (k === '+') {
        e.preventDefault();
        performOperation('+');
        return;
      }
      if (k === '-') {
        e.preventDefault();
        performOperation('-');
        return;
      }
      if (k === '*') {
        e.preventDefault();
        performOperation('*');
        return;
      }
      if (k === '/') {
        e.preventDefault();
        performOperation('/');
        return;
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [display, acc, op, waiting, gstRate]);

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      className={`glass-panel rounded-3xl px-5 py-5 shadow-[0_30px_70px_-55px_rgba(2,12,18,0.88)] outline-none focus-visible:ring-2 focus-visible:ring-[rgba(142,118,233,0.35)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${className}`}
      aria-label="Standard calculator"
      role="group"
    >
      <div className="mb-4 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-right text-3xl font-semibold text-[#F2FBFF] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] tabular-nums tracking-wide backdrop-blur-sm sm:text-4xl">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-3">
        <button onClick={clearAll} className={buttonAccent}>
          AC
        </button>
        <button onClick={clearEntry} className={buttonGhost}>
          C
        </button>
        <button
          onClick={doBackspace}
          className={buttonGhost}
          aria-label="Backspace"
        >
          ⌫
        </button>
        <button onClick={undo} className={buttonGhost}>
          Undo
        </button>

        <button onClick={() => inputDigit('7')} className={buttonSoft}>
          7
        </button>
        <button onClick={() => inputDigit('8')} className={buttonSoft}>
          8
        </button>
        <button onClick={() => inputDigit('9')} className={buttonSoft}>
          9
        </button>
        <button onClick={() => performOperation('÷')} className={buttonSoft}>
          ÷
        </button>

        <button onClick={() => inputDigit('4')} className={buttonSoft}>
          4
        </button>
        <button onClick={() => inputDigit('5')} className={buttonSoft}>
          5
        </button>
        <button onClick={() => inputDigit('6')} className={buttonSoft}>
          6
        </button>
        <button onClick={() => performOperation('×')} className={buttonSoft}>
          ×
        </button>

        <button onClick={() => inputDigit('1')} className={buttonSoft}>
          1
        </button>
        <button onClick={() => inputDigit('2')} className={buttonSoft}>
          2
        </button>
        <button onClick={() => inputDigit('3')} className={buttonSoft}>
          3
        </button>
        <button onClick={() => performOperation('-')} className={buttonSoft}>
          −
        </button>

        <button onClick={() => inputDigit('0')} className={buttonSoft}>
          0
        </button>
        <button onClick={inputDot} className={buttonSoft}>
          .
        </button>
        <button onClick={equals} className={buttonSoft}>
          =
        </button>
        <button onClick={() => performOperation('+')} className={buttonSoft}>
          +
        </button>

        <button onClick={addGST} className={`col-span-2 ${buttonAccent}`}>
          +GST
        </button>
        <button onClick={removeGST} className={`col-span-2 ${buttonWarning}`}>
          −GST
        </button>
      </div>
    </div>
  );
}
