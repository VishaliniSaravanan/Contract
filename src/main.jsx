import React from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { ContractProvider } from './context/ContractContext';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ContractProvider>
        <App />
      </ContractProvider>
    </AuthProvider>
  </React.StrictMode>
);
