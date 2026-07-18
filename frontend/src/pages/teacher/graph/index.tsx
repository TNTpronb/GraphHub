// 教师图谱管理页：网络图 + 右侧详情面板（树状列表在布局壳侧边栏中）

import { useState } from 'react'
import { Button, Space } from 'antd'
import { SearchOutlined, ExportOutlined } from '@ant-design/icons'
import GraphCanvas from '../../../components/graph/GraphCanvas'
import NoteDetailPanel from '../../../components/graph/NoteDetailPanel'

const TeacherGraphPage = () => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  return (
    <div style={{ height: 'calc(100vh - 48px - 48px)' }}>
      {/* 顶部工具栏 */}
      <div style={{
        display: 'flex', justifyContent: 'flex-end', alignItems: 'center',
        padding: '8px 0', marginBottom: 12,
      }}>
        <Space>
          <Button icon={<SearchOutlined />} size="small">搜索节点</Button>
          <Button icon={<ExportOutlined />} size="small">导出</Button>
          <Button type="primary" size="small">新增节点</Button>
        </Space>
      </div>

      {/* 主内容区：图谱 + 右侧详情面板 */}
      <div style={{ display: 'flex', gap: 16, height: 'calc(100% - 48px)' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <GraphCanvas
            selectedNodeId={selectedNodeId}
            onNodeClick={(nodeId) => setSelectedNodeId(nodeId || null)}
            readOnly={false}
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

export default TeacherGraphPage
