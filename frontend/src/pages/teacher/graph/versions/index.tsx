// 图谱提交历史页

import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Timeline, Button, Tag, Modal, message } from 'antd'
import { ArrowLeftOutlined, RollbackOutlined } from '@ant-design/icons'
import DiffContent, { mockDiffFiles } from '../../../../components/pr/DiffContent'

const mockHistory = [
  { version: 12, date: '2026-07-16', author: '张三', summary: '新增红黑树节点', type: 'pr', nodesChanged: 3 },
  { version: 11, date: '2026-07-15', author: '李四', summary: '修改栈与队列 PREREQUISITE 关系', type: 'pr', nodesChanged: 1 },
  { version: 10, date: '2026-07-14', author: '王五', summary: '补充快速排序易错点', type: 'pr', nodesChanged: 2 },
  { version: 9,  date: '2026-07-13', author: '张三', summary: '新增链表代码实现', type: 'pr', nodesChanged: 2 },
  { version: 8,  date: '2026-07-12', author: '教师', summary: '导入第二章课件 · 自动生成 18 个节点', type: 'ai', nodesChanged: 18 },
  { version: 7,  date: '2026-07-10', author: '李四', summary: '补充二叉树遍历实验步骤', type: 'pr', nodesChanged: 1 },
  { version: 6,  date: '2026-07-08', author: '教师', summary: '调整章节结构', type: 'edit', nodesChanged: 4 },
  { version: 5,  date: '2026-07-05', author: '王五', summary: '新增队列应用案例', type: 'pr', nodesChanged: 3 },
  { version: 4,  date: '2026-07-03', author: '张三', summary: '修改栈溢出易错点描述', type: 'pr', nodesChanged: 1 },
  { version: 3,  date: '2026-07-01', author: '教师', summary: '导入第一章课件 · 自动生成 24 个节点', type: 'ai', nodesChanged: 24 },
  { version: 2,  date: '2026-07-01', author: '教师', summary: '手动调整初始图谱结构', type: 'edit', nodesChanged: 5 },
  { version: 1,  date: '2026-07-01', author: '教师', summary: '初始化知识图谱', type: 'init', nodesChanged: 50 },
]

const GraphHistoryPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const isTeacher = location.pathname.startsWith('/teacher')
  const [selected, setSelected] = useState<number | null>(null)

  const handleRollback = (version: number) => {
    Modal.confirm({
      title: '确认回滚',
      content: `确定要将班级公共图谱回滚到版本 ${version} 吗？此操作将影响整个班级的图谱内容，且不可撤销。`,
      okText: '确认回滚',
      cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => { message.success(`已回滚到版本 ${version}`); navigate(-1) },
    })
  }

  const typeColor = (t: string) => t === 'pr' ? 'blue' : t === 'ai' ? 'purple' : t === 'edit' ? 'orange' : 'green'

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>提交历史</h3>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* 左侧版本时间轴 */}
        <div style={{ flex: 1, maxWidth: 360 }}>
          <Timeline items={mockHistory.map((h) => ({
            color: selected === h.version ? 'var(--color-primary)' : 'gray',
            children: (
              <div style={{ padding: '8px 12px', borderRadius: 6, cursor: 'pointer',
                background: selected === h.version ? 'var(--color-primary-light)' : 'transparent',
              }} onClick={() => setSelected(h.version)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>v{h.version}</span>
                  <Tag color={typeColor(h.type)} style={{ fontSize: 11, margin: 0 }}>
                    {h.type === 'pr' ? 'PR' : h.type === 'ai' ? 'AI' : h.type === 'edit' ? '编辑' : '初始化'}
                  </Tag>
                </div>
                <div style={{ fontSize: 13 }}>{h.summary}</div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{h.author} · {h.date} · {h.nodesChanged} 节点</div>
              </div>
            ),
          }))} />
        </div>

        {/* 右侧差异视图 */}
        {selected && (
          <div style={{ flex: 2, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                v{selected} {selected > 1 ? `← v${selected - 1}` : '初始版本'}
              </span>
              {isTeacher && (
                <Button size="small" icon={<RollbackOutlined />} danger
                  onClick={() => handleRollback(selected)}>回滚到此版本</Button>
              )}
            </div>
            <DiffContent
              header={null}
              footer={null}
              height="calc(100vh - 200px)"
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default GraphHistoryPage
