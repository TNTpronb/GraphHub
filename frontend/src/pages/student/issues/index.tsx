// 课程 Issue 页（学生端）

import { useState } from 'react'
import { Button, Tag, Input, Space } from 'antd'
import { PlusOutlined, BugOutlined, QuestionCircleOutlined, BulbOutlined } from '@ant-design/icons'

const issues = [
  { id: '#1', title: '栈的入栈操作描述不准确', type: 'bug', status: 'open', author: '张三', createdAt: '2 天前', replies: 3 },
  { id: '#2', title: '建议补充 B 树的数据结构说明', type: 'suggestion', status: 'open', author: '李四', createdAt: '3 天前', replies: 1 },
  { id: '#3', title: '快速排序的稳定性讨论', type: 'question', status: 'closed', author: '王五', createdAt: '1 周前', replies: 5 },
]

const icons: Record<string, React.ReactNode> = {
  bug: <BugOutlined style={{ color: '#CF222E' }} />,
  question: <QuestionCircleOutlined style={{ color: '#D4A72C' }} />,
  suggestion: <BulbOutlined style={{ color: '#956BF5' }} />,
}

const StudentIssuesPage = () => {
  const [f, setF] = useState<'open' | 'closed' | 'all'>('open')
  const list = issues.filter((i) => f === 'all' || i.status === f)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Issue</h3>
        <Button type="primary" size="small" icon={<PlusOutlined />}>新建 Issue</Button>
      </div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        {(['open', 'closed', 'all'] as const).map((v) => (
          <Button key={v} size="small" type={f === v ? 'primary' : 'default'} onClick={() => setF(v)}>
            {v === 'open' ? '进行中' : v === 'closed' ? '已关闭' : '全部'}
          </Button>
        ))}
      </div>
      {list.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#999', padding: 48, background: '#fff', borderRadius: 8, border: '0.5px solid var(--color-border)' }}>
          暂无 Issue
        </div>
      ) : (
        list.map((issue) => (
          <div key={issue.id} style={{ padding: '12px 16px', background: '#fff', border: '0.5px solid var(--color-border)', borderRadius: 8, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {icons[issue.type]}
              <div>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{issue.title}</div>
                <div style={{ fontSize: 12, color: '#999' }}>{issue.id} · {issue.author} · {issue.createdAt}</div>
              </div>
            </div>
            <Space size={8}>
              {issue.replies > 0 && <span style={{ fontSize: 12, color: '#999' }}>💬 {issue.replies}</span>}
              <Tag color={issue.status === 'open' ? 'green' : 'default'} style={{ margin: 0 }}>{issue.status === 'open' ? '进行中' : '已关闭'}</Tag>
            </Space>
          </div>
        ))
      )}
    </div>
  )
}

export default StudentIssuesPage
