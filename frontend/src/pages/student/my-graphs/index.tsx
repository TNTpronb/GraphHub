// 学生端：我的图谱 — 版本管理列表

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Tag, message, Modal, Input, Dropdown } from 'antd'
import { EditOutlined, MoreOutlined, ForkOutlined, DeleteOutlined } from '@ant-design/icons'

interface GraphVersion {
  key: string
  label: string
  forkedAt: string
  sourceVersion: string
  description: string
  nodeCount: number
}

const mockVersions: GraphVersion[] = [
  { key: 'v3', label: '红黑树补充 + 快排优化', forkedAt: '3 天前', sourceVersion: '班级图谱 v42',
    description: '新增红黑树节点，修改快速排序时间复杂度分析，补充代码实现', nodeCount: 52 },
  { key: 'v2', label: '栈与队列应用场景', forkedAt: '1 周前', sourceVersion: '班级图谱 v40',
    description: '补充栈的应用场景章节：函数调用栈、表达式求值', nodeCount: 48 },
  { key: 'v1', label: '初始复刻', forkedAt: '2 周前', sourceVersion: '班级图谱 v38',
    description: '数据结构课程知识图谱的初始 Fork 副本', nodeCount: 45 },
]

const MyGraphsPage = () => {
  const navigate = useNavigate()
  const [versions, setVersions] = useState(mockVersions)
  const [renameModal, setRenameModal] = useState<{ key: string; label: string } | null>(null)
  const [newName, setNewName] = useState('')

  const handleForkNew = () => {
    const v = versions.length + 1
    setVersions((prev) => [{ key: `v${v}`, label: `新复刻 v${v}`, forkedAt: '刚刚',
      sourceVersion: '班级图谱 v45', description: '基于当前班级图谱最新版本的 Fork 副本', nodeCount: 50 }, ...prev])
    message.success('新私人图谱已创建')
  }

  const handleForkFromGraph = (source: GraphVersion) => {
    const v = versions.length + 1
    setVersions((prev) => [{ key: `v${v}`, label: `${source.label} 的副本`, forkedAt: '刚刚',
      sourceVersion: `我的图谱 ${source.key}`, description: `基于私人图谱「${source.label}」的 Fork 副本`, nodeCount: source.nodeCount }, ...prev])
    message.success(`已从「${source.label}」复刻新版本`)
  }

  const handleOpenRename = (key: string, label: string) => {
    setRenameModal({ key, label })
    setNewName(label)
  }

  const handleRename = () => {
    if (!newName.trim() || !renameModal) return
    setVersions((prev) => prev.map((v) => v.key === renameModal.key ? { ...v, label: newName.trim() } : v))
    message.success('重命名成功')
    setRenameModal(null)
  }

  const handleDelete = (key: string, label: string) => {
    Modal.confirm({ title: '确认删除',
      content: `确定要删除私人图谱「${label}」吗？此操作不可恢复。`,
      okText: '删除', cancelText: '取消', okButtonProps: { danger: true },
      onOk: () => { setVersions((prev) => prev.filter((v) => v.key !== key)); message.success('已删除') } })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>我的图谱</h3>
        <Button type="primary" icon={<ForkOutlined />} onClick={handleForkNew}>复刻新版本</Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {versions.map((v) => (
          <div key={v.key} style={{ padding: '16px 20px', background: '#fff', border: '0.5px solid var(--color-border)', borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{v.label}</div>
                <div style={{ fontSize: 12, color: '#999' }}>基于 {v.sourceVersion} · {v.forkedAt} · {v.nodeCount} 个节点</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Tag color="purple">{v.key}</Tag>
                <Button size="small" type="primary" icon={<EditOutlined />}
                  onClick={() => navigate(`/student/courses/course-1/my-graphs/${v.key}`)}>编辑</Button>
                <Dropdown menu={{
                  items: [
                    { key: 'fork', label: '复刻', icon: <ForkOutlined /> },
                    { key: 'rename', label: '重命名', icon: <EditOutlined /> },
                    { type: 'divider' as const },
                    { key: 'delete', label: '删除', icon: <DeleteOutlined />, danger: true },
                  ],
                  onClick: ({ key }) => {
                    if (key === 'fork') handleForkFromGraph(v)
                    if (key === 'rename') handleOpenRename(v.key, v.label)
                    if (key === 'delete') handleDelete(v.key, v.label)
                  },
                }} trigger={['click']}>
                  <Button size="small" icon={<MoreOutlined />} style={{ width: 28, padding: 0 }} />
                </Dropdown>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 0, lineHeight: 1.5 }}>{v.description}</p>
          </div>
        ))}
      </div>

      <Modal title="重命名" open={!!renameModal}
        onCancel={() => setRenameModal(null)} onOk={handleRename} okText="确认" cancelText="取消">
        <Input placeholder="输入新名称" value={newName}
          onChange={(e) => setNewName(e.target.value)} onPressEnter={handleRename} autoFocus />
      </Modal>
    </div>
  )
}

export default MyGraphsPage
