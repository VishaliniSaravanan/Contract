import React from 'react';
import {
  TrendingUp, AlertTriangle, Clock, CheckCircle, BarChart2,
  Shield, Activity, Download, DollarSign, Target, RefreshCw,
} from 'lucide-react';
import { useContracts } from '../../context/ContractContext';
import { useAuth } from '../../context/AuthContext';
import {
  computeKPIs, formatCurrency, formatCurrencyFull, daysUntilExpiry,
  RIVERGATE_REVENUE, RISK_EXPOSURE_LOW, RISK_EXPOSURE_HIGH,
  PRODUCTIVITY_TARGET, AGEING_TARGET, exportContractsCSV,
} from '../../utils/contractUtils';

function MiniBar({ value, max, color, height = 8 }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ background: 'var(--c-bg)', borderRadius: '4px', height, overflow: 'hidden', flex: 1 }}>
      <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: '4px', transition: 'width 0.5s ease', minWidth: pct > 0 ? '4px' : '0' }} />
    </div>
  );
}

function KpiTile({ label, value, sub, color, bg, icon: Icon, borderColor }) {
  return (
    <div style={{
      background: 'var(--c-surface)', border: '1px solid var(--bd-default)',
      borderLeft: `3px solid ${borderColor || color}`,
      borderRadius: 'var(--r-lg)', padding: '12px 16px',
      display: 'flex', alignItems: 'flex-start', gap: '10px',
      boxShadow: 'var(--shadow-sm)',
    }}>
      {Icon && (
        <div style={{ width: 32, height: 32, borderRadius: '6px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={15} color={color} />
        </div>
      )}
      <div>
        <div style={{ fontSize: '11px', color: 'var(--t-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.4px', lineHeight: 1.2 }}>{label}</div>
        <div style={{ fontSize: '20px', fontWeight: 800, color: color || 'var(--t-primary)', lineHeight: 1.2, marginTop: '2px' }}>{value}</div>
        {sub && <div style={{ fontSize: '11px', color: 'var(--t-tertiary)', marginTop: '2px' }}>{sub}</div>}
      </div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', marginTop: '4px' }}>
      {Icon && <Icon size={15} color="var(--t-secondary)" />}
      <div>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t-primary)' }}>{title}</div>
        {sub && <div style={{ fontSize: '11px', color: 'var(--t-secondary)' }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function AnalyticsView() {
  const { contracts } = useContracts();
  const { user }      = useAuth();
  const kpis = computeKPIs(contracts);

  // Category breakdown
  const byCategory = contracts.reduce((acc, c) => { acc[c.category] = (acc[c.category] || 0) + 1; return acc; }, {});
  const topCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCat = Math.max(...topCategories.map(c => c[1]), 1);

  // Exception type breakdown
  const excTypes = {};
  contracts.forEach(c => c.exceptions.forEach(e => { excTypes[e] = (excTypes[e] || 0) + 1; }));
  const topExceptions = Object.entries(excTypes).sort((a, b) => b[1] - a[1]).slice(0, 7);
  const maxExc = Math.max(...topExceptions.map(e => e[1]), 1);

  // Upcoming expirations
  const upcoming = contracts
    .filter(c => { const d = daysUntilExpiry(c.expiryDate); return d >= 0 && d <= 90; })
    .sort((a, b) => daysUntilExpiry(a.expiryDate) - daysUntilExpiry(b.expiryDate))
    .slice(0, 10);

  const EXC_LABELS = {
    EXPIRY_CRITICAL: 'Expiry Critical', RENEWAL_OVERDUE: 'Renewal Overdue',
    OBLIGATION_BREACH: 'Obligation Breach', EXPIRY_WARNING: 'Expiry Warning',
    COMPLIANCE_GAP: 'Compliance Gap', AWAITING_APPROVAL: 'Awaiting Approval',
    AUTO_RENEWAL_RISK: 'Auto-Renewal Risk', SPEND_EXCEEDED: 'Spend Exceeded',
    VALUE_EXPOSURE: 'Value Exposure', RENEWAL_DUE: 'Renewal Due',
  };
  const EXC_COLORS = {
    EXPIRY_CRITICAL: '#BB0000', RENEWAL_OVERDUE: '#BB0000',
    OBLIGATION_BREACH: '#BB0000', EXPIRY_WARNING: '#E9730C',
    COMPLIANCE_GAP: '#E9730C', AWAITING_APPROVAL: '#E78C07',
    AUTO_RENEWAL_RISK: '#E9730C', SPEND_EXCEEDED: '#7B1FA2',
    VALUE_EXPOSURE: '#7B1FA2', RENEWAL_DUE: '#E78C07',
  };

  // Financial exposure vs revenue
  const exposurePctNum = parseFloat(kpis.exposurePct);
  const exposureBarColor = exposurePctNum >= 1.5 ? '#BB0000' : exposurePctNum >= 0.8 ? '#E9730C' : '#E78C07';

  // Productivity estimate
  const productivityLow  = Math.round(kpis.resolvedCount * 4);
  const productivityHigh = Math.round(kpis.resolvedCount * 6);

  return (
    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px', overflow: 'auto', flex: 1 }}>

      {/* ── Executive Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, #0B1E35 0%, #0D2745 100%)',
        border: '1px solid #1E3A5C', borderRadius: '10px',
        padding: '16px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '11px', color: '#8FA8C8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
              Rivergate Water Services · Executive Dashboard
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#FFFFFF', marginBottom: '4px' }}>
              Contract Exception &amp; Risk Summary
            </div>
            <div style={{ fontSize: '12px', color: '#8FA8C8' }}>
              Source to Pay › Contract Lifecycle · SAP S/4HANA + SAP Ariba · Period: 26 Aug 2026
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {user?.permissions?.includes('EXPORT') && (
              <button
                className="btn btn-sm"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                onClick={() => exportContractsCSV(contracts)}
              >
                <Download size={13} /> Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Revenue Exposure Frame */}
        <div style={{ marginTop: '16px', padding: '12px 16px', background: 'rgba(255,255,255,0.06)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#8FA8C8', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 500 }}>Portfolio Value at Risk</span>
              <span style={{ fontSize: '11px', color: '#8FA8C8', marginLeft: '8px' }}>vs Annual Revenue £{(RIVERGATE_REVENUE / 1e9).toFixed(1)}B</span>
            </div>
            <div style={{ fontSize: '11px', color: '#FFD580' }}>
              Leadership estimate: 1–2% revenue at risk = {formatCurrency(RISK_EXPOSURE_LOW)} – {formatCurrency(RISK_EXPOSURE_HIGH)}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.08)', borderRadius: '6px', height: '14px', overflow: 'hidden', position: 'relative' }}>
              {/* 2% marker */}
              <div style={{ position: 'absolute', left: '2%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.3)', zIndex: 1 }} />
              <div style={{ position: 'absolute', left: '1%', top: 0, bottom: 0, width: '1px', background: 'rgba(255,255,255,0.2)', zIndex: 1 }} />
              <div style={{
                width: `${Math.min((kpis.totalValueAtRisk / RIVERGATE_REVENUE) * 100 * 10, 100)}%`,
                background: exposureBarColor, height: '100%', borderRadius: '6px',
                transition: 'width 0.6s ease',
                minWidth: kpis.totalValueAtRisk > 0 ? '4px' : '0',
              }} />
            </div>
            <div style={{ flexShrink: 0, textAlign: 'right' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: exposureBarColor }}>
                {formatCurrency(kpis.totalValueAtRisk)}
              </div>
              <div style={{ fontSize: '11px', color: '#8FA8C8' }}>{kpis.exposurePct}% of revenue</div>
            </div>
          </div>
          <div style={{ marginTop: '6px', fontSize: '10px', color: '#8FA8C8', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <span>1% marker = {formatCurrency(RISK_EXPOSURE_LOW)}</span>
            <span>·</span>
            <span>2% marker = {formatCurrency(RISK_EXPOSURE_HIGH)}</span>
            <span>·</span>
            <span>Current exposure affects {kpis.critical + kpis.high} contracts</span>
          </div>
        </div>
      </div>

      {/* ── Management KPI Strip ── */}
      <div>
        <SectionTitle icon={Target} title="Operational KPIs" sub="Real-time contract management performance indicators" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
          <KpiTile label="SLA Adherence"        value={`${kpis.slaAdherence}%`}
            sub={`${kpis.slaBreached} contracts breached`}
            color={kpis.slaAdherence >= 80 ? '#107E3E' : kpis.slaAdherence >= 60 ? '#E9730C' : '#BB0000'}
            bg={kpis.slaAdherence >= 80 ? '#E8F5E9' : kpis.slaAdherence >= 60 ? '#FFF3E0' : '#FFEBEE'}
            icon={CheckCircle} borderColor={kpis.slaAdherence >= 80 ? '#107E3E' : '#BB0000'}
          />
          <KpiTile label="Avg Exception Age"    value={`${kpis.avgExceptionAge}d`}
            sub="Days unresolved"
            color={kpis.avgExceptionAge >= 30 ? '#BB0000' : kpis.avgExceptionAge >= 14 ? '#E9730C' : '#107E3E'}
            bg={kpis.avgExceptionAge >= 30 ? '#FFEBEE' : kpis.avgExceptionAge >= 14 ? '#FFF3E0' : '#E8F5E9'}
            icon={Clock} borderColor={kpis.avgExceptionAge >= 30 ? '#BB0000' : '#E9730C'}
          />
          <KpiTile label="First-Pass Yield"
            value={kpis.firstPassYield !== null ? `${kpis.firstPassYield}%` : '—'}
            sub={kpis.firstPassYield !== null ? `${kpis.resolvedCount} resolved` : 'No resolved yet'}
            color="#0070F2" bg="#E8F4FD" icon={Activity} borderColor="#0070F2"
          />
          <KpiTile label="Recurrence Rate"      value={`${kpis.recurrenceRate}%`}
            sub={`${kpis.recurrenceCount} repeat exceptions`}
            color={kpis.recurrenceRate >= 20 ? '#BB0000' : kpis.recurrenceRate >= 10 ? '#E9730C' : '#107E3E'}
            bg={kpis.recurrenceRate >= 20 ? '#FFEBEE' : kpis.recurrenceRate >= 10 ? '#FFF3E0' : '#E8F5E9'}
            icon={RefreshCw} borderColor={kpis.recurrenceRate >= 20 ? '#BB0000' : '#E78C07'}
          />
          <KpiTile label="Compliance Rate"      value={`${kpis.complianceRate}%`}
            sub={`${kpis.compliantCount} of ${kpis.totalActive} compliant`}
            color={kpis.complianceRate >= 80 ? '#107E3E' : kpis.complianceRate >= 60 ? '#E9730C' : '#BB0000'}
            bg={kpis.complianceRate >= 80 ? '#E8F5E9' : kpis.complianceRate >= 60 ? '#FFF3E0' : '#FFEBEE'}
            icon={Shield} borderColor={kpis.complianceRate >= 80 ? '#107E3E' : '#BB0000'}
          />
          <KpiTile label="Service Impact"
            value={`${kpis.criticalServiceImpact + kpis.highServiceImpact}`}
            sub={`${kpis.criticalServiceImpact} Critical · ${kpis.highServiceImpact} High`}
            color={kpis.criticalServiceImpact > 0 ? '#BB0000' : '#E9730C'}
            bg={kpis.criticalServiceImpact > 0 ? '#FFEBEE' : '#FFF3E0'}
            icon={AlertTriangle} borderColor="#BB0000"
          />
          <KpiTile label="Exception Backlog"    value={kpis.totalExceptions}
            sub={`${kpis.totalActive} active contracts`}
            color="#0070F2" bg="#E8F4FD" icon={BarChart2} borderColor="#0070F2"
          />
          <KpiTile label="Overdue Value"
            value={formatCurrency(
              contracts
                .filter(c => c.exceptions.includes('RENEWAL_OVERDUE'))
                .reduce((s, c) => s + (c.amount || 0), 0)
            )}
            sub={`${kpis.overdue} overdue renewal${kpis.overdue !== 1 ? 's' : ''}`}
            color="#BB0000" bg="#FFEBEE" icon={DollarSign} borderColor="#BB0000"
          />
        </div>
      </div>

      {/* ── Expected Business Value ── */}
      <div className="card">
        <div className="card-header">
          <div className="card-header-left">
            <TrendingUp size={14} color="var(--t-secondary)" />
            <span className="card-title">Expected Business Value</span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--t-secondary)' }}>Based on £{(RIVERGATE_REVENUE / 1e9).toFixed(1)}B annual revenue</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            {[
              {
                label:    'Productivity Improvement Target',
                value:    `${Math.round(PRODUCTIVITY_TARGET.low * 100)}–${Math.round(PRODUCTIVITY_TARGET.high * 100)}%`,
                detail:   `Estimated ${productivityLow}–${productivityHigh} staff hours recovered to date`,
                color:    '#107E3E', bg: '#E8F5E9',
              },
              {
                label:    'Ageing Exception Reduction Target',
                value:    `${Math.round(AGEING_TARGET.low * 100)}–${Math.round(AGEING_TARGET.high * 100)}%`,
                detail:   `${kpis.resolvedCount} exceptions resolved · Avg age reduced by workbench adoption`,
                color:    '#0070F2', bg: '#E8F4FD',
              },
              {
                label:    'Revenue at Risk (Leadership Estimate)',
                value:    `${formatCurrency(RISK_EXPOSURE_LOW)} – ${formatCurrency(RISK_EXPOSURE_HIGH)}`,
                detail:   `1–2% of £${(RIVERGATE_REVENUE / 1e9).toFixed(1)}B · Current measured: ${formatCurrency(kpis.totalValueAtRisk)} (${kpis.exposurePct}%)`,
                color:    kpis.totalValueAtRisk > RISK_EXPOSURE_LOW ? '#BB0000' : '#E78C07',
                bg:       kpis.totalValueAtRisk > RISK_EXPOSURE_LOW ? '#FFEBEE' : '#FFFDE7',
              },
              {
                label:    'Working Capital at Risk',
                value:    formatCurrency(contracts.filter(c => c.riskLevel === 'CRITICAL').reduce((s, c) => s + (c.valueExposure || c.amount || 0), 0)),
                detail:   `${kpis.critical} critical contracts · Immediate resolution required`,
                color:    '#BB0000', bg: '#FFEBEE',
              },
            ].map(({ label, value, detail, color, bg }) => (
              <div key={label} style={{ background: bg, borderRadius: '8px', padding: '12px 14px', border: `1px solid ${color}20` }}>
                <div style={{ fontSize: '11px', color: 'var(--t-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color, marginBottom: '4px' }}>{value}</div>
                <div style={{ fontSize: '11px', color: 'var(--t-secondary)', lineHeight: 1.5 }}>{detail}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Analytics Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>

        {/* Exception types */}
        <div className="card">
          <div className="card-header">
            <div className="card-header-left">
              <AlertTriangle size={14} color="var(--t-secondary)" />
              <span className="card-title">Exceptions by Type</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--t-secondary)' }}>{Object.keys(excTypes).length} types active</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topExceptions.length === 0
                ? <div style={{ color: 'var(--t-tertiary)', fontSize: '13px', textAlign: 'center' }}>No exceptions detected</div>
                : topExceptions.map(([type, count]) => (
                  <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '130px', fontSize: '12px', color: 'var(--t-primary)', fontWeight: 500, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {EXC_LABELS[type] || type}
                    </div>
                    <MiniBar value={count} max={maxExc} color={EXC_COLORS[type] || '#0070F2'} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: EXC_COLORS[type] || '#0070F2', width: '18px', textAlign: 'right', flexShrink: 0 }}>{count}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="card">
          <div className="card-header">
            <div className="card-header-left">
              <BarChart2 size={14} color="var(--t-secondary)" />
              <span className="card-title">Contracts by Category</span>
            </div>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topCategories.map(([cat, count]) => (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '130px', fontSize: '12px', color: 'var(--t-primary)', fontWeight: 500, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {cat}
                  </div>
                  <MiniBar value={count} max={maxCat} color="#0B6FAD" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0B6FAD', width: '18px', textAlign: 'right', flexShrink: 0 }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Upcoming Expirations Table ── */}
      <div className="card">
        <div className="card-header">
          <div className="card-header-left">
            <Clock size={14} color="var(--t-secondary)" />
            <span className="card-title">Upcoming Expirations — Next 90 Days</span>
          </div>
          {user?.permissions?.includes('EXPORT') && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => exportContractsCSV(upcoming)}
            >
              <Download size={12} /> Export
            </button>
          )}
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--c-bg)', borderBottom: '1px solid var(--bd-default)' }}>
                {['ID', 'Title', 'Vendor', 'Value', 'Expiry', 'SLA', 'Risk'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontWeight: 600, color: 'var(--t-secondary)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {upcoming.map((c, i) => {
                const d = daysUntilExpiry(c.expiryDate);
                const exColor = d <= 7 ? '#BB0000' : d <= 14 ? '#E9730C' : d <= 30 ? '#E78C07' : '#556B82';
                const slaTarget = { CRITICAL: 2, HIGH: 5, MEDIUM: 10, LOW: 30 }[c.riskLevel] || 30;
                const slaOk = (c.aging || 0) <= slaTarget;
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--bd-default)', background: i % 2 === 0 ? 'transparent' : 'var(--c-bg)' }}>
                    <td style={{ padding: '8px 12px', fontFamily: 'var(--font-mono)', color: 'var(--t-secondary)', fontSize: '11px' }}>{c.id}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 500, color: 'var(--t-primary)', maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</td>
                    <td style={{ padding: '8px 12px', color: 'var(--t-secondary)', whiteSpace: 'nowrap' }}>{c.businessPartner}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600, color: 'var(--t-primary)', whiteSpace: 'nowrap' }}>{formatCurrency(c.amount, c.currency)}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 700, color: exColor, whiteSpace: 'nowrap' }}>{d}d · {c.expiryDate}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: slaOk ? '#107E3E' : '#BB0000', background: slaOk ? '#E8F5E9' : '#FFEBEE', padding: '2px 6px', borderRadius: '4px' }}>
                        {slaOk ? `OK (${slaTarget}d)` : `Breached`}
                      </span>
                    </td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{
                        fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px',
                        color: c.riskLevel === 'CRITICAL' ? '#BB0000' : c.riskLevel === 'HIGH' ? '#E9730C' : c.riskLevel === 'MEDIUM' ? '#E78C07' : '#107E3E',
                        background: c.riskLevel === 'CRITICAL' ? '#FFEBEE' : c.riskLevel === 'HIGH' ? '#FFF3E0' : c.riskLevel === 'MEDIUM' ? '#FFFDE7' : '#E8F5E9',
                      }}>{c.riskLevel}</span>
                    </td>
                  </tr>
                );
              })}
              {upcoming.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--t-tertiary)' }}>No contracts expiring in the next 90 days</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── System footer ── */}
      <div style={{ fontSize: '11px', color: 'var(--t-tertiary)', textAlign: 'center', paddingBottom: '8px' }}>
        Rivergate Water Services · Contract Management Workbench · SAP S/4HANA + SAP Ariba ·
        Source to Pay › Contract Lifecycle · v1.0.0
      </div>
    </div>
  );
}
