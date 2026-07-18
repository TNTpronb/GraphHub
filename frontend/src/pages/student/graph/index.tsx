// src/pages/student/graph/index.tsx
// 学生图谱浏览页：与教师页结构相同，但为只读模式 + Fork 按钮

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Space } from 'antd'
import {
  ApartmentOutlined,
  UnorderedListOutlined,
  SearchOutlined,
  ForkOutlined,
} from '@ant-design/icons'
import GraphCanvas from '../../../components/graph/GraphCanvas'
import NoteDetailPanel from '../../../components/graph/NoteDetailPanel'

const StudentGraphPage = () => {
  const navigate = useNavigate()
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'graph' | 'tree'>('graph')

  // Fork 操作：复刻班级图谱到私人空间
  const handleFork = () => {
    // 模拟创建私人图谱，跳转到私人图谱编辑页
    const mockGraphId = 'private-graph-1'
    navigate(`/student/private-graph/${mockGraphId}`)
  }

  return (
    <div style={{ height: 'calc(100vh - 48px - 48px)' }}>
      {/* ── 工具栏 ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
        marginBottom: 12,
      }}>
        <Space>
          <Button
            type={viewMode === 'graph' ? 'primary' : 'default'}
            icon={<ApartmentOutlined />}
            size="small"
            onClick={() => setViewMode('graph')}
          >
            网络图
          </Button>
          <Button
            type={viewMode === 'tree' ? 'primary' : 'default'}
            icon={<UnorderedListOutlined />}
            size="small"
            onClick={() => setViewMode('tree')}
          >
            树状列表
          </Button>
        </Space>

        <Space>
          <Button icon={<SearchOutlined />} size="small">
            搜索节点
          </Button>
          {/* ★ Fork 按钮：学生端独有 */}
          <Button
            type="primary"
            icon={<ForkOutlined />}
            size="small"
            onClick={handleFork}
          >
            Fork 复刻
          </Button>
        </Space>
      </div>

      {/* ── 左右分栏 ── */}
      <div style={{
        display: 'flex',
        gap: 16,
        height: 'calc(100% - 48px)',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <GraphCanvas
            selectedNodeId={selectedNodeId}
            onNodeClick={(nodeId) => setSelectedNodeId(nodeId || null)}
            readOnly={true}     // ● 只读模式：不可拖拽节点
          />
        </div>
        <div style={{
          width: 320,
          flexShrink: 0,
          background: '#fff',
          border: '0.5px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'auto',
        }}>
          <NoteDetailPanel nodeId={selectedNodeId} />
        </div>
      </div>
    </div>
  )
}

export default StudentGraphPage