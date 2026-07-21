// 私人图谱编辑页 — 工作区标签页 + Pull 同步 + 冲突处理

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Tabs, Button, Space, message, Modal, Tag, Input, Progress } from 'antd'
import { SearchOutlined, ExportOutlined, SendOutlined, ArrowLeftOutlined, SyncOutlined, ExclamationCircleOutlined, SaveOutlined, CheckCircleOutlined, WarningOutlined, CloseCircleOutlined } from '@ant-design/icons'
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

  // ── Git commit 风格保存 ──
  const [saveModal, setSaveModal] = useState(false)
  const [commitMessage, setCommitMessage] = useState('')
  const [saved, setSaved] = useState(false)

  // ── 提交 PR + AI 审查 ──
  const [prModal, setPrModal] = useState(false)
  const [prSubmitting, setPrSubmitting] = useState(false)
  const [aiReviewDone, setAiReviewDone] = useState(false)
  const [aiReport, setAiReport] = useState<{
    score: number
    passed: { label: string; detail: string; score: number }[]
    warnings: { label: string; detail: string; score: number }[]
    conflicts: { title: string; desc: string }[]
    suggestions: string[]
  } | null>(null)

  const scoreLevel = aiReport
    ? aiReport.score >= 80 ? { text: '优秀', color: '#1A7F1A' }
    : aiReport.score >= 60 ? { text: '良好', color: '#D4A72C' }
    : { text: '需改进', color: '#CF222E' }
    : { text: '', color: '' }

  const handleSubmitPR = () => {
    setPrModal(true)
    setAiReviewDone(false)
    setAiReport(null)
    setPrSubmitting(true)
    // 模拟 AI 审查
    setTimeout(() => {
      setAiReport({
        score: 78,
        passed: [
          { label: '重复度检测', detail: '未发现重复节点', score: 98 },
          { label: '标签规范', detail: '所有标签符合规范', score: 100 },
        ],
        warnings: [
          { label: '内容质量', detail: '缺少时间复杂度分析', score: 72 },
          { label: '表述一致性', detail: '与已有节点「排序算法比较」表述不完全一致', score: 65 },
        ],
        conflicts: [
          { title: '栈与队列.md · 应用场景', desc: '你的版本使用「常见应用」，班级图谱已更新为「应用场景」并新增了函数调用栈等内容' },
          { title: '快速排序.md · 标签', desc: '班级图谱已将该节点标签从 #knowledge-point 更新为 #knowledge-point, #algorithm-case' },
        ],
        suggestions: ['建议补充时间复杂度的平均情况和空间复杂度分析', '建议在提交前运行 Pull 同步班级图谱最新变更'],
      })
      setAiReviewDone(true)
      setPrSubmitting(false)
    }, 2000)
  }

  const handleConfirmPR = () => {
    setPrModal(false)
    navigate('/student/pr/new')
    message.success('PR 已提交，AI 审查完成，等待教师审核')
  }

  const handleSave = () => {
    if (!commitMessage.trim()) return
    setSaved(true)
    setSaveModal(false)
    setCommitMessage('')
    message.success('已保存更改')
  }

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
                    {!saved && <span style={{ fontSize: 11, color: '#D4A72C' }}>（未保存）</span>}
                    <Button size="small" icon={<SyncOutlined />} onClick={handlePull}>Pull</Button>
                    <Button size="small" type="primary" icon={<SaveOutlined />}
                      onClick={() => { setCommitMessage(''); setSaveModal(true) }}>保存</Button>
                    <Button size="small" type="primary" icon={<SendOutlined />}
                      onClick={handleSubmitPR} disabled={!saved}>提交 PR</Button>
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

      {/* ── Git commit 风格保存弹窗 ── */}
      <Modal title="保存更改" open={saveModal}
        onCancel={() => setSaveModal(false)} onOk={handleSave} okText="提交（保存）"
        okButtonProps={{ disabled: !commitMessage.trim() }} cancelText="取消">
        <p style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 12 }}>
          请输入本次更改的说明（必填）。
        </p>
        <Input.TextArea
          placeholder="例如：新增快速排序节点、修改栈的应用场景"
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          rows={3}
          autoFocus
        />
      </Modal>
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

      {/* ── 提交 PR + AI 审查弹窗 ── */}
      <Modal title="提交合并申请（PR）" open={prModal}
        onCancel={() => setPrModal(false)} width={600}
        footer={aiReviewDone ? [
          <Button key="cancel" onClick={() => setPrModal(false)}>取消</Button>,
          <Button key="confirm" type="primary" onClick={handleConfirmPR}>确认提交</Button>,
        ] : null}>
        {prSubmitting ? (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <div style={{ fontSize: 14, color: '#6B6B6B', marginBottom: 16 }}>AI 正在审查你的提交...</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: '#956BF5', animation: 'pulse 1.2s infinite' }} />
              <span style={{ width: 8, height: 8, borderRadius: 4, background: '#956BF5', animation: 'pulse 1.2s 0.2s infinite' }} />
              <span style={{ width: 8, height: 8, borderRadius: 4, background: '#956BF5', animation: 'pulse 1.2s 0.4s infinite' }} />
            </div>
          </div>
        ) : aiReport ? (
          <div>
            {/* 综合评分 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20, padding: '16px 20px', background: '#FAFAFA', borderRadius: 8 }}>
              <Progress type="circle" percent={aiReport.score} size={80}
                strokeColor={scoreLevel.color}
                format={() => <span style={{ fontSize: 20, fontWeight: 700, color: scoreLevel.color }}>{aiReport.score}</span>} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: scoreLevel.color, marginBottom: 2 }}>{scoreLevel.text}</div>
                <div style={{ fontSize: 13, color: '#6B6B6B' }}>
                  {aiReport.passed.length} 项通过 · {aiReport.warnings.length} 项需关注 · {aiReport.conflicts.length} 项冲突
                </div>
              </div>
            </div>

            {/* 通过检查 */}
            {aiReport.passed.length > 0 && (
              <div style={{ marginBottom: 12, border: '0.5px solid #E8F5E9', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ padding: '8px 16px', background: '#E8F5E9', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircleOutlined style={{ color: '#1A7F1A' }} /> 通过
                </div>
                {aiReport.passed.map((p, i) => (
                  <div key={i} style={{ padding: '10px 16px', borderTop: i > 0 ? '0.5px solid #E8F5E9' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13 }}>{p.label}</span>
                    <span style={{ fontSize: 12, color: '#999' }}>{p.detail}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 需关注 */}
            {aiReport.warnings.length > 0 && (
              <div style={{ marginBottom: 12, border: '0.5px solid #FFF3E0', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ padding: '8px 16px', background: '#FFF3E0', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <WarningOutlined style={{ color: '#D4A72C' }} /> 需关注
                </div>
                {aiReport.warnings.map((w, i) => (
                  <div key={i} style={{ padding: '10px 16px', borderTop: i > 0 ? '0.5px solid #FFF3E0' : 'none' }}>
                    <div style={{ fontSize: 13, marginBottom: 2 }}>{w.label}</div>
                    <div style={{ fontSize: 12, color: '#6B6B6B' }}>{w.detail}</div>
                  </div>
                ))}
              </div>
            )}

            {/* 待解决冲突 */}
            {aiReport.conflicts.length > 0 && (
              <div style={{ marginBottom: 12, border: '0.5px solid #FFEBE9', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ padding: '8px 16px', background: '#FFEBE9', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CloseCircleOutlined style={{ color: '#CF222E' }} /> 待解决（教师审核时处理）
                </div>
                {aiReport.conflicts.map((c, i) => (
                  <div key={i} style={{ padding: '10px 16px', borderTop: i > 0 ? '0.5px solid #FFEBE9' : 'none' }}>
                    <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: '#6B6B6B' }}>{c.desc}</div>
                  </div>
                ))}
              </div>
            )}

            {/* AI 建议 */}
            <div style={{ padding: 12, background: '#F4F0FF', borderRadius: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: '#956BF5' }}>AI 建议</div>
              {aiReport.suggestions.map((s, i) => (
                <div key={i} style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 4 }}>· {s}</div>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>
    </>
  )
}

export default PrivateGraphEditor
