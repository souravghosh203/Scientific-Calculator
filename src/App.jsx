import { useState, useCallback, useEffect } from 'react';
import { OPERATIONS, MAX_HISTORY, parseInput } from './engine.js';
import Header from './components/Header.jsx';
import OperationPalette from './components/OperationPalette.jsx';
import Workspace from './components/Workspace.jsx';
import HistoryPanel from './components/HistoryPanel.jsx';
import MemoryPanel from './components/MemoryPanel.jsx';

export default function App() {
  const [opId, setOpId] = useState(1);
  const [values, setValues] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [outcome, setOutcome] = useState(null); // { expr, result } | { error }
  const [history, setHistory] = useState([]);
  const [memory, setMemory] = useState(0);
  const [toast, setToast] = useState(null);

  const op = OPERATIONS.find((o) => o.id === opId);

  const selectOp = useCallback((id) => {
    setOpId(id);
    setValues({});
    setFieldErrors({});
    setOutcome(null);
  }, []);

  const showToast = useCallback((msg, kind = 'ok') => {
    setToast({ msg, kind, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  // add_history(): keep at most MAX_HISTORY, dropping the oldest
  const addHistory = useCallback((expr, result) => {
    setHistory((h) => {
      const next = [...h, { expr, result, id: Date.now() + Math.random() }];
      return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
    });
  }, []);

  const compute = useCallback(() => {
    const parsed = {};
    const errs = {};
    for (const input of op.inputs) {
      const r = parseInput(values[input.key] ?? '', input.type);
      if (r.error) errs[input.key] = r.error;
      else parsed[input.key] = r.value;
    }
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      setOutcome(null);
      return;
    }
    setFieldErrors({});
    const out = op.run(parsed);
    setOutcome({ ...out, opName: op.name });
    if (!out.error) addHistory(out.expr, out.result);
  }, [op, values, addHistory]);

  const useResultAs = useCallback((key, v) => {
    setValues((s) => ({ ...s, [key]: String(v) }));
    setFieldErrors((e) => ({ ...e, [key]: undefined }));
  }, []);

  // ---- memory_menu() equivalents ----
  const memAdd = (v) => { setMemory((m) => m + v); showToast(`M+ ${v} applied`); };
  const memSub = (v) => { setMemory((m) => m - v); showToast(`M− ${v} applied`); };
  const memClear = () => { setMemory(0); showToast('Memory cleared.'); };
  const memRecall = () => {
    const firstKey = op.inputs[0].key;
    useResultAs(firstKey, memory);
    showToast(`MR → ${op.inputs[0].label}`);
  };

  const clearHistory = () => { setHistory([]); showToast('History cleared.'); };

  return (
    <div className="app">
      <div className="bg-orb orb-a" />
      <div className="bg-orb orb-b" />
      <div className="bg-orb orb-c" />

      <Header memory={memory} historyCount={history.length} />

      <main className="layout">
        <section className="col col-main">
          <OperationPalette activeId={opId} onSelect={selectOp} />
          <Workspace
            op={op}
            values={values}
            fieldErrors={fieldErrors}
            outcome={outcome}
            onChange={(key, v) => {
              setValues((s) => ({ ...s, [key]: v }));
              if (fieldErrors[key]) setFieldErrors((e) => ({ ...e, [key]: undefined }));
            }}
            onCompute={compute}
            onReset={() => selectOp(opId)}
            onMemAdd={outcome && !outcome.error ? () => memAdd(outcome.result) : null}
            onMemSub={outcome && !outcome.error ? () => memSub(outcome.result) : null}
            onChain={outcome && !outcome.error ? (key) => useResultAs(key, outcome.result) : null}
          />
        </section>

        <aside className="col col-side">
          <MemoryPanel
            memory={memory}
            onAdd={memAdd}
            onSub={memSub}
            onRecall={memRecall}
            onClear={memClear}
          />
          <HistoryPanel
            history={history}
            onClear={clearHistory}
            onPick={(entry) => useResultAs(op.inputs[0].key, entry.result)}
          />
        </aside>
      </main>

      <footer className="footer">
        <span>Ported from <code>scientific_calculator.c</code></span>
        <span className="dot" />
        <span>17 operations · {MAX_HISTORY}-entry history · M+ M− MR MC</span>
      </footer>

      {toast && (
        <div key={toast.id} className={`toast toast-${toast.kind}`} role="status">
          {toast.msg}
        </div>
      )}
    </div>
  );
}
