import React from 'react';
import { Zap, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  ACTION_LABELS,
  getUrgencyFromAction,
} from '../../utils/contractUtils';

export default function AIDecisionPanel({ contract }) {
  if (!contract) return null;

  const urgency = getUrgencyFromAction(contract.aiAction);
  const actionLabel = ACTION_LABELS[contract.aiAction] || contract.aiAction;
  const isNoException = contract.exceptions.length === 0;

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <Zap size={14} color="#64B5F6" fill="#64B5F6" />
        <span className="ai-panel-title">AI Decision Support</span>
        <span className="ai-badge">Insight Engine</span>
      </div>

      <div className="ai-panel-body">

        {/* Recommendation Row */}
        <div className="ai-recommendation">
          <div className="ai-rec-action-block">
            <div className="ai-action-label">Recommended Action</div>
            <div className="ai-action-value">{actionLabel}</div>
            <span
              className="ai-urgency-chip"
              style={{ background: urgency.bg, color: urgency.color }}
            >
              <span style={{
                width: 6, height: 6,
                borderRadius: '50%',
                background: urgency.color,
                display: 'inline-block',
                flexShrink: 0,
              }} />
              {urgency.label}
            </span>
          </div>
          <div className="ai-confidence">
            <div className="ai-confidence-value">{contract.aiConfidence}%</div>
            <div className="ai-confidence-label">Confidence</div>
          </div>
        </div>

        <div className="ai-divider" />

        {/* Rationale */}
        <div>
          <div className="ai-impact-header">Analysis</div>
          <p className="ai-rationale">{contract.aiRationale}</p>
        </div>

        {/* Impact */}
        {!isNoException && (
          <>
            <div className="ai-divider" />
            <div>
              <div className="ai-impact-header">
                <AlertTriangle size={11} style={{ display: 'inline', marginRight: 4 }} />
                If No Action Taken
              </div>
              <p className="ai-impact-text">{contract.aiImpact}</p>
            </div>
          </>
        )}

        {/* Next Steps */}
        {contract.aiSteps && contract.aiSteps.length > 0 && (
          <>
            <div className="ai-divider" />
            <div>
              <div className="ai-impact-header">Recommended Steps</div>
              <div className="ai-steps">
                {contract.aiSteps.map((step, i) => (
                  <div key={i} className="ai-step">
                    <div className="ai-step-num">{i + 1}</div>
                    <div className="ai-step-text">{step}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {isNoException && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(16,126,62,0.15)', borderRadius: '6px',
            padding: '8px 12px',
          }}>
            <CheckCircle size={14} color="#81C784" />
            <span style={{ fontSize: '12px', color: '#81C784' }}>
              No exceptions detected. Contract is healthy.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
