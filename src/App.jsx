import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useContracts } from './context/ContractContext';
import LoginScreen from './components/auth/LoginScreen';
import Header from './components/layout/Header';
import KPICards from './components/dashboard/KPICards';
import WorkbenchView from './components/workbench/WorkbenchView';
import AnalyticsView from './components/dashboard/AnalyticsView';
import './styles.css';

function SettingsView() {
  return (
    <div style={{ padding: '24px', flex: 1, overflow: 'auto' }}>
      <div className="card" style={{ maxWidth: '600px' }}>
        <div className="card-header">
          <span className="card-title">Application Settings</span>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
    { label: 'SAP S/4HANA (Source System)',  value: 'S/4HANA 2023 · MM/FI · Contract Management · OData V4', status: 'ok' },
            { label: 'SAP Ariba Contracts',          value: 'Ariba Contracts · JSON Integration · Tenant: rw-prod-1400', status: 'ok' },
            { label: 'SAP BTP Environment',          value: 'Cloud Foundry · eu10 · Rivergate Subaccount · Active',      status: 'ok' },
            { label: 'Identity Authentication',      value: 'SAP IAS · SSO · rivergatewater.co.uk domain',               status: 'ok' },
            { label: 'Exception Detection Engine',   value: 'Rule Engine v2.1 · 10 exception types · Running',           status: 'ok' },
            { label: 'AI Decision Engine',           value: 'Insight Engine v1.4 · 4-factor transparent risk model',     status: 'ok' },
            { label: 'Notification Service',         value: 'SAP Alert Notification · Email + In-App · Enabled',         status: 'ok' },
            { label: 'Process Alignment',            value: 'Signavio: Source to Pay › Contract Lifecycle',              status: 'info' },
            { label: 'Data Source',                  value: 'Mock JSON · contracts.json (14 Rivergate records)',         status: 'info' },
          ].map(({ label, value, status }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--c-bg)', borderRadius: '6px', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--t-primary)' }}>{label}</div>
                <div style={{ fontSize: '12px', color: 'var(--t-secondary)', marginTop: '2px' }}>{value}</div>
              </div>
              <span style={{
                fontSize: '11px', fontWeight: 700,
                color: status === 'ok' ? '#107E3E' : '#0070F2',
                background: status === 'ok' ? '#E8F5E9' : '#E8F4FD',
                padding: '2px 8px', borderRadius: '10px',
              }}>
                {status === 'ok' ? 'Active' : 'Info'}
              </span>
            </div>
          ))}
          <div style={{ fontSize: '12px', color: 'var(--t-tertiary)', borderTop: '1px solid var(--bd-default)', paddingTop: '12px' }}>
            Rivergate Water Services · Contract Management · Exception Workbench · v1.0.0<br />
            SAP S/4HANA · SAP BTP Cloud Foundry · CAP Node.js · SAP HANA Cloud · OData V4<br />
            Source to Pay › Contract Lifecycle · Signavio Process Aligned
          </div>
        </div>
      </div>
    </div>
  );
}

function MainApp() {
  const [activeView, setActiveView] = useState('workbench');

  return (
    <>
      <Header activeView={activeView} setActiveView={setActiveView} />
      <div className="page-content">
        {activeView !== 'settings' && <KPICards />}
        {activeView === 'workbench'  && <WorkbenchView />}
        {activeView === 'analytics' && <AnalyticsView />}
        {activeView === 'settings'  && <SettingsView />}
      </div>
    </>
  );
}

export default function App() {
  const { user } = useAuth();
  return user ? <MainApp /> : <LoginScreen />;
}
