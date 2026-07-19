// 我的 PR 提交页（学生端）

import { Tag } from 'antd'

const prs = [
  { id: '#12', title: '新增节点 "红黑树"', status: 'approved', createdAt: '2 天前' },
  { id: '#11', title: '修改关系：栈←队列 PREREQUISITE', status: 'pending', createdAt: '3 天前' },
  { id: '#10', title: '补充易错点：链表空指针异常', status: 'rejected', createdAt: '1 周前' },
]

const statusCfg: Record<string, { color: string; label: string }> = {
  approved: { color: '#1A7F1A', label: '已通过' },
  pending:  { color: '#D4A72C', label: '审核中' },
  rejected: { color: '#CF222E', label: '已打回' },
}

const StudentMyPR = () => (
  <div>
    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>我的提交</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {prs.map((pr) => {
        const s = statusCfg[pr.status]
        return (
          <div key={pr.id} style={{
            padding: '12px 16px', background: '#fff', cursor: 'pointer',
            border: '0.5px solid var(--color-border)', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: 13 }}>{pr.id} {pr.title}</div>
              <div style={{ fontSize: 12, color: '#999' }}>{pr.createdAt}</div>
            </div>
            <Tag style={{ color: s.color, background: `${s.color}15`, border: 'none', margin: 0 }}>{s.label}</Tag>
          </div>
        )
      })}
    </div>
  </div>
)

export default StudentMyPR
