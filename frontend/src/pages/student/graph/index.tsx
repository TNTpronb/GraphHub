// 学生图谱浏览页：只读模式 + Fork 按钮（树状列表在布局壳侧边栏中）

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Space } from 'antd'
import { SearchOutlined, ForkOutlined } from '@ant-design/icons'
import GraphCanvas from '../../../components/graph/GraphCanvas'
import NoteDetailPanel from '../../../components/graph/NoteDetailPanel'

const StudentGraphPage = () => {
  const navigate = useNavigate()
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  return (
    <div style={{ height: 'calc(100vh - 48px - 48px)' }}>
      <div style={{
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
        padding: '8px 0', marginBottom: 12,
      }}>
        <Space>
          <Button icon={<SearchOutlined />} size="small">搜索节点</Button>
          <Button type="primary" icon={<ForkOutlined />} size="small" onClick={handleFork}>
            Fork 复刻
          </Button>
        </Space>
      </div>

      <div style={{ display: 'flex', gap: 16, height: 'calc(100% - 48px)' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <GraphCanvas
            selectedNodeId={selectedNodeId}
            onNodeClick={(nodeId) => setSelectedNodeId(nodeId || null)}
            readOnly={true}
          />
        </div>
        <div style={{
          width: 320, flexShrink: 0, background: '#fff',
          border: '0.5px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)', overflow: 'auto',
        }}>
          <NoteDetailPanel nodeId={selectedNodeId} />
        </div>
      </div>
    </div>
  )
}

export default StudentGraphPage
