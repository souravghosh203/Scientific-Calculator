import { fmtG, MAX_HISTORY } from '../engine.js';

export default function HistoryPanel({ history, onClear, onPick }) {
  return (
    <div className="card history">
      <div className="card-head">
        <h2>History</h2>
        <div className="head-tools">
          <span className="muted mono">{history.length}/{MAX_HISTORY}</span>
          <button
            type="button"
            className="link"
            onClick={onClear}
            disabled={history.length === 0}
          >
            clear
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">⌗</div>
          <p>(no calculations yet)</p>
        </div>
      ) : (
        <ul className="hist-list">
          {[...history].reverse().map((h, i) => (
            <li key={h.id} className="hist-item" style={{ animationDelay: `${i * 30}ms` }}>
              <button type="button" onClick={() => onPick(h)} title="Reuse this result">
                <span className="hist-expr mono">{h.expr}</span>
                <span className="hist-eq">=</span>
                <span className="hist-res mono">{fmtG(h.result)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="card-foot muted">Oldest entries drop off after {MAX_HISTORY}. Click a row to reuse its result.</p>
    </div>
  );
}
