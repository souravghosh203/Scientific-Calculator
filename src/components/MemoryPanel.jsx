import { useState } from 'react';
import { fmtG, parseInput } from '../engine.js';

export default function MemoryPanel({ memory, onAdd, onSub, onRecall, onClear }) {
  const [raw, setRaw] = useState('');
  const [err, setErr] = useState('');

  const apply = (fn) => {
    const r = parseInput(raw);
    if (r.error) { setErr(r.error); return; }
    setErr('');
    fn(r.value);
    setRaw('');
  };

  return (
    <div className="card memory">
      <div className="card-head">
        <h2>Memory</h2>
        <span className={`mem-dot ${memory !== 0 ? 'on' : ''}`} />
      </div>

      <div className="mem-display">
        <span className="mem-label">M =</span>
        <span className="mem-value mono">{fmtG(memory)}</span>
      </div>

      <div className={`mem-input ${err ? 'has-error' : ''}`}>
        <input
          className="mono"
          type="text"
          inputMode="decimal"
          placeholder="value"
          value={raw}
          onChange={(e) => { setRaw(e.target.value); setErr(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') apply(onAdd); }}
        />
        <button type="button" className="mem-btn plus" onClick={() => apply(onAdd)} title="Add to memory">M+</button>
        <button type="button" className="mem-btn minus" onClick={() => apply(onSub)} title="Subtract from memory">M−</button>
      </div>
      {err && <div className="err-text small">⚠ {err}</div>}

      <div className="mem-row">
        <button type="button" className="btn btn-soft" onClick={onRecall}>
          MR <span className="muted">recall → input</span>
        </button>
        <button type="button" className="btn btn-danger" onClick={onClear}>
          MC <span>clear</span>
        </button>
      </div>
    </div>
  );
}
