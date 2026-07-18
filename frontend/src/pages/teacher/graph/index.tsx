// src/pages/teacher/graph/index.tsx
// ★ 教师图谱管理页：左侧 G6 网路图 + 右侧详情面板

import { useState } from 'react'
import { Button, Space } from 'antd'
import {
  ApartmentOutlined,
  UnorderedListOutlined,
  SearchOutlined,
  ExportOutlined,
} from '@ant-design/icons'
import GraphCanvas from '../../../components/graph/GraphCanvas'
import NoteDetailPanel from '../../../components/graph/NoteDetailPanel'

/*
  页面布局：
  ┌─────────────────────────────────────────────────┐
  │ 工具栏：视图切换 | 搜索 | 筛选 | 新增 | 导出     │
  ├───────────────────────────┬─────────────────────┤
  │                           │                     │
  │    <GraphCanvas />        │  <NoteDetailPanel>  │
  │    (flex: 1)              │  (width: 320px)     │
  │                           │                     │
  └───────────────────────────┴─────────────────────┘
*/

const TeacherGraphPage = () => {
  // 当前选中的节点 ID
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  // 当前视图模式（预留：后续切换网络图/树状列表）
  const [viewMode, setViewMode] = useState<'graph' | 'tree'>('graph')

  return (
    <div style={{ height: 'calc(100vh - 48px - 48px)' }}>
      {/* ── 顶部工具栏 ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
        marginBottom: 12,
      }}>
        {/* 左侧：视图模式切换 */}
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

        {/* 右侧：操作按钮 */}
        <Space>
          <Button icon={<SearchOutlined />} size="small">
            搜索节点
          </Button>
          <Button icon={<ExportOutlined />} size="small">
            导出
          </Button>
          <Button type="primary" size="small">
            新增节点
          </Button>
        </Space>
      </div>

      {/* ── 主内容区：左右分栏 ── */}
      <div style={{
        display: 'flex',
        gap: 16,
        height: 'calc(100% - 48px)',
      }}>
        {/* 左侧：G6 图谱画布 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <GraphCanvas
            selectedNodeId={selectedNodeId}
            onNodeClick={(nodeId) => setSelectedNodeId(nodeId || null)}
            readOnly={false}
          />
        </div>

        {/* 右侧：节点详情面板 */}
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

export default TeacherGraphPage