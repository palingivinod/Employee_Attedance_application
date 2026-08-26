import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Button,
  Table,
  Tag,
  Space,
  Avatar,
  Input,
  Statistic,
  Tooltip,
  Select,
  message
} from 'antd';
import {
  TeamOutlined,
  UserAddOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SearchOutlined,
  EyeOutlined,
  IdcardOutlined,
  SafetyCertificateOutlined,
  FileExcelOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useAttendance } from '../context/AttendanceContext';
import { AddEmployeeModal } from '../components/AddEmployeeModal';
import { HistoryDrawer } from '../components/HistoryDrawer';
import { exportAttendanceToExcel } from '../utils/exportExcel';

const { Title, Text } = Typography;
const { Option } = Select;

export const AdminDashboard = () => {
  const {
    users,
    attendanceRecords,
    getTodayAttendanceForUser,
    getAttendedDaysCount,
    isDarkMode
  } = useAttendance();

  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // ONLY show employees in the attendance table (exclude Admins)
  const employees = users.filter((u) => u.role === 'employee');

  // Filtered employees list based on search and department
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchText.toLowerCase());

    const matchesDept = departmentFilter === 'ALL' || emp.department === departmentFilter;

    return matchesSearch && matchesDept;
  });

  // Compute Dashboard Metrics
  const todayStr = dayjs().format('YYYY-MM-DD');
  const todayRecords = attendanceRecords.filter((r) => r.date === todayStr);
  const checkedInTodayCount = todayRecords.filter((r) => !!r.inTime).length;
  const completedTodayCount = todayRecords.filter((r) => !!r.outTime).length;

  const handleOpenHistory = (employee) => {
    setSelectedEmployee(employee);
    setDrawerOpen(true);
  };

  // Export Attendance Summary to Excel (.xlsx)
  const handleExportExcel = () => {
    try {
      const res = exportAttendanceToExcel(
        employees,
        attendanceRecords,
        getAttendedDaysCount,
        getTodayAttendanceForUser
      );
      if (res?.success) {
        message.success(`Employee summary data exported to Excel sheet (${res.fileName || 'Excel file'})!`);
      }
    } catch (e) {
      console.error(e);
      message.error('Failed to export Excel sheet.');
    }
  };

  // Ant Design Table Columns for Employees Only
  const columns = [
    {
      title: 'Employee Name',
      key: 'name',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar
            style={{
              backgroundColor: '#6366f1',
              color: '#ffffff',
              fontWeight: 700,
              flexShrink: 0
            }}
            size="large"
          >
            {record.name ? record.name.charAt(0).toUpperCase() : <TeamOutlined />}
          </Avatar>
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: '14px',
                color: isDarkMode ? '#f4f4f5' : '#0f172a'
              }}
            >
              {record.name}
            </div>
            <div style={{ fontSize: '12px', color: isDarkMode ? '#a1a1aa' : '#64748b' }}>
              {record.email}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Employee ID',
      dataIndex: 'id',
      key: 'id',
      width: 130,
      render: (id) => (
        <span
          style={{
            fontWeight: 700,
            fontSize: '14px',
            fontFamily: 'JetBrains Mono, monospace',
            color: isDarkMode ? '#38bdf8' : '#0284c7'
          }}
        >
          {id}
        </span>
      )
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      width: 150,
      render: (dept) => (
        <span
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: isDarkMode ? '#e4e4e7' : '#334155'
          }}
        >
          {dept}
        </span>
      )
    },
    {
      title: "Today's In-Time",
      key: 'todayInTime',
      width: 160,
      render: (_, record) => {
        const todayRec = getTodayAttendanceForUser(record.id);
        if (todayRec?.inTime) {
          return (
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 600,
                fontSize: '13px',
                color: isDarkMode ? '#34d399' : '#059669'
              }}
            >
              {todayRec.inTime}
            </span>
          );
        }
        return (
          <span style={{ color: isDarkMode ? '#71717a' : '#94a3b8', fontSize: '13px' }}>
            Not Checked In
          </span>
        );
      }
    },
    {
      title: "Today's Out-Time",
      key: 'todayOutTime',
      width: 160,
      render: (_, record) => {
        const todayRec = getTodayAttendanceForUser(record.id);
        if (todayRec?.outTime) {
          return (
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 600,
                fontSize: '13px',
                color: isDarkMode ? '#60a5fa' : '#2563eb'
              }}
            >
              {todayRec.outTime}
            </span>
          );
        }
        if (todayRec?.inTime) {
          return (
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: isDarkMode ? '#fbbf24' : '#d97706'
              }}
            >
              In Progress
            </span>
          );
        }
        return (
          <span style={{ color: isDarkMode ? '#71717a' : '#94a3b8', fontSize: '13px' }}>
            --
          </span>
        );
      }
    },
    {
      title: 'Total Scheduled Working Days',
      key: 'scheduledDays',
      width: 160,
      align: 'center',
      render: (_, record) => (
        <span style={{ fontWeight: 700, fontSize: '14px', color: isDarkMode ? '#e4e4e7' : '#475569' }}>
          {record.scheduledDays || 30} Days
        </span>
      )
    },
    {
      title: 'Attended Working Days',
      key: 'attendedDays',
      width: 160,
      align: 'center',
      render: (_, record) => {
        const attended = getAttendedDaysCount(record.id);
        return (
          <span
            style={{
              fontWeight: 800,
              fontSize: '16px',
              color: attended > 0 ? (isDarkMode ? '#818cf8' : '#4f46e5') : (isDarkMode ? '#71717a' : '#94a3b8')
            }}
          >
            {attended}
          </span>
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="View attendance history logs">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleOpenHistory(record)}
            style={{ fontWeight: 600, color: isDarkMode ? '#818cf8' : '#4f46e5' }}
          >
            History
          </Button>
        </Tooltip>
      )
    }
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }} className="animate-fade-in">
      {/* 1. Header with Title & Add User / Admin & Export Excel Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Title
            level={2}
            style={{
              margin: 0,
              fontWeight: 800,
              color: isDarkMode ? '#f4f4f5' : '#0f172a',
              letterSpacing: '-0.5px'
            }}
          >
            Admin Attendance Dashboard
          </Title>
          <Tag
            style={{
              fontWeight: 700,
              borderRadius: '12px',
              padding: '2px 10px',
              color: isDarkMode ? '#c084fc' : '#7c3aed',
              background: isDarkMode ? 'rgba(168, 85, 247, 0.15)' : '#f3e8ff',
              border: isDarkMode ? '1px solid rgba(168, 85, 247, 0.35)' : '1px solid #e9d5ff'
            }}
          >
            <SafetyCertificateOutlined style={{ marginRight: '4px' }} /> Management Portal
          </Tag>
        </div>

        {/* Action Buttons: Export Excel & Add User */}
        <Space size="middle" wrap>
          {/* Download Excel Sheet Button */}
          <Button
            icon={<FileExcelOutlined style={{ color: '#10b981', fontSize: '16px' }} />}
            onClick={handleExportExcel}
            id="admin-export-excel-btn"
            size="large"
            style={{
              height: '46px',
              padding: '0 20px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '14px',
              background: isDarkMode ? '#142a1f' : '#ecfdf5',
              color: isDarkMode ? '#34d399' : '#065f46',
              border: isDarkMode ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid #a7f3d0',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.15)'
            }}
          >
            Export Excel
          </Button>

          {/* Add User / Admin Button */}
          <Button
            type="primary"
            size="large"
            icon={<UserAddOutlined />}
            onClick={() => setModalOpen(true)}
            id="admin-add-user-btn"
            style={{
              height: '46px',
              padding: '0 24px',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '15px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
              border: 'none'
            }}
          >
            Add Employee / Admin
          </Button>
        </Space>
      </div>

      {/* 2. Key Metric Cards */}
      <Row gutter={[20, 20]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: '14px',
              background: isDarkMode ? '#141416' : '#ffffff',
              border: isDarkMode ? '1px solid #27272a' : '1px solid #cbd5e1',
              boxShadow: isDarkMode ? '0 4px 14px rgba(0,0,0,0.5)' : '0 4px 14px rgba(0,0,0,0.07)'
            }}
            styles={{ body: { padding: '20px' } }}
          >
            <Statistic
              title={
                <span style={{ fontWeight: 600, fontSize: '12px', letterSpacing: '0.5px', color: isDarkMode ? '#a1a1aa' : '#64748b' }}>
                  TOTAL EMPLOYEES
                </span>
              }
              value={employees.length}
              prefix={<TeamOutlined style={{ color: '#818cf8', marginRight: '8px' }} />}
              valueStyle={{ fontWeight: 800, color: isDarkMode ? '#f4f4f5' : '#0f172a' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Tag
                style={{
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: isDarkMode ? '#a5b4fc' : '#4f46e5',
                  background: isDarkMode ? 'rgba(99, 102, 241, 0.15)' : '#eef2ff',
                  border: isDarkMode ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid #e0e7ff'
                }}
              >
                Registered Employees
              </Tag>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: '14px',
              background: isDarkMode ? '#141416' : '#ffffff',
              border: isDarkMode ? '1px solid #27272a' : '1px solid #cbd5e1',
              boxShadow: isDarkMode ? '0 4px 14px rgba(0,0,0,0.5)' : '0 4px 14px rgba(0,0,0,0.07)'
            }}
            styles={{ body: { padding: '20px' } }}
          >
            <Statistic
              title={
                <span style={{ fontWeight: 600, fontSize: '12px', letterSpacing: '0.5px', color: isDarkMode ? '#a1a1aa' : '#64748b' }}>
                  CHECKED IN TODAY
                </span>
              }
              value={checkedInTodayCount}
              suffix={`/ ${employees.length}`}
              prefix={<ClockCircleOutlined style={{ color: '#34d399', marginRight: '8px' }} />}
              valueStyle={{ fontWeight: 800, color: isDarkMode ? '#34d399' : '#10b981' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Tag
                style={{
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: isDarkMode ? '#6ee7b7' : '#059669',
                  background: isDarkMode ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
                  border: isDarkMode ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid #a7f3d0'
                }}
              >
                Today's Logins
              </Tag>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: '14px',
              background: isDarkMode ? '#141416' : '#ffffff',
              border: isDarkMode ? '1px solid #27272a' : '1px solid #cbd5e1',
              boxShadow: isDarkMode ? '0 4px 14px rgba(0,0,0,0.5)' : '0 4px 14px rgba(0,0,0,0.07)'
            }}
            styles={{ body: { padding: '20px' } }}
          >
            <Statistic
              title={
                <span style={{ fontWeight: 600, fontSize: '12px', letterSpacing: '0.5px', color: isDarkMode ? '#a1a1aa' : '#64748b' }}>
                  COMPLETED SHIFTS
                </span>
              }
              value={completedTodayCount}
              prefix={<CheckCircleOutlined style={{ color: '#60a5fa', marginRight: '8px' }} />}
              valueStyle={{ fontWeight: 800, color: isDarkMode ? '#60a5fa' : '#3b82f6' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Tag
                style={{
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: isDarkMode ? '#93c5fd' : '#2563eb',
                  background: isDarkMode ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff',
                  border: isDarkMode ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid #bfdbfe'
                }}
              >
                Checked Out Today
              </Tag>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 3. Main Staff Attendance Table Card */}
      <Card
        style={{
          borderRadius: '16px',
          background: isDarkMode ? '#141416' : '#ffffff',
          border: isDarkMode ? '1px solid #27272a' : '1px solid #cbd5e1',
          boxShadow: isDarkMode ? '0 6px 20px rgba(0,0,0,0.6)' : '0 6px 20px rgba(0,0,0,0.08)'
        }}
        styles={{ body: { padding: '24px' } }}
      >
        {/* Table Filters & Search Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '20px'
          }}
        >
          <div>
            <Title
              level={4}
              style={{
                margin: 0,
                fontWeight: 700,
                color: isDarkMode ? '#f4f4f5' : '#1e293b'
              }}
            >
              Employee Attendance Summary
            </Title>
            <Text style={{ fontSize: '13px', color: isDarkMode ? '#a1a1aa' : '#64748b' }}>
              Standard monthly schedule: <strong style={{ color: isDarkMode ? '#f4f4f5' : '#1e293b' }}>30 working days</strong>
            </Text>
          </div>

          <Space size="middle" wrap>
            {/* Search Input */}
            <Input
              prefix={<SearchOutlined style={{ color: isDarkMode ? '#71717a' : '#94a3b8' }} />}
              placeholder="Search by name, ID, email..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                width: '220px',
                borderRadius: '8px',
                background: isDarkMode ? '#1a1a1e' : '#ffffff',
                border: isDarkMode ? '1px solid #2e2e34' : '1px solid #d9d9d9'
              }}
              allowClear
              id="admin-search-input"
            />

            {/* Department Filter */}
            <Select
              value={departmentFilter}
              onChange={setDepartmentFilter}
              style={{ width: '160px' }}
              id="admin-dept-filter"
            >
              <Option value="ALL">All Departments</Option>
              <Option value="Engineering">Engineering</Option>
              <Option value="Product Design">Product Design</Option>
              <Option value="Marketing">Marketing</Option>
              <Option value="Human Resources">Human Resources</Option>
              <Option value="Finance">Finance</Option>
              <Option value="Operations">Operations</Option>
              <Option value="Management & HR">Management & HR</Option>
            </Select>
          </Space>
        </div>

        {/* The Ant Design Table (Employees Only) */}
        <Table
          dataSource={filteredEmployees}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 8, showSizeChanger: true, pageSizeOptions: ['8', '15', '25'] }}
          scroll={{ x: 1000 }}
          id="admin-attendance-table"
        />
      </Card>

      {/* Add User / Admin Modal */}
      <AddEmployeeModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
      />

      {/* History Slide-out Drawer (Admin Only) */}
      <HistoryDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        employee={selectedEmployee}
        records={attendanceRecords}
      />
    </div>
  );
};
