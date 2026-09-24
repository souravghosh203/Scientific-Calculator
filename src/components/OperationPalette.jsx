import { OPERATIONS, GROUPS } from '../engine.js';

const GROUP_CLASS = {
  Basic: 'g-basic',
  'Powers & Roots': 'g-roots',
  Trigonometry: 'g-trig',
  Logarithms: 'g-log',
  Special: 'g-special',
};

export default function OperationPalette({ activeId, onSelect }) {
  return (
    <div className="card palette">
      <div className="card-head">
        <h2>Operations</h2>
        <span className="muted">Choose a function</span>
      </div>

      {GROUPS.map((group) => (
        <div key={group} className={`op-group ${GROUP_CLASS[group]}`}>
          <div className="op-group-label">{group}</div>
          <div className="op-grid">
            {OPERATIONS.filter((o) => o.group === group).map((o) => (
              <button
                key={o.id}
                type="button"
                className={`op-btn ${o.id === activeId ? 'active' : ''}`}
                onClick={() => onSelect(o.id)}
                title={o.name}
              >
                <span className="op-num">{String(o.id).padStart(2, '0')}</span>
                <span className="op-sym">{o.symbol}</span>
                <span className="op-name">{o.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
