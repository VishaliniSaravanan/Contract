import React from 'react';
import { Bell, LogOut, FileText, BarChart2, Settings, Droplets } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useContracts } from '../../context/ContractContext';
import { computeKPIs } from '../../utils/contractUtils';

const PERSONA_COLORS = {
  CONTRACT_OPS_MANAGER: '#0070F2',
  CONTRACT_OWNER:        '#107E3E',
  PROCUREMENT_MANAGER:   '#E9730C',
  LEGAL_COMPLIANCE:      '#7B1FA2',
  APPROVER:              '#C2185B',
};

export default function Header({ activeView, setActiveView }) {
  const { user, logout }  = useAuth();
  const { contracts }     = useContracts();
  const kpis              = computeKPIs(contracts);
  const criticalCount     = kpis.critical;
  const avatarColor       = PERSONA_COLORS[user?.role] || '#0070F2';

  const navItems = [
    { key: 'workbench',  label: 'Exception Workbench', icon: FileText },
    { key: 'analytics',  label: 'Executive Dashboard',  icon: BarChart2 },
    { key: 'settings',   label: 'Settings',             icon: Settings },
  ];

  return (
    <header className="shell-header">
      {/* Rivergate brand */}
      <div className="shell-logo">
        <div className="shell-logo-icon" style={{ background: '#0B6FAD', fontSize: '11px' }}>
          <Droplets size={14} color="white" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>Rivergate Water</span>
          <span style={{ fontSize: '10px', color: '#8FA8C8', fontWeight: 400 }}>
            Source to Pay <span style={{ color: '#0070F2' }}>›</span> Contract Lifecycle
          </span>
        </div>
        <div className="shell-divider" />
        <span style={{ fontSize: '12px', color: '#8FA8C8', fontWeight: 500 }} className="hide-mobile">
          Exception Workbench
        </span>
      </div>

      {/* Desktop Nav */}
      <nav className="shell-nav hide-mobile">
        {navItems.map((item) => (
          <button
            key={item.key}
            className={`shell-nav-item${activeView === item.key ? ' active' : ''}`}
            onClick={() => setActiveView(item.key)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Right Controls */}
      <div className="shell-right">
        <button className="shell-bell-btn" title={`${criticalCount} critical alerts`} aria-label="Notifications">
          <Bell size={16} />
          {criticalCount > 0 && (
            <span className="shell-badge" style={{ position: 'absolute', top: 2, right: 2, fontSize: '9px', padding: '1px 4px' }}>
              {criticalCount}
            </span>
          )}
        </button>

        <div className="user-chip" title={`${user?.roleLabel} · Rivergate Water Services`}>
          <div className="user-avatar" style={{ background: avatarColor }}>{user?.avatar}</div>
          <span className="user-chip-name">{user?.name?.split(' ')[0]}</span>
        </div>

        <button className="logout-btn" onClick={logout} title="Sign out" aria-label="Sign out">
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}
