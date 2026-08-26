import React from 'react';
import { ConfigProvider, Layout, theme } from 'antd';
import { AttendanceProvider, useAttendance } from './context/AttendanceContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import './App.css';

const { Content } = Layout;

// View Router based on Auth State
const MainView = () => {
  const { currentUser } = useAttendance();

  if (!currentUser) {
    return <Login />;
  }

  if (currentUser.role === 'admin') {
    return <AdminDashboard />;
  }

  return <EmployeeDashboard />;
};

const AppWithTheme = () => {
  const { isDarkMode } = useAttendance();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#6366f1',
          colorPrimaryHover: '#4f46e5',
          colorPrimaryActive: '#4338ca',
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          colorInfo: '#3b82f6',
          // Neutral Dark Shades (True Dark - No Blue Tint)
          colorBgBase: isDarkMode ? '#09090b' : '#ffffff',
          colorBgContainer: isDarkMode ? '#141416' : '#ffffff',
          colorBgElevated: isDarkMode ? '#1a1a1e' : '#ffffff',
          colorBgLayout: isDarkMode ? '#09090b' : '#f8fafc',
          colorText: isDarkMode ? '#f4f4f5' : '#0f172a',
          colorTextSecondary: isDarkMode ? '#a1a1aa' : '#64748b',
          colorBorder: isDarkMode ? '#27272a' : '#e2e8f0',
          colorBorderSecondary: isDarkMode ? '#222226' : '#edf2f7',
          borderRadius: 8,
          borderRadiusLG: 12,
          borderRadiusSM: 6,
          fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        },
        components: {
          Button: {
            controlHeight: 40,
            controlHeightLG: 46,
            fontWeight: 600
          },
          Card: {
            headerFontSize: 16,
            headerHeight: 48
          },
          Table: {
            headerBg: isDarkMode ? '#1a1a1e' : '#f8fafc',
            headerColor: isDarkMode ? '#f4f4f5' : '#475569',
            rowHoverBg: isDarkMode ? '#222226' : '#f1f5f9',
            borderColor: isDarkMode ? '#222226' : '#f1f5f9'
          }
        }
      }}
    >
      <Layout style={{ minHeight: '100vh', background: isDarkMode ? '#09090b' : '#f8fafc' }}>
        <Navbar />
        <Content style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
          <MainView />
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export function App() {
  return (
    <AttendanceProvider>
      <AppWithTheme />
    </AttendanceProvider>
  );
}

export default App;
