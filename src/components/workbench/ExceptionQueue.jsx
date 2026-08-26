import React from 'react';
import { Search, Filter } from 'lucide-react';
import { useContracts } from '../../context/ContractContext';
import { useAuth } from '../../context/AuthContext';
import { RiskBadge, ExceptionBadge } from '../shared/StatusBadge';
import {
  formatCurrency,
  expiryLabel,
  getRiskColor,
} from '../../utils/contractUtils';

const RISK_FILTERS = [
  { key: 'ALL',      label: 'All' },
  { key: 'CRITICAL', label: 'Critical', className: 'critical' },
  { key: 'HIGH',     label: 'High',     className: 'high' },
  { key: 'MEDIUM',   label: 'Medium',   className: 'medium' },
  { key: 'LOW',      label: 'Low',      className: 'low' },
];

const EXCEPTION_FILTERS = [
  { key: 'ALL',              label: 'All Exceptions' },
  { key: 'EXPIRY_CRITICAL',  label: 'Expiry Critical' },
  { key: 'RENEWAL_OVERDUE',  label: 'Renewal Overdue' },
  { key: 'AWAITING_APPROVAL',label: 'Awaiting Approval' },
  { key: 'OBLIGATION_BREACH',label: 'Obligation Breach' },
  { key: 'COMPLIANCE_GAP',   label: 'Compliance Gap' },
];

export default function ExceptionQueue() {
  const { user } = useAuth();
  const {
    filteredContracts,
    selectedId,
    setSelectedId,
    riskFilter,
    setRiskFilter,
    exceptionFilter,
    setExceptionFilter,
    searchTerm,
    setSearchTerm,
  } = useContracts();

  const items = filteredContracts(user);
  const activeExcItems = items.filter(c => c.status !== 'RESOLVED');

  return (
    <div className="exception-queue">
      {/* Filter Bar */}
      <div style={{
        padding: '8px 12px',
        borderBottom: '1px solid var(--bd-default)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        background: 'var(--c-surface)',
        flexShrink: 0,
      }}>
        {/* Search */}
        <div className="filter-search" style={{ width: '100%' }}>
          <Search size={13} color="var(--t-tertiary)" />
          <input
            type="text"
            placeholder="Search contracts, vendors…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search contracts"
          />
        </div>
        {/* Risk filter chips */}
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
          <Filter size={11} color="var(--t-tertiary)" />
          {RISK_FILTERS.map(f => (
            <button
              key={f.key}
              className={`filter-chip${riskFilter === f.key ? ` active${f.className ? ` ${f.className}` : ''}` : ''}${f.className ? ` ${f.className}` : ''}`}
              onClick={() => setRiskFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Header */}
      <div className="queue-header">
        <span className="queue-header-label">Priority Queue</span>
        <span className="queue-header-count">{activeExcItems.length}</span>
      </div>

      {/* Queue List */}
      <div className="queue-list">
        {items.length === 0 ? (
          <div className="queue-empty">
            <div className="queue-empty-icon">
              <Filter size={32} />
            </div>
            <div className="queue-empty-title">No contracts found</div>
            <div className="queue-empty-text">
              Adjust filters or search to find contracts
            </div>
          </div>
        ) : (
          items.map((contract) => {
            const expiry = expiryLabel(contract.expiryDate);
            const isSelected = selectedId === contract.id;
            const riskColor = getRiskColor(contract.riskLevel);
            const isResolved = contract.status === 'RESOLVED';

            return (
              <div
                key={contract.id}
                className={`queue-item${isSelected ? ' selected' : ''}`}
                onClick={() => setSelectedId(contract.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedId(contract.id)}
                aria-pressed={isSelected}
                style={{ opacity: isResolved ? 0.55 : 1 }}
              >
                {/* Risk strip */}
                <div
                  className="queue-item-risk"
                  style={{ background: isResolved ? '#107E3E' : riskColor }}
                />

                <div className="queue-item-body">
                  <div className="queue-item-top">
                    <span className="queue-item-id">{contract.id}</span>
                    <RiskBadge level={isResolved ? 'LOW' : contract.riskLevel} />
                  </div>
                  <div className="queue-item-title">{contract.title}</div>
                  <div className="queue-item-vendor">{contract.businessPartner}</div>

                  {/* Exception badges */}
                  {!isResolved && contract.exceptions.length > 0 && (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <ExceptionBadge type={contract.primaryException} />
                      {contract.exceptions.length > 1 && (
                        <span style={{
                          fontSize: '10px', color: 'var(--t-secondary)',
                          background: 'var(--c-bg)', border: '1px solid var(--bd-default)',
                          borderRadius: '10px', padding: '2px 6px', fontWeight: 600,
                        }}>
                          +{contract.exceptions.length - 1} more
                        </span>
                      )}
                    </div>
                  )}
                  {isResolved && (
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '11px', color: '#107E3E',
                        background: '#E8F5E9', border: '1px solid #A5D6A7',
                        borderRadius: '10px', padding: '2px 8px', fontWeight: 600,
                      }}>
                        Resolved
                      </span>
                    </div>
                  )}

                  <div className="queue-item-meta">
                    <span className="queue-item-amount">
                      {formatCurrency(contract.amount, contract.currency)}
                    </span>
                    <span
                      className="queue-item-expiry"
                      style={{ color: expiry.color }}
                    >
                      {expiry.text}
                    </span>
                    <span
                      className="queue-item-priority"
                      style={{
                        color: contract.priorityScore >= 70 ? '#BB0000'
                             : contract.priorityScore >= 40 ? '#E9730C'
                             : 'var(--t-tertiary)',
                      }}
                    >
                      P{contract.priorityScore}
                    </span>
                  </div>

                  {/* Owner line */}
                  <div style={{
                    fontSize: '11px',
                    color: contract.ownerName ? 'var(--t-secondary)' : '#BB0000',
                    marginTop: '3px',
                    fontWeight: contract.ownerName ? 400 : 600,
                  }}>
                    {contract.assignedTo || contract.ownerName
                      ? `Owner: ${contract.ownerName}`
                      : 'Unassigned — action required'}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
