// ============================================================
// contractUtils.js
// Core business logic: Risk calculation, exception detection,
// AI recommendation engine, KPI computation, export utilities
// Rivergate Water Services — Contract Exception Workbench
// ============================================================

// ── Organisation Constants ────────────────────────────────────
export const RIVERGATE_REVENUE   = 3_600_000_000;          // £3.6 billion annual revenue
export const RISK_EXPOSURE_LOW   = RIVERGATE_REVENUE * 0.01; // £36M  (1% revenue)
export const RISK_EXPOSURE_HIGH  = RIVERGATE_REVENUE * 0.02; // £72M  (2% revenue)
export const PRODUCTIVITY_TARGET = { low: 0.20, high: 0.35 };// 20–35% improvement target
export const AGEING_TARGET       = { low: 0.10, high: 0.20 };// 10–20% ageing reduction

// SLA resolution targets by risk level (working days)
export const SLA_TARGETS = {
  CRITICAL: 2,
  HIGH:     5,
  MEDIUM:   10,
  LOW:      30,
};

// ── Constants ────────────────────────────────────────────────

export const RISK_LEVELS = { CRITICAL: 'CRITICAL', HIGH: 'HIGH', MEDIUM: 'MEDIUM', LOW: 'LOW' };

export const EXCEPTION_LABELS = {
  EXPIRY_CRITICAL:   'Expiry Critical',
  EXPIRY_WARNING:    'Expiry Warning',
  RENEWAL_OVERDUE:   'Renewal Overdue',
  RENEWAL_DUE:       'Renewal Due',
  OBLIGATION_BREACH: 'Obligation Breach',
  SPEND_EXCEEDED:    'Spend Exceeded',
  COMPLIANCE_GAP:    'Compliance Gap',
  AWAITING_APPROVAL: 'Awaiting Approval',
  AUTO_RENEWAL_RISK: 'Auto-Renewal Risk',
  VALUE_EXPOSURE:    'Value Exposure',
  NONE:              'No Exception',
};

export const STATUS_LABELS = {
  ACTIVE:            'Active',
  AWAITING_APPROVAL: 'Awaiting Approval',
  RENEWAL_OVERDUE:   'Renewal Overdue',
  RENEWAL_DUE:       'Renewal Due',
  EXPIRY_CRITICAL:   'Expiry Critical',
  EXPIRY_WARNING:    'Expiry Warning',
  OBLIGATION_BREACH: 'Obligation Breach',
  SPEND_EXCEEDED:    'Spend Exceeded',
  COMPLIANCE_GAP:    'Compliance Gap',
  AUTO_RENEWAL_RISK: 'Auto-Renewal Risk',
  VALUE_EXPOSURE:    'Value Exposure',
  ESCALATED:         'Escalated',
  RESOLVED:          'Resolved',
};

export const ACTION_LABELS = {
  RENEW_IMMEDIATELY: 'Renew Immediately',
  ESCALATE_URGENT:   'Escalate Urgently',
  APPROVE_AND_RENEW: 'Approve & Renew',
  APPROVE_NOW:       'Approve Now',
  LEGAL_REVIEW:      'Legal Review Required',
  REVIEW_AMEND:      'Review & Amend',
  MONITOR_RENEW:     'Monitor & Plan Renewal',
  INITIATE_RENEWAL:  'Initiate Renewal',
  MONITOR:           'Monitor',
  RESOLVE:           'Resolve',
};

// ── Date Utilities ───────────────────────────────────────────

export const TODAY = new Date('2026-08-26');

export function daysUntilExpiry(expiryDateStr) {
  const expiry = new Date(expiryDateStr);
  const diff = expiry - TODAY;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatCurrency(amount, currency = 'GBP') {
  if (amount == null) return '—';
  const symbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$';
  if (amount >= 1000000) return `${symbol}${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${symbol}${(amount / 1000).toFixed(0)}K`;
  return `${symbol}${amount.toLocaleString('en-GB')}`;
}

export function formatCurrencyFull(amount, currency = 'GBP') {
  if (amount == null) return '—';
  const symbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$';
  return `${symbol}${amount.toLocaleString('en-GB')}`;
}

export function daysAgoLabel(days) {
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 0) return `In ${Math.abs(days)} days`;
  return `${days} days ago`;
}

// ── Priority Score + Transparent Breakdown ───────────────────
// Returns 0–100 composite score AND dimension breakdown for UI transparency

export function calcPriorityBreakdown(contract) {
  const days = daysUntilExpiry(contract.expiryDate);

  // Dimension 1: Expiry proximity (0–50 pts)
  let expiryScore = 0;
  let expiryLabel = '';
  if (days < 0)        { expiryScore = 50; expiryLabel = `${Math.abs(days)}d overdue`; }
  else if (days < 7)   { expiryScore = 45; expiryLabel = `${days}d — Critical`; }
  else if (days < 14)  { expiryScore = 35; expiryLabel = `${days}d — High urgency`; }
  else if (days < 30)  { expiryScore = 25; expiryLabel = `${days}d — Warning`; }
  else if (days < 60)  { expiryScore = 10; expiryLabel = `${days}d — Monitor`; }
  else if (days < 90)  { expiryScore = 5;  expiryLabel = `${days}d — Low`; }
  else                 { expiryScore = 0;  expiryLabel = `${days}d — No urgency`; }

  // Dimension 2: Value exposure (0–25 pts)
  const v = contract.valueExposure || contract.amount || 0;
  let valueScore = 0;
  let valueLabel = '';
  if (v >= 1000000)     { valueScore = 25; valueLabel = `${formatCurrency(v)} — Very High`; }
  else if (v >= 500000) { valueScore = 20; valueLabel = `${formatCurrency(v)} — High`; }
  else if (v >= 200000) { valueScore = 14; valueLabel = `${formatCurrency(v)} — Medium-High`; }
  else if (v >= 100000) { valueScore = 9;  valueLabel = `${formatCurrency(v)} — Medium`; }
  else if (v >= 50000)  { valueScore = 5;  valueLabel = `${formatCurrency(v)} — Low-Medium`; }
  else                  { valueScore = 2;  valueLabel = `${formatCurrency(v)} — Low`; }

  // Dimension 3: Exception count × type severity (0–15 pts)
  const excCount = (contract.exceptions || []).length;
  const exceptionsScore = Math.min(excCount * 4, 15);
  const exceptionsLabel = excCount === 0
    ? 'None'
    : `${excCount} exception${excCount > 1 ? 's' : ''} active`;

  // Dimension 4: Exception aging (0–10 pts)
  const aging = contract.aging || 0;
  let agingScore = 0;
  let agingLabel = '';
  if (aging >= 45)     { agingScore = 10; agingLabel = `${aging}d — Critically aged`; }
  else if (aging >= 30){ agingScore = 8;  agingLabel = `${aging}d — Overdue`; }
  else if (aging >= 14){ agingScore = 5;  agingLabel = `${aging}d — Ageing`; }
  else if (aging >= 7) { agingScore = 3;  agingLabel = `${aging}d — Recent`; }
  else if (aging >= 1) { agingScore = 1;  agingLabel = `${aging}d — New`; }
  else                 { agingScore = 0;  agingLabel = 'No aging'; }

  const total = Math.min(expiryScore + valueScore + exceptionsScore + agingScore, 100);

  return {
    total,
    dimensions: [
      { key: 'expiry',     label: 'Expiry Proximity',   score: expiryScore,     max: 50, detail: expiryLabel,     weight: '50%' },
      { key: 'value',      label: 'Value Exposure',     score: valueScore,      max: 25, detail: valueLabel,      weight: '25%' },
      { key: 'exceptions', label: 'Exception Severity', score: exceptionsScore, max: 15, detail: exceptionsLabel, weight: '15%' },
      { key: 'aging',      label: 'Exception Aging',    score: agingScore,      max: 10, detail: agingLabel,      weight: '10%' },
    ],
  };
}

export function calcPriorityScore(contract) {
  return calcPriorityBreakdown(contract).total;
}

// ── Risk Level Derivation ─────────────────────────────────────

export function getRiskColor(level) {
  switch (level) {
    case 'CRITICAL': return '#BB0000';
    case 'HIGH':     return '#E9730C';
    case 'MEDIUM':   return '#E78C07';
    case 'LOW':      return '#107E3E';
    default:         return '#556B82';
  }
}

export function getRiskBg(level) {
  switch (level) {
    case 'CRITICAL': return '#FFEBEE';
    case 'HIGH':     return '#FFF3E0';
    case 'MEDIUM':   return '#FFFDE7';
    case 'LOW':      return '#E8F5E9';
    default:         return '#F5F6F7';
  }
}

// ── Exception Badge Color ─────────────────────────────────────

export function getExceptionColor(type) {
  switch (type) {
    case 'EXPIRY_CRITICAL':
    case 'RENEWAL_OVERDUE':
    case 'OBLIGATION_BREACH':
      return { bg: '#FFEBEE', color: '#BB0000', border: '#EF9A9A' };
    case 'EXPIRY_WARNING':
    case 'AUTO_RENEWAL_RISK':
    case 'COMPLIANCE_GAP':
      return { bg: '#FFF3E0', color: '#BF360C', border: '#FFCC80' };
    case 'RENEWAL_DUE':
    case 'AWAITING_APPROVAL':
    case 'VALUE_EXPOSURE':
      return { bg: '#FFF9C4', color: '#F57F17', border: '#FFE082' };
    case 'SPEND_EXCEEDED':
      return { bg: '#EDE7F6', color: '#4527A0', border: '#CE93D8' };
    default:
      return { bg: '#E8F5E9', color: '#1B5E20', border: '#A5D6A7' };
  }
}

// ── Compliance Status ─────────────────────────────────────────

export function getComplianceColor(status) {
  switch (status) {
    case 'COMPLIANT':     return { bg: '#E8F5E9', color: '#107E3E' };
    case 'AT_RISK':       return { bg: '#FFF3E0', color: '#E9730C' };
    case 'NON_COMPLIANT': return { bg: '#FFEBEE', color: '#BB0000' };
    default:              return { bg: '#F5F6F7', color: '#556B82' };
  }
}

// ── Urgency from AI Action ────────────────────────────────────

export function getUrgencyFromAction(action) {
  switch (action) {
    case 'RENEW_IMMEDIATELY':
    case 'ESCALATE_URGENT':
      return { label: 'IMMEDIATE', color: '#BB0000', bg: '#FFEBEE' };
    case 'APPROVE_AND_RENEW':
    case 'APPROVE_NOW':
    case 'LEGAL_REVIEW':
      return { label: 'TODAY', color: '#E9730C', bg: '#FFF3E0' };
    case 'INITIATE_RENEWAL':
    case 'REVIEW_AMEND':
      return { label: 'THIS WEEK', color: '#E78C07', bg: '#FFFDE7' };
    case 'MONITOR_RENEW':
      return { label: 'THIS MONTH', color: '#0070F2', bg: '#E8F4FD' };
    case 'MONITOR':
    default:
      return { label: 'MONITOR', color: '#107E3E', bg: '#E8F5E9' };
  }
}

// ── Service Impact Color ──────────────────────────────────────

export function getImpactColor(impact) {
  switch (impact) {
    case 'CRITICAL': return { color: '#BB0000', bg: '#FFEBEE' };
    case 'HIGH':     return { color: '#E9730C', bg: '#FFF3E0' };
    case 'MEDIUM':   return { color: '#E78C07', bg: '#FFFDE7' };
    case 'LOW':      return { color: '#107E3E', bg: '#E8F5E9' };
    case 'NONE':     return { color: '#556B82', bg: '#F5F6F7' };
    default:         return { color: '#556B82', bg: '#F5F6F7' };
  }
}

// ── SLA Breach Detection ──────────────────────────────────────

export function isSlaBreached(contract) {
  if (!contract.aging || contract.exceptions.length === 0) return false;
  const target = SLA_TARGETS[contract.riskLevel] || 30;
  return contract.aging > target;
}

export function getSlaStatus(contract) {
  if (contract.exceptions.length === 0) return { breached: false, label: 'N/A', color: '#556B82' };
  const target = SLA_TARGETS[contract.riskLevel] || 30;
  const aging = contract.aging || 0;
  if (aging === 0) return { breached: false, label: 'On Track', color: '#107E3E', daysRemaining: target };
  const remaining = target - aging;
  if (remaining < 0)  return { breached: true,  label: `${Math.abs(remaining)}d overdue`, color: '#BB0000', daysRemaining: remaining };
  if (remaining <= 1) return { breached: true,  label: 'Due today', color: '#BB0000', daysRemaining: remaining };
  if (remaining <= 2) return { breached: false, label: `${remaining}d left`, color: '#E9730C', daysRemaining: remaining };
  return { breached: false, label: `${remaining}d left`, color: '#107E3E', daysRemaining: remaining };
}

// ── KPI Aggregations ──────────────────────────────────────────

export function computeKPIs(contracts) {
  const active   = contracts.filter(c => c.status !== 'RESOLVED');
  const resolved = contracts.filter(c => c.status === 'RESOLVED');
  const withExceptions = active.filter(c => c.exceptions.length > 0);

  // Risk distribution
  const critical = active.filter(c => c.riskLevel === 'CRITICAL').length;
  const high     = active.filter(c => c.riskLevel === 'HIGH').length;
  const medium   = active.filter(c => c.riskLevel === 'MEDIUM').length;
  const low      = active.filter(c => c.riskLevel === 'LOW').length;

  // Expiry
  const expiringSoon = active.filter(c => {
    const d = daysUntilExpiry(c.expiryDate);
    return d >= 0 && d <= 30;
  }).length;

  // Value at risk (CRITICAL + HIGH)
  const totalValueAtRisk = active
    .filter(c => ['CRITICAL', 'HIGH'].includes(c.riskLevel))
    .reduce((sum, c) => sum + (c.valueExposure || c.amount || 0), 0);

  // Exposure as % of Rivergate annual revenue
  const exposurePct = ((totalValueAtRisk / RIVERGATE_REVENUE) * 100).toFixed(2);

  // Pending
  const pendingApproval = active.filter(c => c.exceptions.includes('AWAITING_APPROVAL')).length;
  const overdue         = active.filter(c => c.exceptions.includes('RENEWAL_OVERDUE')).length;
  const totalExceptions = active.reduce((sum, c) => sum + (c.exceptions || []).length, 0);

  // ── Operational KPIs ──────────────────────────────────────

  // SLA Adherence: % of contracts with exceptions where aging ≤ SLA target
  const slaContracts = withExceptions;
  const slaBreached  = slaContracts.filter(c => isSlaBreached(c)).length;
  const slaAdherence = slaContracts.length > 0
    ? Math.round(((slaContracts.length - slaBreached) / slaContracts.length) * 100)
    : 100;

  // Average exception age (days)
  const agingValues = withExceptions.map(c => c.aging || 0);
  const avgExceptionAge = agingValues.length > 0
    ? Math.round(agingValues.reduce((a, b) => a + b, 0) / agingValues.length)
    : 0;

  // First-Pass Yield: % of contracts resolved without an ESCALATED status in audit trail
  const resolvedCount = resolved.length;
  const escalatedThenResolved = resolved.filter(c =>
    c.auditTrail.some(e => e.action === 'Escalated')
  ).length;
  const firstPassYield = resolvedCount > 0
    ? Math.round(((resolvedCount - escalatedThenResolved) / resolvedCount) * 100)
    : null; // null = no resolved contracts yet

  // Recurrence rate: contracts that had same exception type re-raised
  // (proxy: contracts where auditTrail has >1 EXCEPTION type entry with same action)
  const recurrenceCount = contracts.filter(c => {
    const excEntries = (c.auditTrail || []).filter(e => e.type === 'EXCEPTION');
    const actions = excEntries.map(e => e.action);
    return new Set(actions).size < actions.length; // duplicate action = recurrence
  }).length;
  const recurrenceRate = contracts.length > 0
    ? Math.round((recurrenceCount / contracts.length) * 100)
    : 0;

  // Compliance rate: % COMPLIANT
  const compliantCount = active.filter(c => c.complianceStatus === 'COMPLIANT').length;
  const complianceRate = active.length > 0
    ? Math.round((compliantCount / active.length) * 100)
    : 100;

  // Service impact breakdown
  const criticalServiceImpact = active.filter(c => c.serviceImpact === 'CRITICAL').length;
  const highServiceImpact     = active.filter(c => c.serviceImpact === 'HIGH').length;

  // Productivity improvement estimate (based on resolved vs outstanding)
  // Baseline: each resolved exception saves ~4 staff hours
  const hoursRecovered = resolved.length * 4;

  return {
    // Risk
    critical, high, medium, low,
    // Expiry & renewal
    expiringSoon, overdue,
    // Value
    totalValueAtRisk, exposurePct,
    // Approval
    pendingApproval,
    // Exception totals
    totalExceptions, totalActive: active.length,
    // Revenue context
    revenueAtRisk1pct: RISK_EXPOSURE_LOW,
    revenueAtRisk2pct: RISK_EXPOSURE_HIGH,
    // Operational KPIs
    slaAdherence, slaBreached,
    avgExceptionAge,
    firstPassYield,
    recurrenceRate, recurrenceCount,
    complianceRate, compliantCount,
    criticalServiceImpact, highServiceImpact,
    // Resolved
    resolvedCount,
    hoursRecovered,
  };
}

// ── Sort Contracts by Priority ────────────────────────────────

export function sortByPriority(contracts) {
  return [...contracts].sort((a, b) => {
    const pa = calcPriorityScore(a);
    const pb = calcPriorityScore(b);
    return pb - pa;
  });
}

// ── Filter Contracts ──────────────────────────────────────────

export function filterContracts(contracts, { riskFilter, exceptionFilter, searchTerm, userRole, userEmail }) {
  let filtered = [...contracts];

  if (userRole === 'CONTRACT_OWNER') {
    filtered = filtered.filter(c => c.ownerEmail === userEmail);
  } else if (userRole === 'APPROVER') {
    filtered = filtered.filter(c => c.exceptions.includes('AWAITING_APPROVAL'));
  }

  if (riskFilter && riskFilter !== 'ALL') {
    filtered = filtered.filter(c => c.riskLevel === riskFilter);
  }

  if (exceptionFilter && exceptionFilter !== 'ALL') {
    filtered = filtered.filter(c => c.exceptions.includes(exceptionFilter));
  }

  if (searchTerm) {
    const lower = searchTerm.toLowerCase();
    filtered = filtered.filter(c =>
      c.id.toLowerCase().includes(lower) ||
      c.title.toLowerCase().includes(lower) ||
      c.businessPartner.toLowerCase().includes(lower) ||
      c.ownerName.toLowerCase().includes(lower) ||
      c.category.toLowerCase().includes(lower)
    );
  }

  return sortByPriority(filtered);
}

// ── Expiry Label ──────────────────────────────────────────────

export function expiryLabel(expiryDateStr) {
  const days = daysUntilExpiry(expiryDateStr);
  if (days < 0)   return { text: `${Math.abs(days)}d overdue`, color: '#BB0000' };
  if (days === 0) return { text: 'Expires today',               color: '#BB0000' };
  if (days <= 7)  return { text: `${days}d left`,               color: '#BB0000' };
  if (days <= 30) return { text: `${days}d left`,               color: '#E9730C' };
  if (days <= 60) return { text: `${days}d left`,               color: '#E78C07' };
  return           { text: `${days}d left`,                     color: '#107E3E' };
}

// ── Persona Permissions ───────────────────────────────────────

export function canPerformAction(user, action) {
  if (!user) return false;
  return (user.permissions || []).includes(action);
}

export function getPersonaActions(user) {
  if (!user) return [];
  const all = [
    { key: 'MONITOR',  label: 'Monitor',       icon: 'Eye',           perm: 'MONITOR' },
    { key: 'ASSIGN',   label: 'Assign Owner',  icon: 'UserPlus',      perm: 'ASSIGN_OWNER' },
    { key: 'ESCALATE', label: 'Escalate',      icon: 'ArrowUpCircle', perm: 'ESCALATE' },
    { key: 'RENEW',    label: 'Start Renewal', icon: 'RefreshCw',     perm: 'INITIATE_RENEWAL' },
    { key: 'RESOLVE',  label: 'Resolve',       icon: 'CheckCircle',   perm: 'RESOLVE' },
  ];
  return all.filter(a => (user.permissions || []).includes(a.perm));
}

// ── Audit Entry Factory ───────────────────────────────────────

let auditCounter = 1000;
export function createAuditEntry(action, user, note, type = 'ACTION') {
  auditCounter += 1;
  return {
    id:       `AUD-${auditCounter}`,
    date:     TODAY.toISOString().split('T')[0],
    action,
    user:     user.email,
    userRole: user.roleLabel,
    note,
    type,
  };
}

// ── CSV Export ────────────────────────────────────────────────

export function exportContractsCSV(contracts) {
  const headers = [
    'Contract ID', 'Title', 'Business Partner', 'Category', 'Contract Type',
    'Amount (£)', 'Currency', 'Start Date', 'Expiry Date', 'Status',
    'Risk Level', 'Priority Score', 'Exceptions', 'Exception Count',
    'Owner', 'Service Impact', 'Compliance Status', 'Exception Age (days)',
    'Value at Exposure (£)', 'Company Code', 'Plant', 'Cost Centre', 'Document',
  ];

  const rows = contracts.map(c => [
    c.id,
    `"${c.title}"`,
    `"${c.businessPartner}"`,
    c.category,
    c.contractType,
    c.amount,
    c.currency,
    c.startDate,
    c.expiryDate,
    c.status,
    c.riskLevel,
    c.priorityScore || calcPriorityScore(c),
    `"${(c.exceptions || []).join('; ')}"`,
    (c.exceptions || []).length,
    `"${c.ownerName || 'Unassigned'}"`,
    c.serviceImpact,
    c.complianceStatus,
    c.aging || 0,
    c.valueExposure || 0,
    c.companyCode,
    c.plant,
    c.costCentre,
    c.document,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `rivergate-contracts-exceptions-${TODAY.toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
