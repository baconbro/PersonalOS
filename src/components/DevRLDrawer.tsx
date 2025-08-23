import React, { useEffect, useMemo, useState } from 'react';
import { rlEngine, type RLEventLog } from '../services/rlEngine';
import './ActivityLogDrawer.css';

interface DevRLDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DevRLDrawer: React.FC<DevRLDrawerProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<RLEventLog[]>([]);
  const [live, setLive] = useState(true);

  const aggregates = useMemo(() => {
    if (!logs.length) return null;
    const n = logs.length;
    const avg = (arr: number[]) => arr.reduce((a,b)=>a+b,0) / (arr.length || 1);
    const rewards = logs.map(l => l.reward || 0);
    const eps = logs.map(l => l.epsilonAfter ?? l.epsilon ?? 0);
    const exploreRate = logs.filter(l => l.explore).length / n;
    const byAction: Record<string, number> = {};
    logs.forEach(l => { byAction[l.action] = (byAction[l.action]||0) + 1; });
    return {
      steps: n,
      avgReward: avg(rewards),
      epsilon: eps[0] ?? 0,
      exploreRate,
      byAction,
    };
  }, [logs]);

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
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="activity-drawer-overlay">
      <div className="activity-drawer">
        <div className="activity-drawer-header">
          <h3>RL Debug Log (dev)</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        <div className="activity-list">
          <div style={{display:'flex', gap:8, padding:'8px 12px'}}>
            <button className="close-button" onClick={() => setLive(!live)}>{live ? 'Pause' : 'Resume'}</button>
            <button className="close-button" onClick={() => { rlEngine.clearLogs(); setLogs([]); }}>Clear</button>
          </div>
          {aggregates && (
            <div className="activity-item" style={{borderLeft:'4px solid #6366f1'}}>
              <div className="activity-content">
                <div className="activity-title">Summary • steps {aggregates.steps} • avg r={aggregates.avgReward.toFixed(3)} • ε={aggregates.epsilon.toFixed(3)} • explore={(aggregates.exploreRate*100).toFixed(0)}%</div>
                <div className="activity-description" style={{whiteSpace:'pre-wrap'}}>
                  {Object.entries(aggregates.byAction).map(([a,c])=>`${a}: ${c}`).join('  |  ')}
                </div>
              </div>
            </div>
          )}
          {logs.length === 0 && (
            <div className="activity-item">
              <div className="activity-content">
                <div className="activity-title">No RL events yet</div>
                <div className="activity-description">Interact with the app or wait for background steps.</div>
              </div>
            </div>
          )}
          {logs.map(log => (
            <div key={log.id} className="activity-item">
              <div className="activity-content">
                <div className="activity-title">#{log.stepIndex ?? '—'} {log.action} • r={(log.reward ?? 0).toFixed(3)} • {log.explore ? 'explore' : 'exploit'} • ε{log.epsilonBefore!==undefined?`=${(log.epsilonBefore).toFixed(3)}→`:''}{(log.epsilonAfter ?? log.epsilon).toFixed(3)}</div>
                <div className="activity-description" style={{whiteSpace:'pre-wrap'}}>
                  state={log.stateKey}
                  {'\n'}qBefore={log.qBefore?.toFixed(3) ?? '—'} qAfter={log.qAfter?.toFixed(3) ?? '—'} nextMax={log.nextMax?.toFixed(3) ?? '—'}
                  {log.qTop && log.qTop.length ? `\nqTop: ` + log.qTop.map(q => `${q.action}:${q.q.toFixed(2)}`).join(', ') : ''}
                  {log.rewardComponents ? `\nreward= w1*ΔKR(${log.rewardComponents.dKR.toFixed(3)}) + w2*ΔTasks(${log.rewardComponents.tasks.toFixed(3)}) + w3*Wellbeing(${log.rewardComponents.wellbeing.toFixed(3)}) - w4*Burnout(${log.rewardComponents.burnout.toFixed(3)})` : ''}
                </div>
                <div className="activity-meta">{new Date(log.timestamp).toLocaleString()} {log.dtMs ? `• Δt=${log.dtMs}ms` : ''}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DevRLDrawer;
