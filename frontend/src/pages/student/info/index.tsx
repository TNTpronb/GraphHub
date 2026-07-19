// 课程信息页（学生端）

import { ApartmentOutlined, UserOutlined, ClockCircleOutlined, TrophyOutlined } from '@ant-design/icons'

const StudentInfoPage = () => (
  <div style={{ maxWidth: 640 }}>
    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24 }}>课程信息</h3>
    <div style={{ padding: 24, background: '#fff', borderRadius: 8, border: '0.5px solid var(--color-border)', marginBottom: 16 }}>
      <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>数据结构</div>
      <div style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 16 }}>计科 2101 班 · 2025-2026 第一学期</div>
      <div style={{ fontSize: 12, color: '#999' }}>授课教师：张老师</div>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
      {[
        { icon: <ApartmentOutlined />, label: '知识节点', value: 186, color: '#956BF5' },
        { icon: <UserOutlined />, label: '注册学生', value: 42, color: '#1A7F1A' },
        { icon: <TrophyOutlined />, label: '我的贡献', value: 285, color: '#D4A72C' },
        { icon: <ClockCircleOutlined />, label: 'PR 提交', value: 3, color: '#CF222E' },
      ].map((stat) => (
        <div key={stat.label} style={{ padding: 16, textAlign: 'center', background: '#fff', borderRadius: 8, border: '0.5px solid var(--color-border)' }}>
          <div style={{ fontSize: 24, color: stat.color }}>{stat.icon}</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{stat.value}</div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{stat.label}</div>
        </div>
      ))}
    </div>
  </div>
)

export default StudentInfoPage
