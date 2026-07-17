// 忘记密码页

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Form, message, Typography } from 'antd'

const { Link } = Typography

const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  // 步骤：'verify' → 验证身份  |  'reset' → 重置密码
  const [step, setStep] = useState<'verify' | 'reset'>('verify')
  // 验证通过后暂存手机号
  const [verifiedPhone, setVerifiedPhone] = useState('')

  // 验证码
  const [codeSending, setCodeSending] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const handleSendCode = async () => {
    try {
      await form.validateFields(['phone'])
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

  // Step 1: 验证身份
  const handleVerify = async (values: { phone: string; code: string }) => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    setVerifiedPhone(values.phone)
    setStep('reset')
    message.success('验证通过，请设置新密码')
  }

  // Step 2: 重置密码
  const handleReset = async (values: { newPassword: string }) => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setLoading(false)
    message.success('密码重置成功！请使用新密码登录')
    navigate('/login')
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', justifyContent: 'center',
      paddingTop: '10vh', background: '#FFFFFF',
    }}>
      <div style={{ width: '100%', maxWidth: 380, padding: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, background: '#956BF5', borderRadius: 12, margin: '0 auto',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 28, fontWeight: 700,
          }}>KG</div>
        </div>

        <h2 style={{ textAlign: 'center', fontSize: 24, fontWeight: 400, color: '#2C2C2C', marginBottom: 24, marginTop: 0 }}>
          {step === 'verify' ? '找回密码' : '设置新密码'}
        </h2>

        {step === 'verify' ? (
          <Form form={form} onFinish={handleVerify} layout="vertical">
            <p style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 16 }}>
              请输入注册时绑定的手机号，我们将发送验证码。
            </p>
            <Form.Item
              label={<span style={{ fontWeight: 400, color: '#2C2C2C' }}>手机号</span>}
              name="phone"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1\d{10}$/, message: '请输入正确的手机号' },
              ]}
            >
              <Input placeholder="请输入注册时绑定的手机号" style={{ height: 42 }} />
            </Form.Item>
            <Form.Item
              label={<span style={{ fontWeight: 400, color: '#2C2C2C' }}>验证码</span>}
              name="code"
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
                验证身份
              </Button>
            </Form.Item>
            <div style={{ textAlign: 'center', fontSize: 14, color: '#6B6B6B' }}>
              想起密码了?
              <Link onClick={() => navigate('/login')} style={{ marginLeft: 4 }}>
                返回登录 &gt;&gt;
              </Link>
            </div>
          </Form>
        ) : (
          <Form form={form} onFinish={handleReset} layout="vertical">
            <p style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 16 }}>
              为账号 {verifiedPhone} 设置新密码。
            </p>
            <Form.Item
              label={<span style={{ fontWeight: 400, color: '#2C2C2C' }}>新密码</span>}
              name="newPassword"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少 6 位' },
              ]}
            >
              <Input.Password placeholder="请输入新密码" style={{ height: 42 }} />
            </Form.Item>
            <Form.Item
              label={<span style={{ fontWeight: 400, color: '#2C2C2C' }}>确认新密码</span>}
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) return Promise.resolve()
                    return Promise.reject(new Error('两次输入的密码不一致'))
                  },
                }),
              ]}
            >
              <Input.Password placeholder="请再次输入新密码" style={{ height: 42 }} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block
                style={{ height: 42, fontSize: 16, fontWeight: 400 }}>
                重置密码
              </Button>
            </Form.Item>
          </Form>
        )}
      </div>
    </div>
  )
}

export default ForgotPasswordPage
