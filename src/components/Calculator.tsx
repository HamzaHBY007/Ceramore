"use client";

import { useState } from "react";

interface Props {
  onClose: () => void;
}

export default function Calculator({ onClose }: Props) {
  const [display, setDisplay] = useState("0");
  const [prev, setPrev] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [resetNext, setResetNext] = useState(false);

  const handleNumber = (n: string) => {
    if (resetNext) {
      setDisplay(n);
      setResetNext(false);
    } else {
      setDisplay(display === "0" ? n : display + n);
    }
  };

  const handleDecimal = () => {
    if (resetNext) {
      setDisplay("0.");
      setResetNext(false);
    } else if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const calculate = (a: number, b: number, operator: string): number => {
    switch (operator) {
      case "+": return a + b;
      case "-": return a - b;
      case "×": return a * b;
      case "÷": return b === 0 ? 0 : a / b;
      default: return b;
    }
  };

  const handleOp = (nextOp: string) => {
    const current = parseFloat(display);
    if (prev !== null && op && !resetNext) {
      const result = calculate(prev, current, op);
      setDisplay(String(Math.round(result * 100000000) / 100000000));
      setPrev(result);
    } else {
      setPrev(current);
    }
    setOp(nextOp);
    setResetNext(true);
  };

  const handleEquals = () => {
    if (prev === null || !op) return;
    const current = parseFloat(display);
    const result = calculate(prev, current, op);
    setDisplay(String(Math.round(result * 100000000) / 100000000));
    setPrev(null);
    setOp(null);
    setResetNext(true);
  };

  const handleClear = () => {
    setDisplay("0");
    setPrev(null);
    setOp(null);
    setResetNext(false);
  };

  const handlePercent = () => {
    setDisplay(String(parseFloat(display) / 100));
  };

  const handleSign = () => {
    setDisplay(String(parseFloat(display) * -1));
  };

  const btnBase = "flex items-center justify-center rounded-xl text-lg font-medium transition-all active:scale-95 h-12";
  const btnNum = `${btnBase} bg-slate-700/60 hover:bg-slate-600/60 text-white`;
  const btnOp = `${btnBase} bg-ceramore-gold/20 hover:bg-ceramore-gold/30 text-ceramore-gold`;
  const btnFunc = `${btnBase} bg-slate-600/40 hover:bg-slate-500/40 text-slate-300`;

  return (
    <div className="fixed top-16 right-6 z-50 slide-in">
      <div className="glass-card w-72 p-4 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-400">Calculatrice</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-slate-800/80 rounded-xl px-4 py-3 mb-3 text-right">
          {op && prev !== null && (
            <p className="text-xs text-slate-500 mb-0.5">{prev} {op}</p>
          )}
          <p className="text-2xl font-bold text-white truncate">{display}</p>
        </div>

        <div className="grid grid-cols-4 gap-2">
          <button onClick={handleClear} className={btnFunc}>C</button>
          <button onClick={handleSign} className={btnFunc}>±</button>
          <button onClick={handlePercent} className={btnFunc}>%</button>
          <button onClick={() => handleOp("÷")} className={btnOp}>÷</button>

          <button onClick={() => handleNumber("7")} className={btnNum}>7</button>
          <button onClick={() => handleNumber("8")} className={btnNum}>8</button>
          <button onClick={() => handleNumber("9")} className={btnNum}>9</button>
          <button onClick={() => handleOp("×")} className={btnOp}>×</button>

          <button onClick={() => handleNumber("4")} className={btnNum}>4</button>
          <button onClick={() => handleNumber("5")} className={btnNum}>5</button>
          <button onClick={() => handleNumber("6")} className={btnNum}>6</button>
          <button onClick={() => handleOp("-")} className={btnOp}>−</button>

          <button onClick={() => handleNumber("1")} className={btnNum}>1</button>
          <button onClick={() => handleNumber("2")} className={btnNum}>2</button>
          <button onClick={() => handleNumber("3")} className={btnNum}>3</button>
          <button onClick={() => handleOp("+")} className={btnOp}>+</button>

          <button onClick={() => handleNumber("0")} className={`${btnNum} col-span-2`}>0</button>
          <button onClick={handleDecimal} className={btnNum}>.</button>
          <button onClick={handleEquals} className={`${btnBase} bg-ceramore-gold hover:bg-ceramore-gold/80 text-white`}>=</button>
        </div>
      </div>
    </div>
  );
}
