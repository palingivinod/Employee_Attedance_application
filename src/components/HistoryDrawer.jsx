import React from 'react';
import { Drawer, Table, Typography, Avatar, Empty } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAttendance } from '../context/AttendanceContext';

const { Text } = Typography;

export const HistoryDrawer = ({ open, onClose, employee, records }) => {
  const { isDarkMode } = useAttendance();
  if (!employee) return null;

  const employeeRecords = records
    .filter((r) => r.userId === employee.id)
    .sort((a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf());

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 200,
      render: (date) => (
        <div style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, color: isDarkMode ? '#f4f4f5' : '#0f172a', fontSize: '13px' }}>
            {dayjs(date).format('MMM DD, YYYY')}
          </span>
          <span style={{ fontSize: '12px', color: isDarkMode ? '#a1a1aa' : '#64748b' }}>
            ({dayjs(date).format('dddd')})
          </span>
        </div>
      )
    },
    {
      title: 'In-Time',
      dataIndex: 'inTime',
      key: 'inTime',
      width: 140,
      render: (inTime) => (
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 600,
            fontSize: '13px',
            color: inTime ? (isDarkMode ? '#34d399' : '#059669') : (isDarkMode ? '#71717a' : '#94a3b8')
          }}
        >
          {inTime || '--'}
        </span>
      )
    },
    {
      title: 'Out-Time',
      dataIndex: 'outTime',
      key: 'outTime',
      width: 140,
      render: (outTime, record) => (
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 600,
            fontSize: '13px',
            color: outTime
              ? (isDarkMode ? '#60a5fa' : '#2563eb')
              : record.inTime
              ? (isDarkMode ? '#fbbf24' : '#d97706')
              : (isDarkMode ? '#71717a' : '#94a3b8')
          }}
        >
          {outTime || (record.inTime ? 'In Progress' : '--')}
        </span>
      )
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (_, record) => {
        if (record.outTime) {
          return (
            <span style={{ fontWeight: 600, fontSize: '13px', color: isDarkMode ? '#34d399' : '#059669' }}>
              Completed
            </span>
          );
        }
        if (record.inTime) {
          return (
            <span style={{ fontWeight: 600, fontSize: '13px', color: isDarkMode ? '#fbbf24' : '#d97706' }}>
              Active
            </span>
          );
        }
        return (
          <span style={{ fontWeight: 500, fontSize: '13px', color: isDarkMode ? '#71717a' : '#94a3b8' }}>
            Absent
          </span>
        );
      }
    }
  ];

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar
            style={{ backgroundColor: '#6366f1', color: '#ffffff', fontWeight: 700 }}
            size="large"
          >
            {employee.name ? employee.name.charAt(0).toUpperCase() : <UserOutlined />}
          </Avatar>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: isDarkMode ? '#f4f4f5' : '#0f172a' }}>
              {employee.name}
            </div>
            <div style={{ fontSize: '12px', color: isDarkMode ? '#a1a1aa' : '#64748b', marginTop: '2px' }}>
              <span style={{ fontWeight: 700, color: isDarkMode ? '#38bdf8' : '#0284c7', fontFamily: 'JetBrains Mono, monospace' }}>
                {employee.id}
              </span>
              <span style={{ margin: '0 6px' }}>•</span>
              <span>{employee.department}</span>
            </div>
          </div>
        </div>
      }
      placement="right"
      width={640}
      onClose={onClose}
      open={open}
      styles={{
        header: {
          background: isDarkMode ? '#141416' : '#ffffff',
          borderBottom: isDarkMode ? '1px solid #27272a' : '1px solid #e2e8f0'
        },
        body: {
          background: isDarkMode ? '#09090b' : '#ffffff'
        }
      }}
    >
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <Text strong style={{ fontSize: '14px', color: isDarkMode ? '#f4f4f5' : '#334155' }}>
          Attendance Log History ({employeeRecords.length} records)
        </Text>
        <Text style={{ fontSize: '12px', color: isDarkMode ? '#a1a1aa' : '#64748b' }}>
          Standard Monthly Target: {employee.scheduledDays || 30} Days
        </Text>
      </div>

      {employeeRecords.length === 0 ? (
        <Empty description={<span style={{ color: isDarkMode ? '#71717a' : '#94a3b8' }}>No attendance records found yet.</span>} />
      ) : (
        <Table
          dataSource={employeeRecords}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          size="middle"
        />
      )}
    </Drawer>
  );
};
