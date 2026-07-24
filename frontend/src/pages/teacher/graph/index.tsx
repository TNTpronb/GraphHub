// 教师图谱管理页 — 工作区标签页
// 默认"图谱"标签页显示网络图，双击树节点在新标签页打开编辑器

import { Tabs, Button, Space } from 'antd'
import { SearchOutlined, ExportOutlined, ForkOutlined } from '@ant-design/icons'
import GraphCanvas from '../../../components/graph/GraphCanvas'
import NoteDetailPanel from '../../../components/graph/NoteDetailPanel'
import { useWorkspaceStore } from '../../../stores/workspaceStore'
import { useGraphStore } from '../../../stores/graphStore'
import type { WorkspaceTab } from '../../../stores/workspaceStore'

const TeacherGraphPage = () => {
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId)
  const { tabs, activeKey, closeTab, setActiveKey } = useWorkspaceStore()
  const forkGraph = useGraphStore((s) => s.forkGraph)

  const handleEdit = (key: React.MouseEvent | React.KeyboardEvent | string, action: 'add' | 'remove') => {
    if (action === 'remove') {
      closeTab(key as string)
    }
  }

  const renderTabContent = (tab: WorkspaceTab) => {
    switch (tab.type) {
      case 'graph':
        return (
          <div style={{ height: 'calc(100vh - 48px - 120px)', display: 'flex' }}>
            {/* 渲染视口 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 0' }}>
                <Space>
                  <Button icon={<SearchOutlined />} size="small">搜索节点</Button>
                  <Button icon={<ExportOutlined />} size="small">导出</Button>
                  <Button icon={<ForkOutlined />} size="small" onClick={() => forkGraph()}>复制到我的图谱</Button>
                  <Button type="primary" size="small">新增节点</Button>
                </Space>
              </div>
              <div style={{ height: 'calc(100% - 44px)' }}>
                <GraphCanvas readOnly={false} />
              </div>
            </div>
            {/* 分割线 */}
            <div style={{ width: 1, background: 'var(--color-border)', margin: '0 16px', alignSelf: 'stretch' }} />
            {/* 预览区 */}
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
              <br />
              后续接入 ByteMD 编辑器
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
    <div>
      <style>{`.workspace-tabs .ant-tabs-nav { width: 100% !important; }`}</style>
      <Tabs
      type="editable-card"
      activeKey={activeKey}
      onChange={setActiveKey}
      onEdit={handleEdit}
      hideAdd
      tabBarStyle={{ marginBottom: 0, width: '100%' }}
      className="workspace-tabs"
      items={tabs.map((tab) => ({
        key: tab.key,
        label: tab.label,
        closable: tab.key !== 'graph',
        children: renderTabContent(tab),
      }))}
    />
    </div>
  )
}

export default TeacherGraphPage
