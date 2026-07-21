// 私人图谱编辑页 — 工作区标签页 + Pull 同步 + 冲突处理

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Tabs, Button, Space, message, Modal, Tag } from 'antd'
import { SearchOutlined, ExportOutlined, SendOutlined, ArrowLeftOutlined, SyncOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import GraphCanvas from '../../../components/graph/GraphCanvas'
import NoteDetailPanel from '../../../components/graph/NoteDetailPanel'
import ConflictPanel from '../../../components/pr/ConflictPanel'
import { useWorkspaceStore } from '../../../stores/workspaceStore'
import type { WorkspaceTab } from '../../../stores/workspaceStore'

const PrivateGraphEditor = () => {
  const { courseId, versionKey } = useParams()
  const navigate = useNavigate()
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const { tabs, activeKey, closeTab, setActiveKey } = useWorkspaceStore()

  useEffect(() => {
    useWorkspaceStore.setState({ tabs: [{ key: 'graph', label: '图谱', type: 'graph' }], activeKey: 'graph' })
  }, [])

  // ── Pull / 同步上游 ──
  const upstreamBehind = 3
  const upstreamChanged = 8
  const [pullModalOpen, setPullModalOpen] = useState(false)
  const [pullConflicts, setPullConflicts] = useState([
    { id: 'pc1', noteTitle: '快速排序', type: 'content' as const,
      mineVersion: '时间复杂度：O(n²)（最坏）', theirsVersion: 'O(n log n) 平均，O(n²) 最坏', resolved: false },
    { id: 'pc2', noteTitle: '堆排序', type: 'delete-modify' as const,
      mineVersion: '（你已删除该节点）', theirsVersion: '（班级图谱中新增了堆化代码示例）', resolved: false },
  ])

  const handlePull = () => setPullModalOpen(true)

  const handleConflictResolve = (id: string, res: 'mine' | 'theirs' | 'manual') => {
    setPullConflicts((prev) => prev.map((c) => c.id === id ? { ...c, resolved: true, resolution: res } : c))
  }

  const handlePullComplete = () => {
    setPullModalOpen(false)
    message.success('已同步班级图谱的最新变更')
  }

  const handleEdit = (key: string | React.MouseEvent | React.KeyboardEvent, action: 'add' | 'remove') => {
    if (action === 'remove') closeTab(key as string)
  }

  const renderTabContent = (tab: WorkspaceTab) => {
    switch (tab.type) {
      case 'graph':
        return (
          <div style={{ height: 'calc(100vh - 48px - 160px)' }}>
            <div style={{ display: 'flex', height: 'calc(100% - 0px)' }}>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '8px 12px 12px 0' }}>
                  <Space>
                    <Button icon={<SearchOutlined />} size="small">搜索节点</Button>
                    <Button icon={<ExportOutlined />} size="small">导出</Button>
                    <Button size="small" onClick={() => message.info('新增节点')}>新增节点</Button>
                    <Button icon={<SyncOutlined />} size="small" onClick={handlePull}>Pull</Button>
                    <Button type="primary" size="small" icon={<SendOutlined />}
                      onClick={() => navigate('/student/pr/new')}>提交 PR</Button>
                  </Space>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <GraphCanvas selectedNodeId={selectedNodeId}
                    onNodeClick={(nodeId) => setSelectedNodeId(nodeId || null)} readOnly={false} />
                </div>
              </div>
              <div style={{ width: 1, background: 'var(--color-border)', alignSelf: 'stretch' }} />
              <div style={{ width: 320, flexShrink: 0, overflow: 'auto' }}>
                <NoteDetailPanel nodeId={selectedNodeId} />
              </div>
            </div>
          </div>
        )
      case 'editor':
        return (
          <div style={{ padding: 16, height: 'calc(100vh - 160px)' }}>
            <div style={{ color: '#999', fontSize: 13, textAlign: 'center', paddingTop: 48 }}>
              Markdown 编辑器（{tab.label}）<br /><span style={{ fontSize: 12 }}>后续接入 ByteMD 编辑器</span>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const allResolved = pullConflicts.every((c) => c.resolved)

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4, paddingTop: 4 }}>
        <Button icon={<ArrowLeftOutlined />} size="small" onClick={() => navigate(-1)}>返回</Button>
        <span style={{ fontSize: 13, color: '#956BF5', fontWeight: 600 }}>{versionKey}</span>
        {upstreamBehind > 0 && (
          <Tag icon={<ExclamationCircleOutlined />} color="warning" style={{ cursor: 'pointer' }}
            onClick={handlePull}>
            班级图谱有更新（落后 {upstreamBehind} 版本，{upstreamChanged} 节点变更）
          </Tag>
        )}
      </div>
      <Tabs type="editable-card" activeKey={activeKey} onChange={setActiveKey} onEdit={handleEdit} hideAdd
        items={tabs.map((tab) => ({ key: tab.key, label: tab.label, closable: tab.key !== 'graph', children: renderTabContent(tab) }))} />

      {/* ── Pull / 同步上游弹窗 ── */}
      <Modal title="Pull · 同步班级图谱更新" open={pullModalOpen}
        onCancel={() => setPullModalOpen(false)}
        onOk={handlePullComplete} okText="完成同步" width={720}
        okButtonProps={{ disabled: !allResolved }}>
        <p style={{ marginBottom: 16, color: '#6B6B6B', fontSize: 13 }}>
          将班级图谱的最新变更合并到你的私人图谱中。以下内容存在冲突，请逐一解决：
        </p>
        <ConflictPanel
          conflicts={pullConflicts}
          onResolve={handleConflictResolve}
          onResolveAll={(res) => setPullConflicts((prev) => prev.map((c) => ({ ...c, resolved: true, resolution: res })))}
        />
      </Modal>
    </>
  )
}

export default PrivateGraphEditor
