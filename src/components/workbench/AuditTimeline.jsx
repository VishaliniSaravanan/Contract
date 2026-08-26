import React from 'react';
import { Clock } from 'lucide-react';
import { formatDate } from '../../utils/contractUtils';

const TYPE_COLORS = {
  SYSTEM:       { bg: '#F5F6F7', color: '#8FA0B0', dot: '#8FA0B0' },
  EXCEPTION:    { bg: '#FFEBEE', color: '#BB0000', dot: '#BB0000' },
  ACTION:       { bg: '#E8F4FD', color: '#0070F2', dot: '#0070F2' },
  NOTIFICATION: { bg: '#FFF3E0', color: '#E9730C', dot: '#E78C07' },
};

const TYPE_LABELS = {
  SYSTEM:       'System',
  EXCEPTION:    'Exception',
  ACTION:       'Action',
  NOTIFICATION: 'Notification',
};

export default function AuditTimeline({ contract }) {
  if (!contract) return null;

  const entries = [...(contract.auditTrail || [])].reverse();

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-header-left">
          <Clock size={14} color="var(--t-secondary)" />
          <span className="card-title">Audit Timeline</span>
        </div>
        <span style={{
          fontSize: '11px', color: 'var(--t-secondary)',
          background: 'var(--c-bg)',
          padding: '2px 8px', borderRadius: '10px',
          border: '1px solid var(--bd-default)',
        }}>
          {entries.length} events
        </span>
      </div>

      <div className="card-body">
        {entries.length === 0 ? (
          <div style={{ color: 'var(--t-tertiary)', fontSize: '13px', textAlign: 'center', padding: '16px' }}>
            No audit entries yet
          </div>
        ) : (
          <div className="timeline">
            {entries.map((entry, i) => {
              const style = TYPE_COLORS[entry.type] || TYPE_COLORS.SYSTEM;
              return (
                <div key={entry.id || i} className="timeline-item">
                  <div
                    className={`timeline-dot ${entry.type}`}
                    style={{ background: style.dot, borderColor: 'var(--c-surface)' }}
                  />
                  <div className="timeline-header">
                    <span className="timeline-action">{entry.action}</span>
                    <span style={{
                      fontSize: '10px',
                      background: style.bg,
                      color: style.color,
                      padding: '1px 6px',
                      borderRadius: '4px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}>
                      {TYPE_LABELS[entry.type] || entry.type}
                    </span>
                    <span className="timeline-date">{formatDate(entry.date)}</span>
                  </div>
                  <div className="timeline-user">
                    By {entry.userRole} — {entry.user}
                  </div>
                  {entry.note && (
                    <div className="timeline-note">{entry.note}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
