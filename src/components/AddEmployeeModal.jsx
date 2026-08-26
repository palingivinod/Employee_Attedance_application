import React, { useState } from 'react';
import { Modal, Form, Input, Select, Button, message, Alert, Radio } from 'antd';
import {
  UserOutlined,
  IdcardOutlined,
  MailOutlined,
  LockOutlined,
  UserAddOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { useAttendance } from '../context/AttendanceContext';

const { Option } = Select;

export const AddEmployeeModal = ({ open, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const { registerUser, users } = useAttendance();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    setErrorMessage(null);

    setTimeout(() => {
      const result = registerUser({
        name: values.name,
        id: values.id,
        department: values.department,
        email: values.email,
        password: values.password,
        role: values.role || 'employee'
      });
      setSubmitting(false);

      if (result.success) {
        message.success(`${values.role === 'admin' ? 'Administrator' : 'Employee'} ${result.user.name} (${result.user.id}) added successfully!`);
        form.resetFields();
        if (onSuccess) onSuccess(result.user);
        onCancel();
      } else {
        setErrorMessage(result.error);
      }
    }, 350);
  };

  const handleClose = () => {
    form.resetFields();
    setErrorMessage(null);
    onCancel();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#e0e7ff',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px'
            }}
          >
            <UserAddOutlined />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Add User / Admin</div>
            <div style={{ fontSize: '12px', fontWeight: 400, color: '#64748b' }}>
              Add a new employee or administrator to the application
            </div>
          </div>
        </div>
      }
      open={open}
      onCancel={handleClose}
      footer={null}
      destroyOnClose
      width={520}
      centered
    >
      <div style={{ marginTop: '16px' }}>
        {errorMessage && (
          <Alert
            type="error"
            message={errorMessage}
            showIcon
            closable
            onClose={() => setErrorMessage(null)}
            style={{ marginBottom: '16px' }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark="optional"
          initialValues={{
            role: 'employee',
            department: 'Engineering',
            password: ''
          }}
        >
          {/* Role Selection */}
          <Form.Item
            name="role"
            label={<span style={{ fontWeight: 600 }}>Role Type</span>}
            rules={[{ required: true, message: 'Please select a role' }]}
          >
            <Radio.Group buttonStyle="solid" style={{ width: '100%', display: 'flex' }}>
              <Radio.Button value="employee" style={{ flex: 1, textAlign: 'center' }}>
                <UserOutlined /> Employee
              </Radio.Button>
              <Radio.Button value="admin" style={{ flex: 1, textAlign: 'center' }}>
                <SafetyCertificateOutlined /> Admin
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          {/* Full Name */}
          <Form.Item
            name="name"
            label={<span style={{ fontWeight: 600 }}>Full Name</span>}
            rules={[
              { required: true, message: 'Please enter full name' },
              { min: 2, message: 'Name must be at least 2 characters' }
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#94a3b8' }} />}
              placeholder="e.g. Sophia Anderson"
              size="large"
              id="add-emp-name"
            />
          </Form.Item>

          {/* Employee / Admin ID */}
          <Form.Item
            name="id"
            label={<span style={{ fontWeight: 600 }}>User ID (Unique)</span>}
            rules={[
              { required: true, message: 'Please enter a unique ID' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const exists = users.some(
                    (u) => u.id.toLowerCase() === value.trim().toLowerCase()
                  );
                  if (exists) {
                    return Promise.reject(new Error('This User ID is already registered!'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input
              prefix={<IdcardOutlined style={{ color: '#94a3b8' }} />}
              placeholder="e.g. EMP104 or ADM002"
              size="large"
              style={{ textTransform: 'uppercase' }}
              id="add-emp-id"
            />
          </Form.Item>

          {/* Department */}
          <Form.Item
            name="department"
            label={<span style={{ fontWeight: 600 }}>Department</span>}
            rules={[{ required: true, message: 'Please select a department' }]}
          >
            <Select size="large" id="add-emp-department">
              <Option value="Engineering">Engineering</Option>
              <Option value="Product Design">Product Design</Option>
              <Option value="Marketing">Marketing</Option>
              <Option value="Human Resources">Human Resources</Option>
              <Option value="Finance">Finance</Option>
              <Option value="Operations">Operations</Option>
              <Option value="Management & HR">Management & HR</Option>
            </Select>
          </Form.Item>

          {/* Email Address */}
          <Form.Item
            name="email"
            label={<span style={{ fontWeight: 600 }}>Company Email</span>}
            rules={[
              { required: true, message: 'Please enter an email address' },
              { type: 'email', message: 'Please enter a valid email address' },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  const exists = users.some(
                    (u) => u.email.toLowerCase() === value.trim().toLowerCase()
                  );
                  if (exists) {
                    return Promise.reject(new Error('This email is already registered!'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#94a3b8' }} />}
              placeholder="e.g. sophia@company.com"
              size="large"
              id="add-emp-email"
            />
          </Form.Item>

          {/* Initial Password */}
          <Form.Item
            name="password"
            label={<span style={{ fontWeight: 600 }}>Password</span>}
            rules={[
              { required: true, message: 'Please set an initial password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#94a3b8' }} />}
              placeholder="Min 6 characters"
              size="large"
              id="add-emp-password"
            />
          </Form.Item>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <Button onClick={handleClose} size="large">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={submitting}
              icon={<UserAddOutlined />}
              style={{
                background: '#4f46e5',
                boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
              }}
              id="add-emp-submit-btn"
            >
              Submit
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};
