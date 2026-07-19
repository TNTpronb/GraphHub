// 课程信息页（教师端）

import { Tag } from 'antd'
import { ApartmentOutlined, UserOutlined, ClockCircleOutlined, RiseOutlined } from '@ant-design/icons'

const CourseInfoPage = () => {
  const info = {
    name: '数据结构',
    className: '计科 2101 班',
    semester: '2025-2026 第一学期',
    nodeCount: 186,
    studentCount: 42,
    createdAt: '2026-07-01',
    lastUpdated: '10 分钟前',
    prCount: 15,
    issueCount: 3,
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 24 }}>课程信息</h3>

      <div style={{
        padding: 24, background: '#fff', borderRadius: 8,
        border: '0.5px solid var(--color-border)', marginBottom: 16,
      }}>
        <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{info.name}</div>
        <div style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 16 }}>
          {info.className} · {info.semester}
        </div>
        <div style={{ fontSize: 12, color: '#999' }}>
          创建于 {info.createdAt} · 最近更新 {info.lastUpdated}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
        {[
          { icon: <ApartmentOutlined />, label: '知识节点', value: info.nodeCount, color: '#956BF5' },
          { icon: <UserOutlined />, label: '注册学生', value: info.studentCount, color: '#1A7F1A' },
          { icon: <RiseOutlined />, label: '总 PR 数', value: info.prCount, color: '#D4A72C' },
          { icon: <ClockCircleOutlined />, label: 'Issue', value: info.issueCount, color: '#CF222E' },
        ].map((stat) => (
          <div key={stat.label} style={{
            padding: 16, textAlign: 'center', background: '#fff',
            borderRadius: 8, border: '0.5px solid var(--color-border)',
          }}>
            <div style={{ fontSize: 24, color: stat.color, marginBottom: 4 }}>{stat.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#2C2C2C' }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CourseInfoPage
