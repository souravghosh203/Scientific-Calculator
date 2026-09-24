import { useEffect, useRef } from 'react';
import { fmtG } from '../engine.js';

export default function Workspace({
  op, values, fieldErrors, outcome,
  onChange, onCompute, onReset, onMemAdd, onMemSub, onChain,
}) {
  const firstRef = useRef(null);

  useEffect(() => {
    firstRef.current?.focus();
  }, [op.id]);

  const submit = (e) => {
    e.preventDefault();
    onCompute();
  };

  return (
    <div className="card workspace">
      <div className="card-head">
        <h2>
          <span className="ws-num mono">{String(op.id).padStart(2, '0')}</span>
          {op.name}
        </h2>
        <span className="badge">{op.group}</span>
      </div>

      <form className="ws-form" onSubmit={submit} noValidate>
        <div className={`fields fields-${op.inputs.length}`}>
          {op.inputs.map((input, i) => (
            <label key={input.key} className={`field ${fieldErrors[input.key] ? 'has-error' : ''}`}>
              <span className="field-label">{input.label}</span>
              <input
                ref={i === 0 ? firstRef : null}
                className="mono"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder={input.type === 'integer' ? '0' : '0.0'}
                value={values[input.key] ?? ''}
                onChange={(e) => onChange(input.key, e.target.value)}
              />
              <span className="field-hint">
                {fieldErrors[input.key]
                  ? <span className="err-text">⚠ {fieldErrors[input.key]}</span>
                  : (input.type === 'integer' ? 'integer' : 'real number')}
              </span>
            </label>
          ))}
        </div>

        <div className="ws-actions">
          <button type="submit" className="btn btn-primary">
            Calculate <kbd>↵</kbd>
          </button>
          <button type="button" className="btn btn-ghost" onClick={onReset}>
            Clear
          </button>
        </div>
      </form>

      <div className="result-zone">
        {!outcome && (
          <div className="result placeholder">
            <span className="result-eyebrow">Result</span>
            <span className="result-value mono dim">—</span>
            <span className="result-foot muted">Enter values above and press Calculate.</span>
          </div>
        )}

        {outcome && outcome.error && (
          <div className="result error" key={`e-${outcome.error}`}>
            <span className="result-eyebrow">⚠ Error</span>
            <span className="result-msg">{outcome.error}</span>
          </div>
        )}

        {outcome && !outcome.error && (
          <div className="result success" key={outcome.expr + outcome.result}>
            <span className="result-eyebrow">Result</span>
            <span className="result-expr mono">{outcome.expr} =</span>
            <span className="result-value mono">{fmtG(outcome.result)}</span>
            <span className="result-exact mono muted">exact: {String(outcome.result)}</span>

            <div className="result-actions">
              <button type="button" className="mini" onClick={onMemAdd}>M+</button>
              <button type="button" className="mini" onClick={onMemSub}>M−</button>
              {op.inputs.map((input) => (
                <button
                  key={input.key}
                  type="button"
                  className="mini"
                  onClick={() => onChain(input.key)}
                  title={`Use result as "${input.label}"`}
                >
                  → {input.key.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
