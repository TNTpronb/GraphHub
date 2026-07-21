// 学生 PR 详情页 — 查看现有 PR / 新建 PR

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Tag, Input, Select, Timeline, message } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, SyncOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { mockPRItems } from '../../../api/mock/dashboard'

const statusConfig: Record<string, { color: string; label: string }> = {
  pending:  { color: '#D4A72C', label: '审核中' },
  approved: { color: '#1A7F1A', label: '已通过' },
  rejected: { color: '#CF222E', label: '已打回' },
}

const StudentPRPage = () => {
  const { prId } = useParams()
  const navigate = useNavigate()
  const isNew = prId === 'new'

  // ── 查看已有 PR ──
  const existingPR = !isNew ? mockPRItems.find((p) => p.id === prId) : null

  // ── 新建 PR 状态 ──
  const [changeType, setChangeType] = useState('note_add')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // ── 冲突模拟 ──
  const [conflicts, setConflicts] = useState(isNew ? [
    {
      id: 'c1',
      title: '快速排序',
      type: 'content',
      mine: '时间复杂度：O(n²)（最坏）',
      theirs: '时间复杂度：O(n²)最坏，Ω(n log n)最好，O(n log n)平均',
      resolved: false,
    },
    {
      id: 'c2',
      title: '堆排序',
      type: 'delete-modify',
      mine: '（你已删除该节点）',
      theirs: '（公有图谱中新增了堆化过程代码示例）',
      resolved: false,
    },
    {
      id: 'c3',
      title: '快速排序 — 标签',
      type: 'tags',
      mine: '#knowledge-point',
      theirs: '#knowledge-point, #algorithm-case',
      resolved: false,
    },
  ] : [])
  const resolvedMap = Object.fromEntries(conflicts.map((c) => [c.id, c.resolved]))
  const allResolved = Object.values(resolvedMap).every(Boolean)

  const handleResolve = (cid: string, side: 'ours' | 'theirs') => {
    setConflicts((prev) => prev.map((c) => (c.id === cid ? { ...c, resolved: true } : c)))
  }

  const handleSubmitNew = async () => {
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1500))
    message.success('PR 提交成功！AI 自动审查中...')
    setSubmitting(false)
    navigate('/student/dashboard')
  }

  // ════════════════════════════════════════════════
  //  变体 A：查看已有 PR
  // ════════════════════════════════════════════════
  if (!isNew && !existingPR) {
    return <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>PR 未找到</div>
  }

  if (!isNew && existingPR) {
    const st = statusConfig[existingPR.status]
    return (
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
            PR #{existingPR.id}
          </h3>
          <Tag color={st.color === '#D4A72C' ? 'gold' : st.color === '#1A7F1A' ? 'green' : 'red'}
            style={{ fontSize: 13 }}>{st.label}</Tag>
        </div>

        {/* 状态时间轴 */}
        <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '0.5px solid var(--color-border)', marginBottom: 16 }}>
          <Timeline
            items={[
              { color: 'green', children: <><strong>已提交</strong> — {existingPR.createdAt} · {existingPR.changeSummary}</> },
              ...(existingPR.aiScore !== null ? [{
                color: existingPR.aiScore >= 80 ? 'green' : existingPR.aiScore >= 60 ? 'yellow' : 'red',
                children: <><strong>AI 自动审查完成</strong> — 综合评分 {existingPR.aiScore} 分</>,
              }] : []),
              ...(existingPR.status === 'approved' ? [{
                color: 'green', dot: <CheckCircleOutlined />,
                children: <><strong>审核通过</strong> — 已合入班级图谱</>,
              }] : []),
              ...(existingPR.status === 'rejected' ? [{
                color: 'red', dot: <CloseCircleOutlined />,
                children: <><strong>已打回</strong> — 请根据审核意见修改后重新提交</>,
              }] : []),
              ...(existingPR.status === 'pending' ? [{
                color: 'yellow', dot: <ClockCircleOutlined />,
                children: <><strong>等待教师审核</strong></>,
              }] : []),
            ]}
          />
        </div>

        {/* AI 审核结果 */}
        {existingPR.aiReport && (
          <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '0.5px solid var(--color-border)', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>AI 审查结果</div>
            <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ flex: 1, padding: 12, background: '#FAFAFA', borderRadius: 6, textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: existingPR.aiScore && existingPR.aiScore >= 80 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                  {existingPR.aiScore}
                </div>
                <div style={{ fontSize: 12, color: '#999' }}>综合评分</div>
              </div>
              <div style={{ flex: 2, padding: 12, background: '#FAFAFA', borderRadius: 6 }}>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>修改建议</div>
                {existingPR.aiReport.suggestions.map((s, i) => (
                  <div key={i} style={{ fontSize: 13, marginBottom: 4 }}>· {s}</div>
                ))}
                {existingPR.aiReport.contentQuality.issues.map((issue, i) => (
                  <div key={`i-${i}`} style={{ fontSize: 13, color: '#CF222E', marginBottom: 4 }}>⚠ {issue}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Diff 预览 */}
        <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '0.5px solid var(--color-border)', marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>变更内容</div>
          <pre style={{
            background: '#FAFAFA', padding: 12, borderRadius: 6,
            fontSize: 12, fontFamily: 'var(--font-mono)',
            lineHeight: 1.8, whiteSpace: 'pre-wrap',
          }}>
            {existingPR.diffPreview}
          </pre>
        </div>

        {/* 操作 */}
        <div style={{ display: 'flex', gap: 8 }}>
          {existingPR.status === 'rejected' && (
            <Button type="primary" icon={<SyncOutlined />}
              onClick={() => message.info('修改重提功能将在 V2.0 实现')}>修改重提</Button>
          )}
          <Button onClick={() => navigate(-1)}>返回</Button>
        </div>
      </div>
    )
  }

  // ════════════════════════════════════════════════
  //  变体 B：新建 PR
  // ════════════════════════════════════════════════
  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>提交 PR</h3>

      {/* 冲突检测摘要 */}
      {conflicts.length > 0 && (
        <div style={{
          padding: 16, background: '#FFF8E1', borderRadius: 8,
          border: '0.5px solid var(--color-warning)', marginBottom: 16,
        }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: '#D4A72C' }}>
            ⚠ 检测到 {conflicts.length} 个冲突
          </div>
          {conflicts.map((c) => (
            <div key={c.id} style={{
              padding: 12, background: '#fff', borderRadius: 6, marginBottom: 8,
              border: c.resolved ? '0.5px solid var(--color-success)' : '0.5px solid var(--color-danger)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <ExclamationCircleOutlined style={{ color: 'var(--color-danger)' }} />
                <Tag color={c.type === 'delete-modify' ? 'red' : c.type === 'tags' ? 'purple' : 'orange'}>
                  {c.type === 'content' ? '内容冲突' : c.type === 'tags' ? '标签冲突' : '删除-修改冲突'}
                </Tag>
                <span style={{ fontWeight: 500 }}>{c.title}</span>
                {c.resolved && <Tag color="success" style={{ marginLeft: 'auto' }}>已解决</Tag>}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1, padding: 8, background: '#E8F5E9', borderRadius: 4, fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>我的版本</div>
                  <div>{c.mine}</div>
                </div>
                <div style={{ flex: 1, padding: 8, background: '#FFF3E0', borderRadius: 4, fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>公有图谱当前版本</div>
                  <div>{c.theirs}</div>
                </div>
              </div>
              {!c.resolved && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <Button size="small" onClick={() => handleResolve(c.id, 'ours')}>保留我的</Button>
                  <Button size="small" type="primary" onClick={() => handleResolve(c.id, 'theirs')}>采用对方的</Button>
                  <Button size="small" onClick={() => message.info('手动合并功能将在 Markdown 编辑器中实现')}>手动合并</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 提交表单 */}
      <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '0.5px solid var(--color-border)', marginBottom: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>变更类型</div>
          <Select value={changeType} onChange={setChangeType} style={{ width: 260 }}
            options={[
              { value: 'note_add', label: '新增节点' },
              { value: 'note_edit', label: '修改节点内容' },
              { value: 'edge_add', label: '新增关系' },
              { value: 'edge_edit', label: '修改关系' },
              { value: 'material_add', label: '补充资料' },
              { value: 'error_point_add', label: '补充易错点' },
            ]}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>提交说明</div>
          <Input.TextArea rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="描述你的修改内容和理由..." />
        </div>
      </div>

      {/* 变更预览 */}
      <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '0.5px solid var(--color-border)', marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>变更预览</div>
        <pre style={{
          background: '#FAFAFA', padding: 12, borderRadius: 6,
          fontSize: 12, fontFamily: 'var(--font-mono)',
          lineHeight: 1.8, whiteSpace: 'pre-wrap',
        }}>
          {'+ 新增节点 "红黑树"（定义、性质、旋转操作、时间复杂度）\n+ 添加前置依赖关系：二叉搜索树 → 红黑树'}
        </pre>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Button type="primary" onClick={handleSubmitNew} loading={submitting}
          disabled={!allResolved || !description.trim()}>
          提交 PR
        </Button>
        <Button onClick={() => navigate(-1)}>取消</Button>
      </div>
    </div>
  )
}

export default StudentPRPage
