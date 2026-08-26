import React, { useState, useEffect } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Tag,
  Space,
  Avatar,
  Alert
} from 'antd';
import {
  ClockCircleOutlined,
  LogoutOutlined,
  UserOutlined,
  IdcardOutlined,
  FireOutlined,
  CheckCircleTwoTone,
  
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAttendance } from '../context/AttendanceContext';

const { Title, Text } = Typography;

// Curated daily inspiring workplace quotes
const INSPIRING_QUOTES = [
  {
    quote: "Excellence is not an act, but a habit. Make today extraordinary.",
    author: "Aristotle"
  },
  {
    quote: "Focus on being productive instead of busy. Every consistent effort builds tomorrow's success.",
    author: "Tim Ferriss"
  },
  {
    quote: "The only way to do great work is to love what you do and give your best every single day.",
    author: "Steve Jobs"
  },
  {
    quote: "Small disciplines repeated with consistency every day lead to great achievements over time.",
    author: "John C. Maxwell"
  }
];

export const EmployeeDashboard = () => {
  const {
    currentUser,
    getTodayAttendanceForUser,
    lastLoginMessage,
    isDarkMode
  } = useAttendance();

  const [liveDuration, setLiveDuration] = useState('0h 00m 00s');
  const [dailyQuote, setDailyQuote] = useState(INSPIRING_QUOTES[0]);
  const todayRecord = currentUser ? getTodayAttendanceForUser(currentUser.id) : null;

  // Pick a consistent quote based on the day
  useEffect(() => {
    const dayOfYear = dayjs().dayOfYear ? dayjs().dayOfYear() : dayjs().date();
    const quoteIndex = dayOfYear % INSPIRING_QUOTES.length;
    setDailyQuote(INSPIRING_QUOTES[quoteIndex]);
  }, []);

  // Live Shift Duration Timer
  useEffect(() => {
    if (!todayRecord?.inTime || todayRecord?.outTime) {
      if (todayRecord?.outTime && todayRecord?.inTime) {
        const inD = dayjs(`${todayRecord.date} ${todayRecord.inTime}`, 'YYYY-MM-DD hh:mm:ss A');
        const outD = dayjs(`${todayRecord.date} ${todayRecord.outTime}`, 'YYYY-MM-DD hh:mm:ss A');
        const diffSeconds = Math.max(0, outD.diff(inD, 'second'));
        const hrs = Math.floor(diffSeconds / 3600);
        const mins = Math.floor((diffSeconds % 3600) / 60);
        const secs = diffSeconds % 60;
        setLiveDuration(`${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`);
      }
      return;
    }

    const interval = setInterval(() => {
      const inD = dayjs(`${todayRecord.date} ${todayRecord.inTime}`, 'YYYY-MM-DD hh:mm:ss A');
      const now = dayjs();
      const diffSeconds = Math.max(0, now.diff(inD, 'second'));
      const hrs = Math.floor(diffSeconds / 3600);
      const mins = Math.floor((diffSeconds % 3600) / 60);
      const secs = diffSeconds % 60;
      setLiveDuration(`${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [todayRecord]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '32px 16px' }} className="animate-fade-in">
      {/* 1. Login Banner / Confirmation Notice */}
      {lastLoginMessage && (
        <Alert
          message={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Space>
                <CheckCircleTwoTone twoToneColor="#10b981" style={{ fontSize: '18px' }} />
                <span style={{ fontWeight: 600, fontSize: '14px', color: isDarkMode ? '#6ee7b7' : '#065f46' }}>
                  {lastLoginMessage}
                </span>
              </Space>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: '13px',
                  color: isDarkMode ? '#34d399' : '#059669'
                }}
              >
                Attendance Recorded
              </span>
            </div>
          }
          type="success"
          showIcon={false}
          closable
          style={{
            marginBottom: '24px',
            borderRadius: '12px',
            border: isDarkMode ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid #a7f3d0',
            background: isDarkMode ? '#11221b' : 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)'
          }}
        />
      )}

      {/* 2. Employee Profile Header Card (Without Logout Button) */}
      <Card
        style={{
          borderRadius: '16px',
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.35)',
          border: 'none'
        }}
        styles={{ body: { padding: '28px 32px' } }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '22px', flexWrap: 'wrap' }}>
          <Avatar
            size={76}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              fontSize: '30px',
              fontWeight: 800,
              border: '2px solid rgba(255, 255, 255, 0.85)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
            }}
          >
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <UserOutlined />}
          </Avatar>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Title level={2} style={{ margin: 0, color: '#ffffff', fontWeight: 800, letterSpacing: '-0.5px' }}>
                {currentUser?.name}
              </Title>
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.22)',
                  color: '#ffffff',
                  padding: '3px 12px',
                  borderRadius: '20px',
                  fontWeight: 700,
                  fontSize: '13px',
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.5px'
                }}
              >
                ID: {currentUser?.id}
              </span>
            </div>
            <div style={{ marginTop: '8px', color: '#e0e7ff', fontSize: '14px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <span>Department: <strong style={{ color: '#ffffff' }}>{currentUser?.department}</strong></span>
              <span>•</span>
              <span>Email: <strong style={{ color: '#ffffff' }}>{currentUser?.email}</strong></span>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Inspiring Daily Quote Banner */}
      <Card
        style={{
          borderRadius: '14px',
          marginBottom: '24px',
          background: isDarkMode ? '#141416' : '#ffffff',
          border: isDarkMode ? '1px solid #27272a' : '1px solid #cbd5e1',
          boxShadow: isDarkMode ? '0 4px 14px rgba(0,0,0,0.5)' : '0 4px 14px rgba(0,0,0,0.07)'
        }}
        styles={{ body: { padding: '18px 24px' } }}
      >
        <div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 500,
              fontStyle: 'italic',
              color: isDarkMode ? '#e4e4e7' : '#334155',
              lineHeight: 1.5
            }}
          >
            "{dailyQuote.quote}"
          </div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: isDarkMode ? '#a1a1aa' : '#64748b',
              marginTop: '4px'
            }}
          >
            — {dailyQuote.author}
          </div>
        </div>
      </Card>

      {/* 4. Real-time Status & Shift Metric Cards */}
      <Row gutter={[20, 20]}>
        {/* Today's In-Time */}
        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: '14px',
              background: isDarkMode ? '#141416' : '#ffffff',
              border: isDarkMode ? '1px solid #27272a' : '1px solid #cbd5e1',
              boxShadow: isDarkMode ? '0 4px 14px rgba(0,0,0,0.5)' : '0 4px 14px rgba(0,0,0,0.07)'
            }}
            styles={{ body: { padding: '24px 20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <Text style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px', color: isDarkMode ? '#a1a1aa' : '#64748b' }}>
                TODAY'S IN-TIME
              </Text>
              <span className="pulse-indicator" title="Shift Active"></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <ClockCircleOutlined style={{ color: '#34d399', fontSize: '20px', flexShrink: 0 }} />
              <span
                id="captured-in-time-display"
                style={{
                  fontSize: '19px',
                  fontWeight: 700,
                  color: isDarkMode ? '#f4f4f5' : '#0f172a',
                  fontFamily: 'JetBrains Mono, monospace',
                  whiteSpace: 'nowrap'
                }}
              >
                {todayRecord?.inTime || 'Not Logged'}
              </span>
            </div>
          </Card>
        </Col>

        {/* Today's Out-Time */}
        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: '14px',
              background: isDarkMode ? '#141416' : '#ffffff',
              border: isDarkMode ? '1px solid #27272a' : '1px solid #cbd5e1',
              boxShadow: isDarkMode ? '0 4px 14px rgba(0,0,0,0.5)' : '0 4px 14px rgba(0,0,0,0.07)'
            }}
            styles={{ body: { padding: '24px 20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <Text style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px', color: isDarkMode ? '#a1a1aa' : '#64748b' }}>
                TODAY'S OUT-TIME
              </Text>
              <LogoutOutlined style={{ color: isDarkMode ? '#a1a1aa' : '#64748b' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <span
                id="captured-out-time-display"
                style={{
                  fontSize: '19px',
                  fontWeight: 700,
                  color: isDarkMode ? '#f4f4f5' : '#0f172a',
                  fontFamily: 'JetBrains Mono, monospace',
                  whiteSpace: 'nowrap'
                }}
              >
                {todayRecord?.outTime || 'Pending Check-Out'}
              </span>
            </div>
          </Card>
        </Col>

        {/* Active Shift Elapsed Time */}
        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: '14px',
              background: isDarkMode ? '#141416' : '#ffffff',
              border: isDarkMode ? '1px solid #27272a' : '1px solid #cbd5e1',
              boxShadow: isDarkMode ? '0 4px 14px rgba(0,0,0,0.5)' : '0 4px 14px rgba(0,0,0,0.07)'
            }}
            styles={{ body: { padding: '24px 20px' } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <Text style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px', color: isDarkMode ? '#a1a1aa' : '#64748b' }}>
                SESSION DURATION
              </Text>
              <FireOutlined style={{ color: '#fbbf24' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <span
                style={{
                  fontSize: '19px',
                  fontWeight: 700,
                  color: '#818cf8',
                  fontFamily: 'JetBrains Mono, monospace',
                  whiteSpace: 'nowrap'
                }}
              >
                {liveDuration}
              </span>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
