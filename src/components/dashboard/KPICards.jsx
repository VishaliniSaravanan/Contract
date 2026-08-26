import React from 'react';
import { AlertTriangle, Clock, TrendingUp, CheckCircle, Shield } from 'lucide-react';
import { computeKPIs, formatCurrency, RIVERGATE_REVENUE, RISK_EXPOSURE_HIGH } from '../../utils/contractUtils';
import { useContracts } from '../../context/ContractContext';

export default function KPICards() {
  const { contracts } = useContracts();
  const kpis = computeKPIs(contracts);

  // Exposure % of the 2% leadership benchmark
  const exposureVsBenchmark = Math.min(
    Math.round((kpis.totalValueAtRisk / RISK_EXPOSURE_HIGH) * 100), 100
  );
  const exposureColor = exposureVsBenchmark >= 80 ? '#BB0000'
                      : exposureVsBenchmark >= 50 ? '#E9730C'
                      : '#E78C07';

  const cards = [
    {
      key: 'critical', variant: 'critical',
      label:   'Critical & High Risk',
      value:   `${kpis.critical + kpis.high}`,
      sub:     `${kpis.critical} Critical  ·  ${kpis.high} High`,
      icon: AlertTriangle, iconBg: '#FFEBEE', iconClr: '#BB0000',
    },
    {
      key: 'expiring', variant: 'high',
      label:   'Expiring ≤ 30 Days',
      value:   kpis.expiringSoon,
      sub:     `${kpis.overdue} renewal${kpis.overdue !== 1 ? 's' : ''} already overdue`,
      icon: Clock, iconBg: '#FFF3E0', iconClr: '#E9730C',
    },
    {
      key: 'value', variant: 'medium',
      label:   'Portfolio Value at Risk',
      value:   formatCurrency(kpis.totalValueAtRisk, 'GBP'),
      sub:     `${kpis.exposurePct}% of £${(RIVERGATE_REVENUE / 1e9).toFixed(1)}B revenue · ${exposureVsBenchmark}% of 2% benchmark`,
      icon: TrendingUp, iconBg: '#FFFDE7', iconClr: '#E78C07',
      valueColor: exposureColor,
    },
    {
      key: 'sla', variant: 'info',
      label:   'SLA Adherence',
      value:   `${kpis.slaAdherence}%`,
      sub:     `${kpis.slaBreached} breached · ${kpis.complianceRate}% compliant`,
      icon: Shield, iconBg: kpis.slaAdherence >= 80 ? '#E8F5E9' : '#FFF3E0',
      iconClr: kpis.slaAdherence >= 80 ? '#107E3E' : '#E9730C',
      valueColor: kpis.slaAdherence >= 80 ? '#107E3E' : kpis.slaAdherence >= 60 ? '#E9730C' : '#BB0000',
    },
  ];

  return (
    <div className="kpi-strip">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.key} className={`kpi-card ${c.variant}`}>
            <div className="kpi-icon-wrap" style={{ background: c.iconBg }}>
              <Icon size={18} color={c.iconClr} strokeWidth={2} />
            </div>
            <div className="kpi-body">
              <div className="kpi-label">{c.label}</div>
              <div className="kpi-value" style={{ color: c.valueColor || (c.variant === 'critical' ? '#BB0000' : undefined) }}>
                {c.value}
              </div>
              <div className="kpi-sub">{c.sub}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
