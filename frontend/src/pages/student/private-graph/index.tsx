// 学生私人图谱编辑器

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Space, Tag, Modal, message } from 'antd'
import { ArrowLeftOutlined, SyncOutlined, SendOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import GraphCanvas from '../../../components/graph/GraphCanvas'
import NoteDetailPanel from '../../../components/graph/NoteDetailPanel'
import ConflictPanel from '../../../components/pr/ConflictPanel'

const PrivateGraphEditor = () => {
  const { graphId } = useParams()
  const navigate = useNavigate()
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  // 上游同步状态（模拟）
  const upstreamBehind = 3    // 落后上游 3 个版本
  const upstreamChangedNodes = 8

  // Rebase 弹窗
  const [rebaseOpen, setRebaseOpen] = useState(false)

  // Rebase 冲突（模拟）
  const [rebaseConflicts, setRebaseConflicts] = useState([
    { id: 'rb1', noteTitle: '快速排序', type: 'content' as const,
      mineVersion: 'O(n²) 最坏', theirsVersion: 'O(n log n) 平均，O(n²) 最坏',
      resolved: false },
  ])

  const handleRebaseResolve = (id: string, res: 'mine' | 'theirs' | 'manual') => {
    setRebaseConflicts((prev) => prev.map((c) => (c.id === id ? { ...c, resolved: true, resolution: res } : c)))
  }

  const handleRebaseComplete = () => {
    setRebaseOpen(false)
    message.success('已同步上游变更')
  }

  // 提交 PR
  const handleSubmitPR = () => {
    navigate('/student/pr/new')
  }

  return (
    <div style={{ height: 'calc(100vh - 48px - 48px)' }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 0', marginBottom: 12,
      }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate(-1)}>
            返回班级图谱
          </Button>
          {/* ★ 上游同步状态 */}
          {upstreamBehind > 0 && (
            <Tag icon={<ExclamationCircleOutlined />} color="warning" style={{ cursor: 'pointer' }}
              onClick={() => setRebaseOpen(true)}>
              上游有新版本（落后 {upstreamBehind} 个版本，{upstreamChangedNodes} 个节点已变更）
            </Tag>
          )}
        </Space>
        <Space>
          {/* ★ Rebase 按钮 */}
          <Button icon={<SyncOutlined />} onClick={() => setRebaseOpen(true)}>
            同步上游
          </Button>
          {/* ★ 提交 PR */}
          <Button type="primary" icon={<SendOutlined />} onClick={handleSubmitPR}>
            提交 PR
          </Button>
        </Space>
      </div>

      {/* ── 图谱 + 详情面板（与教师图谱页结构相同） ── */}
      <div style={{ display: 'flex', gap: 16, height: 'calc(100% - 48px)' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <GraphCanvas
            selectedNodeId={selectedNodeId}
            onNodeClick={(nodeId) => setSelectedNodeId(nodeId || null)}
            readOnly={false}
          />
        </div>
        <div style={{ width: 320, flexShrink: 0, background: '#fff', borderRadius: 8, border: '0.5px solid var(--color-border)', overflow: 'auto' }}>
          <NoteDetailPanel nodeId={selectedNodeId} />
        </div>
      </div>

      {/* ★ Rebase 弹窗 */}
      <Modal
        title="同步上游变更"
        open={rebaseOpen}
        onCancel={() => setRebaseOpen(false)}
        onOk={handleRebaseComplete}
        okText="完成同步"
        width={720}
        okButtonProps={{ disabled: rebaseConflicts.some((c) => !c.resolved) }}
      >
        <p style={{ marginBottom: 16, color: 'var(--color-text-secondary)', fontSize: 13 }}>
          将公有图谱的最新变更合并到你的私人图谱中。以下内容存在冲突，请逐一解决：
        </p>
        <ConflictPanel
          conflicts={rebaseConflicts}
          onResolve={handleRebaseResolve}
          onResolveAll={(res) => setRebaseConflicts((prev) => prev.map((c) => ({ ...c, resolved: true, resolution: res })))}
        />
      </Modal>
    </div>
  )
}

export default PrivateGraphEditor