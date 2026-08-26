import React from 'react';
import {
  EXCEPTION_LABELS,
  STATUS_LABELS,
  getRiskColor,
  getRiskBg,
  getExceptionColor,
  getComplianceColor,
} from '../../utils/contractUtils';

// ── Risk Badge ────────────────────────────────────────────────
export function RiskBadge({ level, size = 'sm' }) {
  const color = getRiskColor(level);
  const bg    = getRiskBg(level);
  return (
    <span
      className="badge-risk"
      style={{ color, background: bg, border: `1px solid ${color}40` }}
    >
      {level}
    </span>
  );
}

// ── Status Badge ──────────────────────────────────────────────
export function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] || status;

  const styleMap = {
    ACTIVE:            { bg: '#E8F5E9', color: '#107E3E' },
    AWAITING_APPROVAL: { bg: '#FFF9C4', color: '#F57F17' },
    RENEWAL_OVERDUE:   { bg: '#FFEBEE', color: '#BB0000' },
    RENEWAL_DUE:       { bg: '#FFF3E0', color: '#BF360C' },
    EXPIRY_CRITICAL:   { bg: '#FFEBEE', color: '#BB0000' },
    EXPIRY_WARNING:    { bg: '#FFF3E0', color: '#E9730C' },
    OBLIGATION_BREACH: { bg: '#FFEBEE', color: '#BB0000' },
    SPEND_EXCEEDED:    { bg: '#EDE7F6', color: '#4527A0' },
    COMPLIANCE_GAP:    { bg: '#FFF3E0', color: '#BF360C' },
    AUTO_RENEWAL_RISK: { bg: '#FFF3E0', color: '#E9730C' },
    VALUE_EXPOSURE:    { bg: '#EDE7F6', color: '#4527A0' },
    ESCALATED:         { bg: '#FFEBEE', color: '#BB0000' },
    RESOLVED:          { bg: '#E8F5E9', color: '#107E3E' },
  };

  const s = styleMap[status] || { bg: '#F5F6F7', color: '#556B82' };

  return (
    <span
      className="badge"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}30` }}
    >
      {label}
    </span>
  );
}

// ── Exception Badge ───────────────────────────────────────────
export function ExceptionBadge({ type }) {
  const label = EXCEPTION_LABELS[type] || type;
  const s = getExceptionColor(type);
  return (
    <span
      className="badge"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {label}
    </span>
  );
}

// ── Compliance Badge ──────────────────────────────────────────
export function ComplianceBadge({ status }) {
  const labelMap = {
    COMPLIANT:     'Compliant',
    AT_RISK:       'At Risk',
    NON_COMPLIANT: 'Non-Compliant',
  };
  const s = getComplianceColor(status);
  return (
    <span
      className="badge"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}30` }}
    >
      {labelMap[status] || status}
    </span>
  );
}
