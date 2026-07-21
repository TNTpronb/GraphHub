// 私人图谱编辑页 — 工作区标签页 + 图谱编辑（与教师端相同）

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Tabs, Button, Space, message } from 'antd'
import { SearchOutlined, ExportOutlined, SendOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import GraphCanvas from '../../../components/graph/GraphCanvas'
import NoteDetailPanel from '../../../components/graph/NoteDetailPanel'
import { useWorkspaceStore } from '../../../stores/workspaceStore'
import type { WorkspaceTab } from '../../../stores/workspaceStore'

const PrivateGraphEditor = () => {
  const { courseId, versionKey } = useParams()
  const navigate = useNavigate()
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const { tabs, activeKey, closeTab, setActiveKey } = useWorkspaceStore()

  // 重置工作区标签页
  useEffect(() => {
    useWorkspaceStore.setState({ tabs: [{ key: 'graph', label: '图谱', type: 'graph' }], activeKey: 'graph' })
  }, [])

  const handleEdit = (key: string | React.MouseEvent | React.KeyboardEvent, action: 'add' | 'remove') => {
    if (action === 'remove') closeTab(key as string)
  }

  const renderTabContent = (tab: WorkspaceTab) => {
    switch (tab.type) {
      case 'graph':
        return (
          <div style={{ height: 'calc(100vh - 48px - 160px)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0 12px' }}>
              <Space>
                <Button icon={<ArrowLeftOutlined />} size="small"
                  onClick={() => navigate(-1)}>返回</Button>
                <span style={{ fontSize: 13, color: '#956BF5', fontWeight: 600 }}>{versionKey}</span>
              </Space>
              <Space>
                <Button icon={<SearchOutlined />} size="small">搜索节点</Button>
                <Button icon={<ExportOutlined />} size="small">导出</Button>
                <Button size="small" onClick={() => message.info('新增节点')}>新增节点</Button>
                <Button type="primary" size="small" icon={<SendOutlined />}
                  onClick={() => navigate('/student/pr/new')}>提交 PR</Button>
              </Space>
            </div>
            <div style={{ display: 'flex', gap: 16, height: 'calc(100% - 44px)' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <GraphCanvas
                  selectedNodeId={selectedNodeId}
                  onNodeClick={(nodeId) => setSelectedNodeId(nodeId || null)}
                  readOnly={false}
                />
              </div>
              <div style={{
                width: 320, flexShrink: 0, background: '#fff',
                border: '0.5px solid var(--color-border)', borderRadius: 8, overflow: 'auto',
              }}>
                <NoteDetailPanel nodeId={selectedNodeId} />
              </div>
            </div>
          </div>
        )
      case 'editor':
        return (
          <div style={{ padding: 16, height: 'calc(100vh - 160px)' }}>
            <div style={{ color: '#999', fontSize: 13, textAlign: 'center', paddingTop: 48 }}>
              Markdown 编辑器（{tab.label}）
              <br />
              <span style={{ fontSize: 12 }}>后续接入 ByteMD 编辑器</span>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Tabs
      type="editable-card"
      activeKey={activeKey}
      onChange={setActiveKey}
      onEdit={handleEdit}
      hideAdd
      items={tabs.map((tab) => ({
        key: tab.key,
        label: tab.label,
        closable: tab.key !== 'graph',
        children: renderTabContent(tab),
      }))}
    />
  )
}

export default PrivateGraphEditor
