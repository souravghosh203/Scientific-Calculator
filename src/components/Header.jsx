import { fmtG } from '../engine.js';

export default function Header({ memory, historyCount }) {
  return (
    <header className="header">
      <div className="brand">
        <div className="brand-mark" aria-hidden="true">
          <span>∑</span>
        </div>
        <div>
          <h1 className="brand-title">
            <span className="spaced">SCIENTIFIC</span> <span className="grad">CALCULATOR</span>
          </h1>
          <p className="brand-sub">Menu-driven precision math · history &amp; memory built in</p>
        </div>
      </div>

      <div className="status">
        <div className="chip">
          <span className="chip-label">M</span>
          <span className="chip-value mono">{fmtG(memory)}</span>
        </div>
        <div className="chip">
          <span className="chip-label">HIST</span>
          <span className="chip-value mono">{historyCount}/8</span>
        </div>
      </div>
    </header>
  );
}
