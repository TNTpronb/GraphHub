// 登录页
// 支持三种登录模式：密码登录 / 手机验证码登录 / 邮箱验证码登录

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Form, message, Typography, Divider } from 'antd'
import { MobileOutlined, MailOutlined } from '@ant-design/icons'

const { Link } = Typography

type LoginMode = 'password' | 'phone' | 'email'

const LoginPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [loginMode, setLoginMode] = useState<LoginMode>('password')

  // 验证码倒计时
  const [codeSending, setCodeSending] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const handleSendCode = async () => {
    const field = loginMode === 'phone' ? 'phone' : 'email'
    try {
      await form.validateFields([field])
    } catch {
      return
    }
    setCodeSending(true)
    await new Promise((r) => setTimeout(r, 800))
    setCodeSending(false)
    message.success('验证码已发送')
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const onFinish = async (_values: any) => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    message.success(`欢迎回来`)
    setLoading(false)
    // 身份由后端返回，默认跳转学生端
    navigate('/student/dashboard')
  }

  const handleForgotPassword = () => {
    navigate('/forgot-password')
  }

  // 切换到验证码登录模式
  const switchToCodeMode = (mode: 'password' | 'phone' | 'email') => {
    setLoginMode(mode)
    form.resetFields(['username', 'password', 'phoneCode', 'emailCode', 'phone', 'email'])
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', justifyContent: 'center',
      paddingTop: '10vh', background: '#FFFFFF',
    }}>
      <div style={{ width: '100%', maxWidth: 380, padding: '0 16px' }}>
        {/* ── Logo ── */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, background: '#956BF5', borderRadius: 12, margin: '0 auto',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 28, fontWeight: 700,
          }}>KG</div>
        </div>

        <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 400, color: '#2C2C2C', marginBottom: 24, marginTop: 0 }}>
          登录
        </h2>

        <Form form={form} onFinish={onFinish} layout="vertical">

          {/* ── 密码登录模式 ── */}
          {loginMode === 'password' && (
            <>
              <Form.Item
                label={<span style={{ fontWeight: 400, color: '#2C2C2C' }}>学号 / 工号</span>}
                name="username"
                rules={[{ required: true, message: '请输入学号或工号' }]}
              >
                <Input placeholder="请输入学号或工号" style={{ height: 42 }} />
              </Form.Item>

              <Form.Item
                label={
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{ fontWeight: 400, color: '#2C2C2C' }}>密码</span>
                    <Link onClick={(e) => { e.preventDefault(); handleForgotPassword() }}>
                      忘记密码?
                    </Link>
                  </div>
                }
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password placeholder="请输入密码" style={{ height: 42 }} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block
                  style={{ height: 42, fontSize: 16, fontWeight: 400 }}>
                  登录
                </Button>
              </Form.Item>
            </>
          )}

          {/* ── 手机验证码登录模式 ── */}
          {loginMode === 'phone' && (
            <>
              <p style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 16, textAlign: 'center' }}>
                输入注册时绑定的手机号，接收验证码后登录
              </p>
              <Form.Item
                label={<span style={{ fontWeight: 400, color: '#2C2C2C' }}>手机号</span>}
                name="phone"
                rules={[
                  { required: true, message: '请输入手机号' },
                  { pattern: /^1\d{10}$/, message: '请输入正确的手机号' },
                ]}
              >
                <Input placeholder="请输入手机号" style={{ height: 42 }} />
              </Form.Item>
              <Form.Item
                label={<span style={{ fontWeight: 400, color: '#2C2C2C' }}>验证码</span>}
                name="phoneCode"
                rules={[{ required: true, message: '请输入验证码' }]}
              >
                <Input placeholder="请输入验证码" style={{ height: 42 }}
                  suffix={
                    <Link onClick={(e) => { e.preventDefault(); handleSendCode() }}
                      disabled={countdown > 0 || codeSending}
                      style={{ fontSize: 14, whiteSpace: 'nowrap' }}>
                      {countdown > 0 ? `${countdown}s` : codeSending ? '发送中...' : '获取验证码'}
                    </Link>
                  }
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block
                  style={{ height: 42, fontSize: 16, fontWeight: 400 }}>
                  登录
                </Button>
              </Form.Item>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Link onClick={() => switchToCodeMode('password')}>
                  使用密码登录
                </Link>
              </div>
            </>
          )}

          {/* ── 邮箱验证码登录模式 ── */}
          {loginMode === 'email' && (
            <>
              <p style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 16, textAlign: 'center' }}>
                输入注册时绑定的邮箱，接收验证码后登录
              </p>
              <Form.Item
                label={<span style={{ fontWeight: 400, color: '#2C2C2C' }}>邮箱</span>}
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入正确的邮箱格式' },
                ]}
              >
                <Input placeholder="请输入邮箱" style={{ height: 42 }} />
              </Form.Item>
              <Form.Item
                label={<span style={{ fontWeight: 400, color: '#2C2C2C' }}>验证码</span>}
                name="emailCode"
                rules={[{ required: true, message: '请输入验证码' }]}
              >
                <Input placeholder="请输入验证码" style={{ height: 42 }}
                  suffix={
                    <Link onClick={(e) => { e.preventDefault(); handleSendCode() }}
                      disabled={countdown > 0 || codeSending}
                      style={{ fontSize: 14, whiteSpace: 'nowrap' }}>
                      {countdown > 0 ? `${countdown}s` : codeSending ? '发送中...' : '获取验证码'}
                    </Link>
                  }
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block
                  style={{ height: 42, fontSize: 16, fontWeight: 400 }}>
                  登录
                </Button>
              </Form.Item>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <Link onClick={() => switchToCodeMode('password')}>
                  使用密码登录
                </Link>
              </div>
            </>
          )}

          {/* ── 密码登录模式才显示 or 分割线和手机/邮箱登录按钮 ── */}
          {loginMode === 'password' && (
            <>
              <Divider plain style={{ fontSize: 14, color: '#999', margin: '0 0 16px 0' }}>or</Divider>

              <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                <Button block icon={<MobileOutlined />} style={{ fontWeight: 400, height: 42 }}
                  onClick={() => switchToCodeMode('phone')}>
                  手机号登录
                </Button>
                <Button block icon={<MailOutlined />} style={{ fontWeight: 400, height: 42 }}
                  onClick={() => switchToCodeMode('email')}>
                  邮箱登录
                </Button>
              </div>
            </>
          )}

          {/* 没有账号? 注册账号>> */}
          <div style={{ textAlign: 'center', fontSize: 14, color: '#6B6B6B' }}>
            没有账号?
            <Link onClick={() => navigate('/register')} style={{ marginLeft: 4 }}>
              注册账号 &gt;&gt;
            </Link>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default LoginPage
