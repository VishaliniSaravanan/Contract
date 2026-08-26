import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useContracts } from '../../context/ContractContext';
import ExceptionQueue from '../workbench/ExceptionQueue';
import ContractDetail from '../workbench/ContractDetail';
import { AlertTriangle, Info, CheckCircle, Shield, Briefcase, User } from 'lucide-react';
import { computeKPIs, formatCurrency } from '../../utils/contractUtils';

const ROLE_MESSAGES = {
  CONTRACT_OWNER: {
    icon: User,
    color: '#107E3E',
    bg: '#E8F5E9',
    message: 'Viewing your contracts only. Use the queue to review and initiate renewal actions on contracts you own.',
  },
  PROCUREMENT_MANAGER: {
    icon: Briefcase,
    color: '#E9730C',
    bg: '#FFF3E0',
    message: 'Procurement Manager view. You can assign owners and approve renewals across all contracts.',
  },
  LEGAL_COMPLIANCE: {
    icon: Shield,
    color: '#7B1FA2',
    bg: '#EDE7F6',
    message: 'Legal Compliance view. Focus on compliance gaps and contracts requiring legal review.',
  },
  APPROVER: {
    icon: CheckCircle,
    color: '#C2185B',
    bg: '#FCE4EC',
    message: 'Approver view. Showing contracts awaiting your approval only.',
  },
};

export default function WorkbenchView() {
  const { user } = useAuth();
  const { selectedContract, contracts, toastMsg } = useContracts();
  const kpis = computeKPIs(contracts);
  const roleBanner = ROLE_MESSAGES[user?.role];

  // "What to do today" banner for ops manager
  const showManagerBriefing = user?.role === 'CONTRACT_OPS_MANAGER';

  return (
    <div className="workbench">
      {/* Role context banner (non-manager) */}
      {roleBanner && (
        <div className="role-banner" style={{ background: roleBanner.bg, borderColor: `${roleBanner.color}30` }}>
          <roleBanner.icon size={14} color={roleBanner.color} />
          <span className="role-banner-text" style={{ color: roleBanner.color }}>
            {roleBanner.message}
          </span>
        </div>
      )}

      {/* Manager Morning Briefing */}
      {showManagerBriefing && (kpis.critical > 0 || kpis.overdue > 0) && (
        <div className="alert-banner critical">
          <AlertTriangle size={14} color="#BB0000" />
          <span className="alert-banner-text">
            <strong>{kpis.critical} critical contract{kpis.critical !== 1 ? 's' : ''} require immediate action</strong>
            {kpis.overdue > 0 && ` · ${kpis.overdue} renewal${kpis.overdue !== 1 ? 's' : ''} overdue`}
            {kpis.totalValueAtRisk > 0 && ` · ${formatCurrency(kpis.totalValueAtRisk, 'GBP')} value at risk`}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#BB0000', fontWeight: 600 }}>
            Priority queue sorted below
          </span>
        </div>
      )}

      {/* Main split panel */}
      <div className="workbench-body">
        <ExceptionQueue />
        <ContractDetail contract={selectedContract} />
      </div>

      {/* Toast */}
      {toastMsg && (
        <div className="toast-container">
          <div className={`toast ${toastMsg.variant}`}>
            {toastMsg.variant === 'success'  && <CheckCircle size={14} color="#81C784" />}
            {toastMsg.variant === 'warning'  && <AlertTriangle size={14} color="#FFD54F" />}
            {toastMsg.variant === 'error'    && <AlertTriangle size={14} color="#EF9A9A" />}
            {toastMsg.msg}
          </div>
        </div>
      )}
    </div>
  );
}
