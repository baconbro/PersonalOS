import React, { useEffect, useMemo, useState } from 'react';
import { rlEngine, type RLEventLog } from '../services/rlEngine';
import { X } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import './DevRLModal.css';

interface DevRLModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DevRLModal: React.FC<DevRLModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<RLEventLog[]>([]);
  const [live, setLive] = useState(true);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterExplore, setFilterExplore] = useState<string>('all');
  const [filterStateKey, setFilterStateKey] = useState<string>('');
  const [verbose, setVerbose] = useState<boolean>(false);

  const aggregates = useMemo(() => {
    const makeAgg = (slice: RLEventLog[]) => {
      const n = slice.length;
      if (!n) return null;
      const avg = (arr: number[]) => arr.reduce((a,b)=>a+b,0) / (arr.length || 1);
      const variance = (arr: number[]) => { const m = avg(arr); return avg(arr.map(x => (x - m) ** 2)); };
      const rewards = slice.map(l => l.reward || 0);
      const eps = slice.map(l => l.epsilonAfter ?? l.epsilon ?? 0);
      const exploreRate = slice.filter(l => l.explore).length / n;
      const byAction: Record<string, { total: number; explore: number }> = {};
      slice.forEach(l => {
        if (!byAction[l.action]) byAction[l.action] = { total: 0, explore: 0 };
        byAction[l.action].total += 1;
        if (l.explore) byAction[l.action].explore += 1;
      });
      const dKR = slice.map(l => l.rewardComponents?.dKR ?? 0);
      const dTasks = slice.map(l => l.rewardComponents?.tasks ?? 0);
      const wellbeing = slice.map(l => l.rewardComponents?.wellbeing ?? 0);
      const burnout = slice.map(l => l.rewardComponents?.burnout ?? 0);
      const stateCounts: Record<string, number> = {};
      slice.forEach(l => { stateCounts[l.stateKey] = (stateCounts[l.stateKey]||0)+1; });
      const topStates = Object.entries(stateCounts).sort((a,b)=>b[1]-a[1]).slice(0,10);
      return {
        steps: n,
        avgReward: avg(rewards),
        varReward: variance(rewards),
        epsilon: eps[0] ?? 0,
        exploreRate,
        byAction,
        avg_dKR: avg(dKR),
        avg_dTasks: avg(dTasks),
        avg_wellbeing: avg(wellbeing),
        avg_burnout: avg(burnout),
        topStates,
      };
    };
    const filtered = logs.filter(l =>
      (filterAction==='all' || l.action===filterAction) &&
      (filterExplore==='all' || (filterExplore==='explore'? !!l.explore : !l.explore)) &&
      (filterStateKey==='' || l.stateKey.includes(filterStateKey))
    );
    return {
      w10: makeAgg(filtered.slice(0,10)),
      w50: makeAgg(filtered.slice(0,50)),
      w200: makeAgg(filtered.slice(0,200)),
    };
  }, [logs, filterAction, filterExplore, filterStateKey]);

  // Chart data for reward and epsilon trends (oldest → newest after reversing)
  const filteredLogs = useMemo(() => logs.filter(l =>
    (filterAction==='all' || l.action===filterAction) &&
    (filterExplore==='all' || (filterExplore==='explore'? !!l.explore : !l.explore)) &&
    (filterStateKey==='' || l.stateKey.includes(filterStateKey))
  ), [logs, filterAction, filterExplore, filterStateKey]);

  const chartData = useMemo(() => {
    const arr = [...filteredLogs].reverse();
    return arr.map((l, idx) => ({
      idx: l.stepIndex ?? idx + 1,
      reward: typeof l.reward === 'number' ? l.reward : 0,
      epsilon: (l.epsilonAfter ?? l.epsilon ?? 0),
    }));
  }, [filteredLogs]);

  const qSummary = useMemo(() => rlEngine.getQSummary(5), [logs]);

  useEffect(() => {
    if (!isOpen) return;
    // seed with recent buffer
    setLogs(rlEngine.getRecentLogs());
    const unsub = rlEngine.subscribe((log) => {
      if (!live) return;
      setLogs(prev => [log, ...prev].slice(0, 300));
    });
    const id = setInterval(() => {
      if (!live) return;
      setLogs(rlEngine.getRecentLogs());
    }, 1500);
    return () => { unsub(); clearInterval(id); };
  }, [isOpen, live]);

  if (!isOpen) return null;

  return (
    <div className="rl-modal-overlay" onClick={onClose}>
      <div className="rl-modal" onClick={e => e.stopPropagation()}>
        <div className="rl-modal-header">
          <h3>RL Debug (dev)</h3>
          <div className="rl-modal-actions">
            <button className="rl-chip" onClick={() => setLive(!live)}>{live ? 'Pause' : 'Resume'}</button>
            <button className="rl-chip" onClick={() => { rlEngine.clearLogs(); setLogs([]); }}>Clear</button>
            <button className="rl-chip" onClick={() => { rlEngine.resetQTable(); }}>Reset Q</button>
            <button className="rl-chip" onClick={() => { const data = rlEngine.exportData(); const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `rl-data-${new Date().toISOString()}.json`; a.click(); URL.revokeObjectURL(url); }}>Export JSON</button>
            <label className="rl-chip" style={{display:'inline-flex', alignItems:'center', gap:6}}>
              <input type="checkbox" checked={verbose} onChange={(e)=>{ setVerbose(e.target.checked); rlEngine.setVerbose(e.target.checked); }} /> verbose
            </label>
            <button className="rl-close" onClick={onClose} aria-label="Close"><X size={18} /></button>
          </div>
        </div>

        <div className="rl-modal-body">
          {!logs.length && (
            <div className="rl-empty">
              <div>No RL events yet</div>
              <div className="rl-subtle">Enable the RL engine in Settings → Experiments and wait for background steps.</div>
            </div>
          )}

          {/* Filters */}
          <div className="rl-filters">
            <select value={filterAction} onChange={e=>setFilterAction(e.target.value)}>
              <option value="all">All actions</option>
              <option value="SUGGEST_TASK">SUGGEST_TASK</option>
              <option value="PRIORITIZE_PILLAR">PRIORITIZE_PILLAR</option>
              <option value="SUGGEST_TIME_BLOCK">SUGGEST_TIME_BLOCK</option>
              <option value="SUGGEST_REST">SUGGEST_REST</option>
              <option value="SUGGEST_LOW_EFFORT">SUGGEST_LOW_EFFORT</option>
              <option value="SUGGEST_SOCIAL">SUGGEST_SOCIAL</option>
              <option value="PROMPT_REFLECTION">PROMPT_REFLECTION</option>
              <option value="INITIATE_WEEKLY_REVIEW">INITIATE_WEEKLY_REVIEW</option>
            </select>
            <select value={filterExplore} onChange={e=>setFilterExplore(e.target.value)}>
              <option value="all">All modes</option>
              <option value="explore">Explore</option>
              <option value="exploit">Exploit</option>
            </select>
            <input value={filterStateKey} onChange={e=>setFilterStateKey(e.target.value)} placeholder="Filter by stateKey" />
          </div>

          {/* Aggregates windows */}
          {aggregates?.w10 && (
            <div className="rl-summary">
              <div className="rl-title">Aggregates (last 10)</div>
              <div className="rl-subtle">avg r={aggregates.w10.avgReward.toFixed(3)} • var r={aggregates.w10.varReward.toFixed(3)} • ε={aggregates.w10.epsilon.toFixed(3)} • explore={(aggregates.w10.exploreRate*100).toFixed(0)}%</div>
              <div className="rl-subtle">ΔKR={aggregates.w10.avg_dKR.toFixed(3)} • ΔTasks={aggregates.w10.avg_dTasks.toFixed(3)} • Wellbeing={aggregates.w10.avg_wellbeing.toFixed(3)} • Burnout={aggregates.w10.avg_burnout.toFixed(3)}</div>
              <div className="rl-actions-row">
                {Object.entries(aggregates.w10.byAction).map(([a,c]) => (
                  <span key={a} className="rl-chip">{a}: {c.total} ({Math.round((c.explore/c.total)*100)}% explore)</span>
                ))}
              </div>
            </div>
          )}
          {aggregates?.w50 && (
            <div className="rl-summary">
              <div className="rl-title">Aggregates (last 50)</div>
              <div className="rl-subtle">avg r={aggregates.w50.avgReward.toFixed(3)} • var r={aggregates.w50.varReward.toFixed(3)} • ε={aggregates.w50.epsilon.toFixed(3)} • explore={(aggregates.w50.exploreRate*100).toFixed(0)}%</div>
            </div>
          )}
          {aggregates?.w200 && (
            <div className="rl-summary">
              <div className="rl-title">Aggregates (last 200)</div>
              <div className="rl-subtle">avg r={aggregates.w200.avgReward.toFixed(3)} • var r={aggregates.w200.varReward.toFixed(3)} • ε={aggregates.w200.epsilon.toFixed(3)} • explore={(aggregates.w200.exploreRate*100).toFixed(0)}%</div>
            </div>
          )}

          {/* Trends */}
          {chartData.length > 1 && (
            <div className="rl-charts">
              <div className="rl-chart-card">
                <div className="rl-title">Reward trend</div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: -6 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="idx" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="reward" stroke="#10b981" dot={false} strokeWidth={2} name="reward" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="rl-chart-card">
                <div className="rl-title">Epsilon trend</div>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: -6 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="idx" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 1]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="epsilon" stroke="#6366f1" dot={false} strokeWidth={2} name="epsilon" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Q summary */}
          {qSummary && (
            <div className="rl-summary">
              <div className="rl-title">Q summary</div>
              <div className="rl-subtle">states {qSummary.uniqueStates} • entries {qSummary.totalEntries} • mean {qSummary.stats.mean.toFixed(2)} • p50 {qSummary.stats.p50.toFixed(2)} • p90 {qSummary.stats.p90.toFixed(2)} • max {qSummary.stats.max.toFixed(2)}</div>
              {qSummary.top.length ? (
                <div className="rl-actions-row">
                  {qSummary.top.map((t, i) => (
                    <span key={`${t.stateKey}-${t.action}-${i}`} className="rl-chip">{t.action} @{t.stateKey} = {t.q.toFixed(2)}</span>
                  ))}
                </div>
              ) : null}
            </div>
          )}

          {filteredLogs.map(log => (
            <div key={log.id} className="rl-card">
              <div className="rl-card-title">
                <strong>#{log.stepIndex ?? '—'} {log.action}</strong>
                <span className="rl-subtle">r={(log.reward ?? 0).toFixed(3)} • {log.explore ? 'explore' : 'exploit'} • ε{log.epsilonBefore!==undefined?`=${(log.epsilonBefore).toFixed(3)}→`:''}{(log.epsilonAfter ?? log.epsilon).toFixed(3)}</span>
              </div>
              <div className="rl-card-body">
                <pre className="rl-pre">
state={log.stateKey}
qBefore={log.qBefore?.toFixed(3) ?? '—'} qAfter={log.qAfter?.toFixed(3) ?? '—'} nextMax={log.nextMax?.toFixed(3) ?? '—'}
{log.qTop && log.qTop.length ? `qTop: ` + log.qTop.map(q => `${q.action}:${q.q.toFixed(2)}`).join(', ') : ''}
{log.rewardComponents ? `reward= w1*ΔKR(${log.rewardComponents.dKR.toFixed(3)}) + w2*ΔTasks(${log.rewardComponents.tasks.toFixed(3)}) + w3*Wellbeing(${log.rewardComponents.wellbeing.toFixed(3)}) - w4*Burnout(${log.rewardComponents.burnout.toFixed(3)})` : ''}
{log.featuresDetail && log.featuresDetail.length ? `\nfeatures:\n` + log.featuresDetail.map(f => ` - ${f.label}: raw=${f.raw.toFixed(3)} norm=${f.norm.toFixed(3)}`).join('\n') : ''}
                </pre>
                <div className="rl-subtle">{new Date(log.timestamp).toLocaleString()} {log.dtMs ? `• Δt=${log.dtMs}ms` : ''} • α={log.alpha?.toFixed(2)} γ={log.gamma?.toFixed(2)} {log.saved===false? '• save:failed':''}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default DevRLModal;
