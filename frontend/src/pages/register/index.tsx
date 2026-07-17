// 注册页

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Form, message, Typography, Select } from 'antd'

const { Link } = Typography

const RegisterPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  const onFinish = async (_values: any) => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    message.success('注册成功！请登录')
    setLoading(false)
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
          注册账号
        </h2>

        <Form form={form} onFinish={onFinish} layout="vertical">
          {/* 学号/工号 */}
          <Form.Item
            label={<span style={{ fontWeight: 400, color: '#2C2C2C' }}>学号 / 工号</span>}
            name="username"
            rules={[{ required: true, message: '请输入学号或工号' }]}
          >
            <Input placeholder="请输入学号或工号" style={{ height: 42 }} />
          </Form.Item>

          {/* 姓名 */}
          <Form.Item
            label={<span style={{ fontWeight: 400, color: '#2C2C2C' }}>姓名</span>}
            name="displayName"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入真实姓名" style={{ height: 42 }} />
          </Form.Item>

          {/* 身份 */}
          <Form.Item
            label={<span style={{ fontWeight: 400, color: '#2C2C2C' }}>身份</span>}
            name="role"
            rules={[{ required: true, message: '请选择身份' }]}
            initialValue="student"
          >
            <Select style={{ height: 42 }} options={[
              { value: 'student', label: '学生' },
              { value: 'teacher', label: '教师' },
            ]} />
          </Form.Item>

          {/* 手机号（强制绑定，无需验证码） */}
          <Form.Item
            label={<span style={{ fontWeight: 400, color: '#2C2C2C' }}>手机号 <span style={{ color: '#CF222E' }}>*</span></span>}
            name="phone"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1\d{10}$/, message: '请输入正确的手机号' },
            ]}
          >
            <Input placeholder="请输入手机号" style={{ height: 42 }} />
          </Form.Item>

          {/* 邮箱（选填，无需验证码） */}
          <Form.Item
            label={<span style={{ fontWeight: 400, color: '#2C2C2C' }}>邮箱（选填）</span>}
            name="email"
            rules={[{ type: 'email', message: '请输入正确的邮箱格式' }]}
          >
            <Input placeholder="请输入邮箱（选填）" style={{ height: 42 }} />
          </Form.Item>

          {/* 密码 */}
          <Form.Item
            label={<span style={{ fontWeight: 400, color: '#2C2C2C' }}>密码</span>}
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少 6 位' },
            ]}
          >
            <Input.Password placeholder="请输入密码" style={{ height: 42 }} />
          </Form.Item>

          {/* 确认密码 */}
          <Form.Item
            label={<span style={{ fontWeight: 400, color: '#2C2C2C' }}>确认密码</span>}
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'))
                },
              }),
            ]}
          >
            <Input.Password placeholder="请再次输入密码" style={{ height: 42 }} />
          </Form.Item>

          {/* 注册按钮 */}
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block
              style={{ height: 42, fontSize: 16, fontWeight: 400 }}>
              注册
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center', fontSize: 14, color: '#6B6B6B' }}>
            已有账号?
            <Link onClick={() => navigate('/login')} style={{ marginLeft: 4 }}>
              立即登录 &gt;&gt;
            </Link>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default RegisterPage
