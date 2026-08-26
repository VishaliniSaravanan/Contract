import React from 'react';
import {
  Building2, Calendar, Package, MapPin, FileText,
  AlertTriangle, TrendingUp, Clock, DollarSign,
} from 'lucide-react';
import { StatusBadge, RiskBadge, ExceptionBadge, ComplianceBadge } from '../shared/StatusBadge';
import AIDecisionPanel from './AIDecisionPanel';
import ActionPanel from './ActionPanel';
import AuditTimeline from './AuditTimeline';
import {
  formatDate,
  formatCurrencyFull,
  formatCurrency,
  daysUntilExpiry,
  expiryLabel,
  getRiskColor,
  getImpactColor,
  getSlaStatus,
  SLA_TARGETS,
  calcPriorityBreakdown,
  EXCEPTION_LABELS,
} from '../../utils/contractUtils';

function InfoRow({ label, value, mono }) {
  return (
    <div className="data-cell">
      <div className="data-cell-label">{label}</div>
      <div className={`data-cell-value${mono ? ' mono' : ''}`}>{value || '—'}</div>
    </div>
  );
}

export default function ContractDetail({ contract }) {
  if (!contract) {
    return (
      <div className="detail-panel">
        <div className="detail-empty">
          <div className="detail-empty-icon">
            <FileText size={56} />
          </div>
          <div className="detail-empty-title">Select a Contract</div>
          <div className="detail-empty-text">
            Choose a contract from the exception queue to view details, AI recommendations, and take action.
          </div>
        </div>
      </div>
    );
  }

  const days = daysUntilExpiry(contract.expiryDate);
  const expiry = expiryLabel(contract.expiryDate);
  const riskColor = getRiskColor(contract.riskLevel);
  const impactStyle = getImpactColor(contract.serviceImpact);
  const slaStatus = getSlaStatus(contract);
  const slaTarget = SLA_TARGETS[contract.riskLevel] || 30;
  const breakdown = calcPriorityBreakdown(contract);

  return (
    <div className="detail-panel">

      {/* ── Contract Header Card ── */}
      <div className="contract-header-card">
        {/* Top section */}
        <div className="contract-header-top">
          <div className="contract-header-id-block">
            <div className="contract-id">
              {contract.id} · {contract.aribaId}
            </div>
            <h2 className="contract-title-main">{contract.title}</h2>
            <div className="contract-vendor">
              <Building2 size={13} />
              {contract.businessPartner} · {contract.category}
            </div>
          </div>

          <div className="contract-header-status">
            <StatusBadge status={contract.status} />
            <RiskBadge level={contract.riskLevel} />
            <ComplianceBadge status={contract.complianceStatus} />
          </div>
        </div>

        {/* Data grid */}
        <div className="data-grid data-grid-4">
          <InfoRow label="Contract Value"     value={formatCurrencyFull(contract.amount, contract.currency)} />
          <InfoRow label="Start Date"         value={formatDate(contract.startDate)} />
          <InfoRow label="Expiry Date"        value={
            <span style={{ color: expiry.color, fontWeight: 700 }}>{formatDate(contract.expiryDate)}</span>
          } />
          <InfoRow label="Days to Expiry"     value={
            <span style={{ color: expiry.color, fontWeight: 700 }}>{expiry.text}</span>
          } />
          <InfoRow label="Company Code"       value={contract.companyCode} mono />
          <InfoRow label="Plant"              value={contract.plant} mono />
          <InfoRow label="Storage Location"   value={contract.storageLocation} mono />
          <InfoRow label="Cost Centre"        value={contract.costCentre} mono />
          <InfoRow label="Material"           value={contract.material} />
          <InfoRow label="Document"           value={contract.document} mono />
          <InfoRow label="Contract Type"      value={contract.contractType} />
          <InfoRow label="Requested Date"     value={formatDate(contract.requestedDate)} />
          <InfoRow label="Owner"              value={contract.ownerName || 'Unassigned'} />
          <InfoRow label="Assigned To"        value={contract.assignedTo || '—'} />
          <InfoRow label="Exception Age"      value={contract.aging > 0 ? `${contract.aging} days` : 'New'} />
          <InfoRow label="Value at Exposure"  value={formatCurrencyFull(contract.valueExposure || 0, contract.currency)} />
        </div>
      </div>

      {/* ── Risk Analysis + Transparent Score Breakdown ── */}
      <div className="card">
        <div className="card-header">
          <div className="card-header-left">
            <TrendingUp size={14} color="var(--t-secondary)" />
            <span className="card-title">Risk Analysis &amp; Score Transparency</span>
          </div>
          <span style={{
            fontSize: '13px', fontWeight: 800,
            color: riskColor,
            background: getRiskBgForCard(contract.riskLevel),
            padding: '3px 10px', borderRadius: '6px',
            border: `1px solid ${riskColor}30`,
          }}>
            Priority Score: {breakdown.total} / 100
          </span>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Summary grid */}
          <div className="risk-breakdown">
            <RiskItem label="Risk Level"     value={contract.riskLevel}   color={riskColor}          bg={getRiskBgForCard(contract.riskLevel)} />
            <RiskItem label="Service Impact" value={contract.serviceImpact} color={impactStyle.color} bg={impactStyle.bg} />
            <RiskItem
              label="SLA Status"
              value={slaStatus.label}
              color={slaStatus.color}
              bg={slaStatus.breached ? '#FFEBEE' : '#E8F5E9'}
              sub={`Target: ${slaTarget}d`}
            />
            <RiskItem
              label="Compliance"
              value={contract.complianceStatus === 'COMPLIANT' ? 'OK' : contract.complianceStatus === 'AT_RISK' ? 'At Risk' : 'Breach'}
              color={contract.complianceStatus === 'COMPLIANT' ? '#107E3E' : contract.complianceStatus === 'AT_RISK' ? '#E9730C' : '#BB0000'}
              bg={contract.complianceStatus === 'COMPLIANT' ? '#E8F5E9' : contract.complianceStatus === 'AT_RISK' ? '#FFF3E0' : '#FFEBEE'}
            />
          </div>

          {/* ── Transparent Score Decomposition ── */}
          <div style={{ borderTop: '1px solid var(--bd-default)', paddingTop: '14px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '10px',
            }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--t-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: riskColor, display: 'inline-block' }} />
                How this score was calculated
              </div>
              <span style={{ fontSize: '11px', color: 'var(--t-tertiary)' }}>4-factor transparent model</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {breakdown.dimensions.map((dim) => {
                const pct = dim.max > 0 ? (dim.score / dim.max) * 100 : 0;
                const barColor = dim.score >= dim.max * 0.8 ? '#BB0000'
                               : dim.score >= dim.max * 0.5 ? '#E9730C'
                               : dim.score >= dim.max * 0.2 ? '#E78C07'
                               : '#107E3E';
                return (
                  <div key={dim.key} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Label */}
                    <div style={{ width: '130px', flexShrink: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--t-primary)', lineHeight: 1.2 }}>
                        {dim.label}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--t-tertiary)' }}>
                        Weight {dim.weight}
                      </div>
                    </div>
                    {/* Bar */}
                    <div style={{ flex: 1, background: 'var(--c-bg)', borderRadius: '4px', height: '10px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`,
                        background: barColor,
                        height: '100%',
                        borderRadius: '4px',
                        transition: 'width 0.6s ease',
                        minWidth: pct > 0 ? '4px' : '0',
                      }} />
                    </div>
                    {/* Score */}
                    <div style={{ width: '50px', textAlign: 'right', flexShrink: 0 }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: barColor }}>
                        {dim.score}
                      </span>
                      <span style={{ fontSize: '10px', color: 'var(--t-tertiary)' }}>/{dim.max}</span>
                    </div>
                    {/* Detail */}
                    <div style={{ width: '130px', fontSize: '11px', color: 'var(--t-secondary)', flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {dim.detail}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total row */}
            <div style={{
              marginTop: '12px', paddingTop: '10px',
              borderTop: '2px solid var(--bd-default)',
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px',
            }}>
              <span style={{ fontSize: '12px', color: 'var(--t-secondary)', fontWeight: 500 }}>
                Total Priority Score
              </span>
              <div style={{ flex: 1, background: 'var(--c-bg)', borderRadius: '4px', height: '10px', overflow: 'hidden' }}>
                <div style={{
                  width: `${breakdown.total}%`,
                  background: riskColor,
                  height: '100%',
                  borderRadius: '4px',
                  transition: 'width 0.6s ease',
                }} />
              </div>
              <span style={{
                fontSize: '16px', fontWeight: 800, color: riskColor,
                minWidth: '60px', textAlign: 'right',
              }}>
                {breakdown.total}<span style={{ fontSize: '11px', color: 'var(--t-tertiary)', fontWeight: 400 }}>/100</span>
              </span>
            </div>

            <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--t-tertiary)', lineHeight: 1.5 }}>
              Score range: <strong>80–100</strong> Critical · <strong>55–79</strong> High · <strong>30–54</strong> Medium · <strong>0–29</strong> Low.
              Expiry proximity carries the highest weight (50pts) reflecting Rivergate's operational continuity requirements.
            </div>
          </div>
        </div>
      </div>

      {/* ── Exceptions Card ── */}
      <div className="card">
        <div className="card-header">
          <div className="card-header-left">
            <AlertTriangle size={14} color="var(--t-secondary)" />
            <span className="card-title">Active Exceptions</span>
          </div>
          <span style={{
            background: contract.exceptions.length > 0 ? '#FFEBEE' : '#E8F5E9',
            color: contract.exceptions.length > 0 ? '#BB0000' : '#107E3E',
            fontSize: '11px', fontWeight: 700,
            padding: '2px 8px', borderRadius: '10px',
          }}>
            {contract.exceptions.length} exception{contract.exceptions.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="card-body-compact">
          {contract.exceptions.length === 0 ? (
            <div className="exception-none">
              <AlertTriangle size={14} />
              No active exceptions — contract is compliant
            </div>
          ) : (
            <div className="exception-list">
              {contract.exceptions.map((exc) => (
                <ExceptionRow key={exc} type={exc} aging={contract.aging} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── AI Decision Support ── */}
      <AIDecisionPanel contract={contract} />

      {/* ── Action Panel ── */}
      <ActionPanel contract={contract} />

      {/* ── Audit Timeline ── */}
      <AuditTimeline contract={contract} />
    </div>
  );
}

function RiskItem({ label, value, color, bg, sub }) {
  return (
    <div className="risk-item">
      <div className="risk-item-value" style={{ color }}>{value}</div>
      <div className="risk-item-label">{label}</div>
      {sub && <div style={{ fontSize: '10px', color: 'var(--t-tertiary)', marginTop: '2px' }}>{sub}</div>}
    </div>
  );
}

function ExceptionRow({ type, aging }) {
  const SEVERITY = {
    EXPIRY_CRITICAL: 'CRITICAL',
    RENEWAL_OVERDUE: 'CRITICAL',
    OBLIGATION_BREACH: 'CRITICAL',
    EXPIRY_WARNING: 'HIGH',
    AUTO_RENEWAL_RISK: 'HIGH',
    COMPLIANCE_GAP: 'HIGH',
    RENEWAL_DUE: 'MEDIUM',
    AWAITING_APPROVAL: 'MEDIUM',
    VALUE_EXPOSURE: 'MEDIUM',
    SPEND_EXCEEDED: 'MEDIUM',
  };
  const severity = SEVERITY[type] || 'MEDIUM';
  const colors = {
    CRITICAL: { bg: '#FFEBEE', color: '#BB0000', border: '#EF9A9A' },
    HIGH:     { bg: '#FFF3E0', color: '#BF360C', border: '#FFCC80' },
    MEDIUM:   { bg: '#FFF9C4', color: '#F57F17', border: '#FFE082' },
  };
  const s = colors[severity];

  return (
    <div className="exception-item" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
      <div className="exception-item-left">
        <AlertTriangle size={13} color={s.color} />
        <span className="exception-item-name" style={{ color: s.color }}>
          {EXCEPTION_LABELS[type] || type}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{
          fontSize: '10px', fontWeight: 700,
          color: s.color, background: 'rgba(255,255,255,0.6)',
          padding: '1px 6px', borderRadius: '4px',
        }}>
          {severity}
        </span>
        {aging > 0 && (
          <span className="exception-item-aging">{aging}d old</span>
        )}
      </div>
    </div>
  );
}

function getRiskBgForCard(level) {
  switch (level) {
    case 'CRITICAL': return '#FFEBEE';
    case 'HIGH':     return '#FFF3E0';
    case 'MEDIUM':   return '#FFFDE7';
    case 'LOW':      return '#E8F5E9';
    default:         return '#F5F6F7';
  }
}
