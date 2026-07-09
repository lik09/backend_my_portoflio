import { Alert, Button, Card, Form, Input, theme } from 'antd';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../../utils/request';
import logo from '../../assets/logo/logo_login.png'

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = theme.useToken();

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);
    try {
      const res = await request('login', 'post', {
        username: values.username,
        password: values.password,
      });

      if (res && res.token) {
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('auth_user', JSON.stringify(res.user));
        localStorage.setItem('lang', res.user.language || 'en');
        navigate('/', { replace: true });
      } else {
        setError(res?.message || 'Invalid email or password.');
      }
    } catch {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: token.colorBgLayout,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Card
        style={{ width: 420, borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.10)',padding:30 }}
      >
        <div style={{ textAlign: 'center', display: 'flex',
          flexDirection: 'column', justifyContent:'center' ,alignItems:'center'}}>
          <img src={logo} alt="logo.png" width={140} height={140} style={{objectFit:'cover'}} />
          <p style={{ color: token.colorTextSecondary, margin: '8px 0 26px  0', fontSize: 18 }}>Sign in to manage your portfolio</p>
        </div>

        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            style={{ marginBottom: 16 }}
          />
        )}

        <Form layout="vertical" onFinish={handleSubmit} autoComplete="off">
          <Form.Item
            label="Username"
            name="username"
            rules={[{ required: true, message: 'Please enter your username' }]}
          >
            <Input size="large" placeholder="your username" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password size="large" placeholder="password" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 0 ,paddingTop:14 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
