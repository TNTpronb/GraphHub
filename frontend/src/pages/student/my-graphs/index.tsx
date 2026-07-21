// 学生端：我的图谱 — 版本管理列表

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Tag, message, Modal } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, ForkOutlined } from '@ant-design/icons'

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

  const handleForkNew = () => {
    const v = versions.length + 1
    setVersions((prev) => [{
      key: `v${v}`, label: `新复刻 v${v}`,
      forkedAt: '刚刚', sourceVersion: '班级图谱 v45',
      description: '基于当前班级图谱最新版本的 Fork 副本', nodeCount: 50,
    }, ...prev])
    message.success('新私人图谱已创建')
  }

  const handleDelete = (key: string, label: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除私人图谱「${label}」吗？此操作不可恢复。`,
      okText: '删除', cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => {
        setVersions((prev) => prev.filter((v) => v.key !== key))
        message.success('已删除')
      },
    })
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>我的图谱</h3>
        <Button type="primary" icon={<ForkOutlined />} onClick={handleForkNew}>复刻新版本</Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {versions.map((v) => (
          <div key={v.key} style={{
            padding: '16px 20px', background: '#fff',
            border: '0.5px solid var(--color-border)', borderRadius: 8,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{v.label}</div>
                <div style={{ fontSize: 12, color: '#999' }}>
                  基于 {v.sourceVersion} · {v.forkedAt} · {v.nodeCount} 个节点
                </div>
              </div>
              <Tag color="purple">{v.key}</Tag>
            </div>
            <p style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 12, lineHeight: 1.5 }}>
              {v.description}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="small" type="primary" icon={<EditOutlined />}
                onClick={() => navigate(`/student/courses/course-1/my-graphs/${v.key}`)}>
                编辑
              </Button>
              <Button size="small" danger icon={<DeleteOutlined />}
                onClick={() => handleDelete(v.key, v.label)}>
                删除
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MyGraphsPage
