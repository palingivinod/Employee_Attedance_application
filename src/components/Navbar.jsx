import React, { useState, useEffect } from 'react';
import { Layout, Button, Tag, Avatar, Space, Popconfirm, Tooltip } from 'antd';
import {
  LogoutOutlined,
  UserOutlined,
  ClockCircleOutlined,
  SafetyCertificateOutlined,
  IdcardOutlined,
  SunOutlined,
  MoonOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAttendance } from '../context/AttendanceContext';

const { Header } = Layout;

export const Navbar = () => {
  const { currentUser, logout, isDarkMode, toggleTheme } = useAttendance();
  const [currentTime, setCurrentTime] = useState(dayjs().format('ddd, MMM D, YYYY • hh:mm:ss A'));

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format('ddd, MMM D, YYYY • hh:mm:ss A'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
  };

  return (
    <Header
      style={{
        background: isDarkMode ? '#111113' : '#ffffff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: isDarkMode ? '1px solid #222226' : '1px solid #e2e8f0',
        height: '64px',
        boxShadow: isDarkMode ? '0 1px 3px 0 rgba(0, 0, 0, 0.6)' : '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}
    >
      {/* Brand & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 10px rgba(99, 102, 241, 0.35)'
          }}
        >
          <ClockCircleOutlined style={{ fontSize: '20px' }} />
        </div>
        <span
          style={{
            fontSize: '18px',
            fontWeight: 800,
            color: isDarkMode ? '#f4f4f5' : '#1e293b',
            letterSpacing: '-0.5px'
          }}
        >
          Attendance <span style={{ color: '#6366f1' }}>Application</span>
        </span>
      </div>

      {/* Right Header Area: Seamless Timer, Dark Mode Toggle, User Actions */}
      <Space size="middle" align="center">
        {/* Integrated Live Clock in Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: isDarkMode ? '#a1a1aa' : '#64748b',
            fontSize: '13px',
            fontWeight: 500
          }}
        >
          <ClockCircleOutlined style={{ color: '#6366f1', fontSize: '14px' }} />
          <span>{currentTime}</span>
        </div>

        {/* Theme Toggle Button */}
        <Tooltip title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          <Button
            type="text"
            shape="circle"
            icon={
              isDarkMode ? (
                <SunOutlined style={{ color: '#fbbf24', fontSize: '17px' }} />
              ) : (
                <MoonOutlined style={{ color: '#64748b', fontSize: '17px' }} />
              )
            }
            onClick={toggleTheme}
            id="theme-toggle-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isDarkMode ? '#222226' : '#f1f5f9'
            }}
          />
        </Tooltip>

        {currentUser && (
          <>
            {/* User Profile Preview */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '4px 10px',
                borderRadius: '8px',
                background: isDarkMode ? '#1a1a1e' : '#f8fafc',
                border: isDarkMode ? '1px solid #2a2a30' : '1px solid #edf2f7'
              }}
            >
              <Avatar
                style={{
                  backgroundColor: currentUser.role === 'admin' ? '#8b5cf6' : '#6366f1',
                  color: '#ffffff',
                  fontWeight: 700
                }}
              >
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : <UserOutlined />}
              </Avatar>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: '14px',
                    color: isDarkMode ? '#f4f4f5' : '#1e293b'
                  }}
                >
                  {currentUser.name}
                </div>
                <div style={{ fontSize: '11px', color: isDarkMode ? '#a1a1aa' : '#64748b', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <Tag
                    color={currentUser.role === 'admin' ? 'purple' : 'blue'}
                    style={{ margin: 0, padding: '0 6px', fontSize: '10px', lineHeight: '16px', borderRadius: '4px' }}
                  >
                    {currentUser.role === 'admin' ? (
                      <span><SafetyCertificateOutlined /> Admin</span>
                    ) : (
                      <span><IdcardOutlined /> {currentUser.id}</span>
                    )}
                  </Tag>
                  <span style={{ fontSize: '11px' }}>{currentUser.department}</span>
                </div>
              </div>
            </div>

            {/* Logout / Check-Out Button with Popconfirm */}
            <Popconfirm
              title={currentUser.role === 'employee' ? 'Check Out & Log Out?' : 'Confirm Logout'}
              description={
                currentUser.role === 'employee'
                  ? 'This will capture your Out-Time for today and end your working session.'
                  : 'Are you sure you want to log out of the Admin panel?'
              }
              onConfirm={handleLogout}
              okText={currentUser.role === 'employee' ? 'Log Out & Check Out' : 'Log Out'}
              cancelText="Cancel"
              okButtonProps={{ danger: true }}
            >
              <Button
                type={currentUser.role === 'employee' ? 'primary' : 'default'}
                danger
                icon={<LogoutOutlined />}
                style={{
                  borderRadius: '8px',
                  fontWeight: 600,
                  boxShadow: currentUser.role === 'employee' ? '0 4px 12px rgba(239, 68, 68, 0.25)' : 'none'
                }}
              >
                {currentUser.role === 'employee' ? 'Log Out / Check Out' : 'Logout'}
              </Button>
            </Popconfirm>
          </>
        )}
      </Space>
    </Header>
  );
};
