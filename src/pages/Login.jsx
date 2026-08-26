import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Alert,
  Tabs,
  message
} from 'antd';
import {
  MailOutlined,
  LockOutlined,
  LoginOutlined,
  ClockCircleOutlined,
  UserOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { useAttendance } from '../context/AttendanceContext';

const { Title, Text } = Typography;

export const Login = () => {
  const [employeeForm] = Form.useForm();
  const [adminForm] = Form.useForm();
  const { login, isDarkMode } = useAttendance();

  const [activeTab, setActiveTab] = useState('employee');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Employee Login Handler
  const handleEmployeeLogin = async (values) => {
    setLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      const res = login(values.emailOrId, values.password);
      setLoading(false);

      if (!res.success) {
        setErrorMessage(res.error);
        message.error(res.error);
      } else if (res.user.role !== 'employee') {
        setErrorMessage('This account is registered as Administrator. Please use the Admin Login tab.');
        message.warning('Please use the Admin Login tab for administrator accounts.');
      } else {
        message.success(res.message || 'Login successful!');
      }
    }, 350);
  };

  // Admin Login Handler
  const handleAdminLogin = async (values) => {
    setLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      const res = login(values.emailOrId, values.password);
      setLoading(false);

      if (!res.success) {
        setErrorMessage(res.error);
        message.error(res.error);
      } else if (res.user.role !== 'admin') {
        setErrorMessage('This account is registered as Employee. Please use the Employee Login tab.');
        message.warning('Please use the Employee Login tab for employee accounts.');
      } else {
        message.success(res.message || 'Admin login successful!');
      }
    }, 350);
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 16px',
        background: isDarkMode ? '#09090b' : 'radial-gradient(ellipse at top, #eef2ff 0%, #f8fafc 60%, #f1f5f9 100%)'
      }}
    >
      <div style={{ width: '100%', maxWidth: '460px' }} className="animate-fade-in">
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '28px',
              boxShadow: '0 10px 20px -3px rgba(99, 102, 241, 0.4)',
              marginBottom: '12px'
            }}
          >
            <ClockCircleOutlined />
          </div>
          <Title
            level={2}
            style={{
              margin: 0,
              fontWeight: 800,
              color: isDarkMode ? '#f4f4f5' : '#0f172a',
              letterSpacing: '-0.5px'
            }}
          >
            Attendance <span style={{ color: '#6366f1' }}>Application</span>
          </Title>
          <Text style={{ fontSize: '14px', color: isDarkMode ? '#a1a1aa' : '#64748b' }}>
            Attendance Management Portal
          </Text>
        </div>

        {/* Login Card */}
        <Card
          style={{
            borderRadius: '16px',
            background: isDarkMode ? '#141416' : '#ffffff',
            boxShadow: isDarkMode
              ? '0 20px 25px -5px rgba(0, 0, 0, 0.7), 0 8px 10px -6px rgba(0, 0, 0, 0.6)'
              : '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
            border: isDarkMode ? '1px solid #27272a' : '1px solid #e2e8f0',
            overflow: 'hidden'
          }}
          styles={{ body: { padding: '24px 28px' } }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={(key) => {
              setActiveTab(key);
              setErrorMessage(null);
            }}
            centered
            size="large"
            items={[
              {
                key: 'employee',
                label: (
                  <span style={{ fontWeight: 600, fontSize: '15px' }}>
                    <UserOutlined /> Employee Login
                  </span>
                )
              },
              {
                key: 'admin',
                label: (
                  <span style={{ fontWeight: 600, fontSize: '15px' }}>
                    <SafetyCertificateOutlined /> Admin Login
                  </span>
                )
              }
            ]}
          />

          {errorMessage && (
            <Alert
              type="error"
              message={errorMessage}
              showIcon
              closable
              onClose={() => setErrorMessage(null)}
              style={{ margin: '16px 0', borderRadius: '8px' }}
            />
          )}

          {/* TAB 1: EMPLOYEE LOGIN */}
          {activeTab === 'employee' && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <Title level={4} style={{ margin: 0, fontWeight: 700, color: isDarkMode ? '#f4f4f5' : '#1e293b' }}>
                  Employee Login
                </Title>
              </div>

              <Form
                form={employeeForm}
                layout="vertical"
                onFinish={handleEmployeeLogin}
                requiredMark={false}
              >
                <Form.Item
                  name="emailOrId"
                  label={<span style={{ fontWeight: 600, fontSize: '13px', color: isDarkMode ? '#e4e4e7' : '#334155' }}>Employee Email / ID</span>}
                  rules={[
                    { required: true, message: 'Please enter your employee email or ID' },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                        const isId = /^[a-zA-Z0-9_-]{3,20}$/.test(value);
                        if (!isEmail && !isId) {
                          return Promise.reject(new Error('Enter a valid email or employee ID format'));
                        }
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined style={{ color: isDarkMode ? '#71717a' : '#94a3b8' }} />}
                    placeholder="e.g. alex@company.com or EMP101"
                    size="large"
                    id="employee-email-input"
                    style={{
                      borderRadius: '8px',
                      background: isDarkMode ? '#1a1a1e' : '#ffffff',
                      border: isDarkMode ? '1px solid #2e2e34' : '1px solid #d9d9d9'
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={<span style={{ fontWeight: 600, fontSize: '13px', color: isDarkMode ? '#e4e4e7' : '#334155' }}>Password</span>}
                  rules={[
                    { required: true, message: 'Please enter your password' },
                    { min: 6, message: 'Password must be at least 6 characters' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: isDarkMode ? '#71717a' : '#94a3b8' }} />}
                    placeholder="Enter password (min 6 characters)"
                    size="large"
                    id="employee-password-input"
                    style={{
                      borderRadius: '8px',
                      background: isDarkMode ? '#1a1a1e' : '#ffffff',
                      border: isDarkMode ? '1px solid #2e2e34' : '1px solid #d9d9d9'
                    }}
                  />
                </Form.Item>

                <Form.Item style={{ marginTop: '24px', marginBottom: '8px' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    loading={loading}
                    icon={<LoginOutlined />}
                    id="employee-login-btn"
                    style={{
                      height: '46px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '15px',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                      border: 'none'
                    }}
                  >
                    Login
                  </Button>
                </Form.Item>
              </Form>
            </div>
          )}

          {/* TAB 2: ADMIN LOGIN */}
          {activeTab === 'admin' && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <Title level={4} style={{ margin: 0, fontWeight: 700, color: isDarkMode ? '#f4f4f5' : '#1e293b' }}>
                  Admin Login
                </Title>
              </div>

              <Form
                form={adminForm}
                layout="vertical"
                onFinish={handleAdminLogin}
                requiredMark={false}
              >
                <Form.Item
                  name="emailOrId"
                  label={<span style={{ fontWeight: 600, fontSize: '13px', color: isDarkMode ? '#e4e4e7' : '#334155' }}>Admin Email / ID</span>}
                  rules={[
                    { required: true, message: 'Please enter admin email or ID' },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                        const isId = /^[a-zA-Z0-9_-]{3,20}$/.test(value);
                        if (!isEmail && !isId) {
                          return Promise.reject(new Error('Enter a valid email or ID format'));
                        }
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
                  <Input
                    prefix={<MailOutlined style={{ color: isDarkMode ? '#71717a' : '#94a3b8' }} />}
                    placeholder="e.g. sriurjith@admin.com or ADM001"
                    size="large"
                    id="admin-email-input"
                    style={{
                      borderRadius: '8px',
                      background: isDarkMode ? '#1a1a1e' : '#ffffff',
                      border: isDarkMode ? '1px solid #2e2e34' : '1px solid #d9d9d9'
                    }}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={<span style={{ fontWeight: 600, fontSize: '13px', color: isDarkMode ? '#e4e4e7' : '#334155' }}>Password</span>}
                  rules={[
                    { required: true, message: 'Please enter your password' },
                    { min: 6, message: 'Password must be at least 6 characters' }
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: isDarkMode ? '#71717a' : '#94a3b8' }} />}
                    placeholder="Enter password (min 6 characters)"
                    size="large"
                    id="admin-password-input"
                    style={{
                      borderRadius: '8px',
                      background: isDarkMode ? '#1a1a1e' : '#ffffff',
                      border: isDarkMode ? '1px solid #2e2e34' : '1px solid #d9d9d9'
                    }}
                  />
                </Form.Item>

                <Form.Item style={{ marginTop: '24px', marginBottom: '8px' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    block
                    loading={loading}
                    icon={<SafetyCertificateOutlined />}
                    id="admin-login-btn"
                    style={{
                      height: '46px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '15px',
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                      boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
                      border: 'none'
                    }}
                  >
                    Admin Login
                  </Button>
                </Form.Item>
              </Form>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
