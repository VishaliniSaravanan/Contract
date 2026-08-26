import React, { useState } from 'react';
import {
  Eye, UserPlus, ArrowUpCircle, RefreshCw, CheckCircle,
} from 'lucide-react';
import { useContracts } from '../../context/ContractContext';
import { useAuth } from '../../context/AuthContext';
import { getPersonaActions, ACTION_LABELS } from '../../utils/contractUtils';
import Modal from '../shared/Modal';

const ACTION_META = {
  MONITOR:  { icon: Eye,            color: '#107E3E',  label: 'Monitor',       sub: 'Track & flag' },
  ASSIGN:   { icon: UserPlus,       color: '#0070F2',  label: 'Assign Owner',  sub: 'Set responsibility' },
  ESCALATE: { icon: ArrowUpCircle,  color: '#BB0000',  label: 'Escalate',      sub: 'Senior attention' },
  RENEW:    { icon: RefreshCw,      color: '#E78C07',  label: 'Start Renewal', sub: 'Initiate process' },
  RESOLVE:  { icon: CheckCircle,    color: '#107E3E',  label: 'Resolve',       sub: 'Close exception' },
};

// Derive which action the AI recommends so we can highlight it
const AI_ACTION_TO_BTN = {
  RENEW_IMMEDIATELY: 'RENEW',
  ESCALATE_URGENT:   'ESCALATE',
  APPROVE_AND_RENEW: 'RENEW',
  APPROVE_NOW:       'RESOLVE',
  LEGAL_REVIEW:      'ESCALATE',
  REVIEW_AMEND:      'ASSIGN',
  MONITOR_RENEW:     'RENEW',
  INITIATE_RENEWAL:  'RENEW',
  MONITOR:           'MONITOR',
  RESOLVE:           'RESOLVE',
};

export default function ActionPanel({ contract }) {
  const { user } = useAuth();
  const { performAction, setActionModal, actionModal } = useContracts();

  const [modalState, setModalState] = useState(null);
  const [assignee, setAssignee] = useState('');
  const [escalateTo, setEscalateTo] = useState('');
  const [reason, setReason] = useState('');
  const [resolution, setResolution] = useState('');
  const [note, setNote] = useState('');

  if (!contract) return null;

  const allowedActions = getPersonaActions(user);
  const recommendedBtn = AI_ACTION_TO_BTN[contract.aiAction];
  const isResolved = contract.status === 'RESOLVED';

  const handleAction = (actionKey) => {
    if (actionKey === 'MONITOR') {
      performAction('MONITOR', contract, user, {});
      return;
    }
    setModalState(actionKey);
    setAssignee('');
    setEscalateTo('');
    setReason('');
    setResolution('');
    setNote('');
  };

  const handleSubmit = () => {
    performAction(modalState, contract, user, {
      assignee,
      assigneeEmail: `${assignee.toLowerCase().replace(/\s+/g, '.')}@rivergatewater.co.uk`,
      escalateTo,
      reason,
      resolution,
      note,
    });
    setModalState(null);
  };

  const modalTitle = {
    ASSIGN:   'Assign Contract Owner',
    ESCALATE: 'Escalate Contract Exception',
    RENEW:    'Initiate Renewal Action',
    RESOLVE:  'Resolve Exception',
  };

  const canSubmit = {
    ASSIGN:   assignee.trim().length > 0,
    ESCALATE: escalateTo.trim().length > 0,
    RENEW:    true,
    RESOLVE:  resolution.trim().length > 0,
  };

  return (
    <div className="action-panel">
      <div className="card-header">
        <span className="card-title">Manager Actions</span>
        {isResolved && (
          <span style={{
            fontSize: '12px', color: '#107E3E', background: '#E8F5E9',
            padding: '2px 8px', borderRadius: '10px', fontWeight: 600,
          }}>
            Exception Closed
          </span>
        )}
      </div>

      <div className="action-buttons">
        {allowedActions.map(({ key }) => {
          const meta = ACTION_META[key];
          const Icon = meta.icon;
          const isRecommended = key === recommendedBtn && !isResolved;
          const disabled = isResolved && key !== 'MONITOR';

          return (
            <button
              key={key}
              className={`action-btn ${key.toLowerCase()}${isRecommended ? ' recommended' : ''}`}
              onClick={() => !disabled && handleAction(key)}
              disabled={disabled}
              title={meta.label}
              aria-label={meta.label}
            >
              <div className="action-btn-icon">
                <Icon
                  size={18}
                  color={isRecommended ? '#0070F2' : meta.color}
                  strokeWidth={2}
                />
              </div>
              <div className="action-btn-label">{meta.label}</div>
              <div className="action-btn-sub">{meta.sub}</div>
              {isRecommended && <div className="action-recommended-dot" />}
            </button>
          );
        })}
      </div>

      {/* Assign Modal */}
      {modalState === 'ASSIGN' && (
        <Modal
          title={modalTitle.ASSIGN}
          onClose={() => setModalState(null)}
          footer={
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setModalState(null)}>Cancel</button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSubmit}
                disabled={!canSubmit.ASSIGN}
              >
                Assign Owner
              </button>
            </>
          }
        >
          <div style={{ fontSize: '13px', color: 'var(--t-secondary)', marginBottom: '4px' }}>
            Contract: <strong style={{ color: 'var(--t-primary)' }}>{contract.id} — {contract.title}</strong>
          </div>
          <div className="form-group">
            <label className="form-label">New Owner Name</label>
            <input
              className="form-input"
              type="text"
              placeholder="Full name (e.g. Sarah Johnson)"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Reason for assignment or additional context…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </Modal>
      )}

      {/* Escalate Modal */}
      {modalState === 'ESCALATE' && (
        <Modal
          title={modalTitle.ESCALATE}
          onClose={() => setModalState(null)}
          footer={
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setModalState(null)}>Cancel</button>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleSubmit}
                disabled={!canSubmit.ESCALATE}
              >
                Escalate Now
              </button>
            </>
          }
        >
          <div style={{ fontSize: '13px', color: 'var(--t-secondary)', marginBottom: '4px' }}>
            Escalating: <strong style={{ color: 'var(--t-primary)' }}>{contract.id}</strong>
            <span style={{
              marginLeft: '8px', fontSize: '11px', color: '#BB0000',
              background: '#FFEBEE', padding: '2px 6px', borderRadius: '4px',
            }}>
              {contract.riskLevel}
            </span>
          </div>
          <div className="form-group">
            <label className="form-label">Escalate To</label>
            <select
              className="form-select"
              value={escalateTo}
              onChange={(e) => setEscalateTo(e.target.value)}
            >
              <option value="">Select escalation target…</option>
              <option value="Procurement Director">Procurement Director</option>
              <option value="Legal & Compliance">Legal & Compliance Team</option>
              <option value="Finance Controller">Finance Controller</option>
              <option value="Operations Director">Operations Director</option>
              <option value="CEO/Board">CEO / Board Level</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Escalation Reason</label>
            <textarea
              className="form-textarea"
              placeholder="Describe the issue requiring escalation…"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </Modal>
      )}

      {/* Renew Modal */}
      {modalState === 'RENEW' && (
        <Modal
          title={modalTitle.RENEW}
          onClose={() => setModalState(null)}
          footer={
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setModalState(null)}>Cancel</button>
              <button className="btn btn-warning btn-sm" onClick={handleSubmit}>
                Initiate Renewal
              </button>
            </>
          }
        >
          <div style={{ fontSize: '13px', color: 'var(--t-secondary)', marginBottom: '4px' }}>
            Starting renewal for <strong style={{ color: 'var(--t-primary)' }}>{contract.title}</strong>
          </div>
          <div style={{
            background: '#FFF3E0', border: '1px solid #FFCC80',
            borderRadius: '6px', padding: '10px 12px',
            fontSize: '13px', color: '#BF360C',
          }}>
            This will initiate the SAP Ariba renewal workflow and notify {contract.ownerName || 'the contract owner'}.
          </div>
          <div className="form-group">
            <label className="form-label">Renewal Notes</label>
            <textarea
              className="form-textarea"
              placeholder="Any special terms, scope changes or instructions for the renewal…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </Modal>
      )}

      {/* Resolve Modal */}
      {modalState === 'RESOLVE' && (
        <Modal
          title={modalTitle.RESOLVE}
          onClose={() => setModalState(null)}
          footer={
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => setModalState(null)}>Cancel</button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleSubmit}
                disabled={!canSubmit.RESOLVE}
              >
                Mark Resolved
              </button>
            </>
          }
        >
          <div style={{ fontSize: '13px', color: 'var(--t-secondary)', marginBottom: '4px' }}>
            Closing exception on <strong style={{ color: 'var(--t-primary)' }}>{contract.id}</strong>
          </div>
          <div className="form-group">
            <label className="form-label">Resolution Summary *</label>
            <textarea
              className="form-textarea"
              placeholder="Describe how this exception was resolved (required for audit trail)…"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Additional Notes</label>
            <textarea
              className="form-textarea"
              placeholder="Any follow-up actions or comments…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
