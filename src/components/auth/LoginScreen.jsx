import React, { useState } from 'react';
import { FileText, Check, Shield, Briefcase, CheckSquare, User, Droplets } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import usersData from '../../data/users.json';

const PERSONA_COLORS = {
  CONTRACT_OPS_MANAGER: { bg: '#E8F4FD', color: '#0070F2', avBg: '#0070F2' },
  CONTRACT_OWNER:        { bg: '#E8F5E9', color: '#107E3E', avBg: '#107E3E' },
  PROCUREMENT_MANAGER:   { bg: '#FFF3E0', color: '#E9730C', avBg: '#E9730C' },
  LEGAL_COMPLIANCE:      { bg: '#EDE7F6', color: '#4527A0', avBg: '#7B1FA2' },
  APPROVER:              { bg: '#FCE4EC', color: '#880E4F', avBg: '#C2185B' },
};

const PERSONA_ICONS = {
  CONTRACT_OPS_MANAGER: FileText,
  CONTRACT_OWNER:        User,
  PROCUREMENT_MANAGER:   Briefcase,
  LEGAL_COMPLIANCE:      Shield,
  APPROVER:              CheckSquare,
};

export default function LoginScreen() {
  const { login, error } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);

  const handleLogin = () => { if (selectedUser) login(selectedUser.id); };

  return (
    <div className="login-page">
      <div className="login-bg-pattern" />
      <div className="login-container">
        <div className="login-card">

          {/* Top branding */}
          <div className="login-top">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px' }}>
              <div className="login-logo" style={{ background: '#0B6FAD', margin: 0 }}>
                <Droplets size={22} color="white" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div className="login-app-name" style={{ fontSize: '16px', lineHeight: 1.2 }}>Rivergate Water Services</div>
                <div style={{ fontSize: '11px', color: '#8FA8C8', fontWeight: 400 }}>United Kingdom</div>
              </div>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '0 0 12px' }} />

            <div className="login-app-name" style={{ fontSize: '15px', fontWeight: 700, marginBottom: '2px' }}>
              Contract Management Workbench
            </div>
            <div className="login-app-sub">
              Obligation &amp; Renewal Exception Workbench
            </div>

            {/* Process breadcrumb */}
            <div style={{
              marginTop: '10px', marginBottom: '4px',
              fontSize: '11px', color: '#8FA8C8',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}>
              <span>Source to Pay</span>
              <span style={{ color: '#0070F2' }}>›</span>
              <span style={{ color: '#64B5F6', fontWeight: 600 }}>Contract Lifecycle</span>
              <span style={{ color: '#0070F2' }}>›</span>
              <span>Exception Workbench</span>
            </div>

            {/* Tech badges */}
            <div style={{ marginTop: '12px', display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <span className="sap-badge" style={{ background: '#1A2A4A', color: '#90CAF9' }}>SAP S/4HANA</span>
              <span className="sap-badge ariba">SAP Ariba</span>
              <span className="sap-badge">SAP BTP</span>
              <span className="sap-badge" style={{ background: '#1A3D1A', color: '#81C784' }}>CAP Node.js</span>
            </div>
          </div>

          {/* Persona Selection */}
          <div className="login-body">
            <div className="login-section-title">Select your role to continue</div>
            <div className="persona-grid">
              {usersData.map((u) => {
                const palette = PERSONA_COLORS[u.role] || PERSONA_COLORS.CONTRACT_OWNER;
                const Icon    = PERSONA_ICONS[u.role] || User;
                const isSelected = selectedUser?.id === u.id;
                return (
                  <div
                    key={u.id}
                    className={`persona-card${isSelected ? ' selected' : ''}`}
                    onClick={() => setSelectedUser(u)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedUser(u)}
                    aria-pressed={isSelected}
                  >
                    <div className="persona-avatar" style={{ background: palette.avBg, color: 'white' }}>
                      {u.avatar}
                    </div>
                    <div className="persona-info">
                      <div className="persona-name">{u.name}</div>
                      <div className="persona-role" style={{ color: palette.color }}>{u.roleLabel}</div>
                      <div className="persona-dept">{u.department}</div>
                    </div>
                    <div className="persona-check">
                      {isSelected && <Check size={10} color="white" strokeWidth={3} />}
                    </div>
                  </div>
                );
              })}
            </div>

            {error && (
              <div style={{
                background: '#FFEBEE', color: '#BB0000', borderRadius: '6px',
                padding: '10px 12px', fontSize: '13px', fontWeight: 500, marginBottom: '12px',
              }}>
                {error}
              </div>
            )}

            <button className="login-btn" disabled={!selectedUser} onClick={handleLogin}>
              {selectedUser ? `Sign in as ${selectedUser.name}` : 'Select a role to continue'}
            </button>
            <p className="login-disclaimer">
              Demo environment · Rivergate Water Services · No real credentials required<br />
              SAP Identity Authentication Service simulation active
            </p>
          </div>

          <div className="login-footer">
            <span className="login-footer-text">Signavio Process:</span>
            <span className="sap-badge ariba">Source to Pay</span>
            <span style={{ fontSize: '10px', color: '#9BA8B4' }}>›</span>
            <span className="sap-badge" style={{ background: '#1A2A4A', color: '#90CAF9' }}>Contract Lifecycle</span>
          </div>
        </div>
      </div>
    </div>
  );
}
