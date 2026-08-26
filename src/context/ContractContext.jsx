import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import rawContracts from '../data/contracts.json';
import {
  filterContracts,
  sortByPriority,
  calcPriorityScore,
  createAuditEntry,
  STATUS_LABELS,
} from '../utils/contractUtils';

const ContractContext = createContext(null);

export function ContractProvider({ children }) {
  const [contracts, setContracts] = useState(() =>
    rawContracts.map(c => ({ ...c, priorityScore: calcPriorityScore(c) }))
  );
  const [selectedId, setSelectedId] = useState(null);
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [exceptionFilter, setExceptionFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionModal, setActionModal] = useState(null); // { type, contract }
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = useCallback((msg, variant = 'success') => {
    setToastMsg({ msg, variant });
    setTimeout(() => setToastMsg(null), 3500);
  }, []);

  // Filter + sort for queue display
  const filteredContracts = useCallback(
    (user) =>
      filterContracts(contracts, {
        riskFilter,
        exceptionFilter,
        searchTerm,
        userRole: user?.role,
        userEmail: user?.email,
      }),
    [contracts, riskFilter, exceptionFilter, searchTerm]
  );

  const selectedContract = useMemo(
    () => contracts.find(c => c.id === selectedId) || null,
    [contracts, selectedId]
  );

  // ── Actions ──────────────────────────────────────────────────

  const performAction = useCallback((actionKey, contract, user, payload = {}) => {
    let statusUpdate = {};
    let auditNote = '';
    let exceptionUpdate = null;

    switch (actionKey) {
      case 'MONITOR':
        auditNote = `Contract placed under active monitoring. ${payload.note || ''}`.trim();
        statusUpdate = {};
        break;

      case 'ASSIGN':
        auditNote = `Owner assigned to ${payload.assignee}. ${payload.note || ''}`.trim();
        statusUpdate = { assignedTo: payload.assigneeEmail || payload.assignee, ownerName: payload.assignee };
        break;

      case 'ESCALATE':
        auditNote = `Escalated to ${payload.escalateTo || 'management'}. Reason: ${payload.reason || 'Urgent exception requires senior action'}. ${payload.note || ''}`.trim();
        statusUpdate = { status: 'ESCALATED' };
        break;

      case 'RENEW':
        auditNote = `Renewal action initiated. ${payload.note || 'SAP Ariba renewal workflow started.'}`.trim();
        statusUpdate = { status: 'RENEWAL_DUE' };
        exceptionUpdate = (excs) => {
          const updated = excs.filter(e => !['RENEWAL_OVERDUE', 'RENEWAL_DUE'].includes(e));
          return updated;
        };
        break;

      case 'RESOLVE': {
        auditNote = `Exception resolved. Resolution: ${payload.resolution || 'Action completed successfully.'}`;
        statusUpdate = { status: 'RESOLVED' };
        exceptionUpdate = () => [];
        break;
      }

      default:
        return;
    }

    const entry = createAuditEntry(
      actionKey === 'MONITOR'   ? 'Monitoring Set'    :
      actionKey === 'ASSIGN'    ? 'Owner Assigned'    :
      actionKey === 'ESCALATE'  ? 'Escalated'         :
      actionKey === 'RENEW'     ? 'Renewal Initiated' :
      'Resolved',
      user,
      auditNote
    );

    setContracts(prev =>
      prev.map(c => {
        if (c.id !== contract.id) return c;
        const updatedExceptions = exceptionUpdate
          ? exceptionUpdate(c.exceptions)
          : c.exceptions;
        const updated = {
          ...c,
          ...statusUpdate,
          exceptions: updatedExceptions,
          auditTrail: [...c.auditTrail, entry],
          priorityScore: calcPriorityScore({ ...c, ...statusUpdate }),
        };
        return updated;
      })
    );

    showToast(
      actionKey === 'MONITOR'  ? `Monitoring enabled for ${contract.id}` :
      actionKey === 'ASSIGN'   ? `Owner assigned: ${payload.assignee}` :
      actionKey === 'ESCALATE' ? `${contract.id} escalated successfully` :
      actionKey === 'RENEW'    ? `Renewal initiated for ${contract.id}` :
      `${contract.id} resolved`,
      actionKey === 'ESCALATE' ? 'warning' : 'success'
    );

    setActionModal(null);
  }, [showToast]);

  return (
    <ContractContext.Provider value={{
      contracts,
      filteredContracts,
      selectedContract,
      selectedId,
      setSelectedId,
      riskFilter,
      setRiskFilter,
      exceptionFilter,
      setExceptionFilter,
      searchTerm,
      setSearchTerm,
      actionModal,
      setActionModal,
      performAction,
      toastMsg,
      showToast,
    }}>
      {children}
    </ContractContext.Provider>
  );
}

export function useContracts() {
  const ctx = useContext(ContractContext);
  if (!ctx) throw new Error('useContracts must be used within ContractProvider');
  return ctx;
}
