// 学生图谱浏览页 — 工作区标签页

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Tabs, Button, Space } from 'antd'
import { SearchOutlined, ForkOutlined } from '@ant-design/icons'
import GraphCanvas from '../../../components/graph/GraphCanvas'
import NoteDetailPanel from '../../../components/graph/NoteDetailPanel'
import { useWorkspaceStore } from '../../../stores/workspaceStore'
import type { WorkspaceTab } from '../../../stores/workspaceStore'

const StudentGraphPage = () => {
  const navigate = useNavigate()
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const { tabs, activeKey, openTab, closeTab, setActiveKey } = useWorkspaceStore()

  const handleFork = () => {
    navigate('/student/private-graph/private-graph-1')
  }

  const handleEdit = (key: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
    if (action === 'remove') closeTab(key as string)
  }

  const renderTabContent = (tab: WorkspaceTab) => {
    switch (tab.type) {
      case 'graph':
        return (
          <div style={{ height: 'calc(100vh - 48px - 120px)', display: 'flex' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 0' }}>
                <Space>
                  <Button icon={<SearchOutlined />} size="small">搜索节点</Button>
                  <Button type="primary" icon={<ForkOutlined />} size="small" onClick={handleFork}>
                    Fork 复刻
                  </Button>
                </Space>
              </div>
              <div style={{ height: 'calc(100% - 44px)' }}>
                <GraphCanvas
                  selectedNodeId={selectedNodeId}
                  onNodeClick={(nodeId) => setSelectedNodeId(nodeId || null)}
                  readOnly={true}
                />
              </div>
            </div>
            <div style={{ width: 1, background: 'var(--color-border)', margin: '0 16px', alignSelf: 'stretch' }} />
            <div style={{ width: 320, flexShrink: 0, overflow: 'auto', paddingTop: 44 }}>
              <NoteDetailPanel nodeId={selectedNodeId} />
            </div>
          </div>
        )
      case 'editor':
        return (
          <div style={{ padding: 16, height: 'calc(100vh - 160px)' }}>
            <div style={{ color: '#999', fontSize: 13, textAlign: 'center', paddingTop: 48 }}>
              Markdown 编辑器（{tab.label}）
            </div>
          </div>
        )
      case 'exercise':
        return (
          <div style={{ padding: 16, height: 'calc(100vh - 160px)' }}>
            <div style={{ color: '#999', fontSize: 13, textAlign: 'center', paddingTop: 48 }}>
              习题编辑器（{tab.label}）
            </div>
          </div>
        )
    }
  }

  return (
    <Tabs
      type="editable-card"
      activeKey={activeKey}
      onChange={setActiveKey}
      onEdit={handleEdit}
      hideAdd
      tabBarStyle={{ marginBottom: 0 }}
      style={{ marginTop: -16 }}
      items={tabs.map((tab) => ({
        key: tab.key,
        label: tab.label,
        closable: tab.key !== 'graph',
        children: renderTabContent(tab),
      }))}
      style={{ marginTop: -16 }}
    />
  )
}

export default StudentGraphPage
