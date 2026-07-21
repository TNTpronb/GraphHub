// 学生 PR 详情页 — 查看现有 PR / 新建 PR（冲突仅展示，不审核）

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Tag, Input, Select, Timeline, message, Progress } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, SyncOutlined, WarningOutlined, SwapOutlined } from '@ant-design/icons'
import { mockPRItems } from '../../../api/mock/dashboard'
import DiffContent, { mockDiffFiles } from '../../../components/pr/DiffContent'

const statusConfig: Record<string, { color: string; label: string }> = {
  pending:  { color: '#D4A72C', label: '审核中' },
  approved: { color: '#1A7F1A', label: '已通过' },
  rejected: { color: '#CF222E', label: '已打回' },
}

const scoreLevel = (score: number) =>
  score >= 80 ? { text: '优秀', color: '#1A7F1A' }
    : score >= 60 ? { text: '良好', color: '#D4A72C' }
    : { text: '需改进', color: '#CF222E' }

const StudentPRPage = () => {
  const { prId } = useParams()
  const navigate = useNavigate()
  const isNew = prId === 'new'

  const existingPR = !isNew ? mockPRItems.find((p) => p.id === prId) : null

  const [changeType, setChangeType] = useState('note_add')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmitNew = async () => {
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1500))
    message.success('PR 提交成功！AI 自动审查中...')
    setSubmitting(false)
    navigate('/student/dashboard')
  }

  if (!isNew && !existingPR) {
    return <div style={{ textAlign: 'center', padding: 48, color: '#999' }}>PR 未找到</div>
  }

  if (!isNew && existingPR) {
    const st = statusConfig[existingPR.status]
    const lv = existingPR.aiScore ? scoreLevel(existingPR.aiScore) : null
    return (
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>PR #{existingPR.id}</h3>
          <Tag color={st.color === '#D4A72C' ? 'gold' : st.color === '#1A7F1A' ? 'green' : 'red'}>{st.label}</Tag>
        </div>

        <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '0.5px solid var(--color-border)', marginBottom: 16 }}>
          <Timeline items={[
            { color: 'green', children: <><strong>已提交</strong> — {existingPR.createdAt} * {existingPR.changeSummary}</> },
            ...(existingPR.aiScore !== null ? [{ color: existingPR.aiScore >= 80 ? 'green' : existingPR.aiScore >= 60 ? 'yellow' : 'red', children: <><strong>AI 审查完成</strong> — 综合评分 {existingPR.aiScore} 分</> }] : []),
            ...(existingPR.status === 'approved' ? [{ color: 'green', dot: <CheckCircleOutlined />, children: <><strong>审核通过</strong> — 已合入班级图谱</> }] : []),
            ...(existingPR.status === 'rejected' ? [{ color: 'red', dot: <CloseCircleOutlined />, children: <><strong>已打回</strong> — 请修改后重新提交</> }] : []),
            ...(existingPR.status === 'pending' ? [{ color: 'yellow', dot: <ClockCircleOutlined />, children: <><strong>等待教师审核</strong></> }] : []),
          ]} />
        </div>

        {existingPR.aiReport && (
          <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '0.5px solid var(--color-border)', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>AI 审查结果</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 16 }}>
              <Progress type="circle" percent={existingPR.aiScore || 0} size={72}
                strokeColor={lv?.color}
                format={() => <span style={{ fontSize: 18, fontWeight: 700, color: lv?.color }}>{existingPR.aiScore}</span>} />
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: lv?.color }}>{lv?.text}</div>
                <div style={{ fontSize: 12, color: '#999' }}>
                  {existingPR.aiReport.duplicateCheck.score}% 重复 · {existingPR.aiReport.contentQuality.score}% 内容质量
                </div>
              </div>
            </div>
            {existingPR.aiReport.suggestions.length > 0 && (
              <div style={{ padding: 12, background: '#F4F0FF', borderRadius: 6 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6, color: '#956BF5' }}>AI 建议</div>
                {existingPR.aiReport.suggestions.map((s, i) => (
                  <div key={i} style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 4 }}>* {s}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 变更对比（与学生 Diff 页相同的只读视图） */}
        <div style={{ height: 'calc(100vh - 48px - 380px)', minHeight: 300 }}>
          <DiffContent files={mockDiffFiles}
            header={null}
            footer={null}
            height="100%"
            conflictFooter={(currentFile) => {
            if (!currentFile.hasConflict || !currentFile.conflicts) return null
            return (
              <div style={{ padding: 16, borderTop: '1px solid var(--color-warning)' }}>
                <div style={{ padding: '8px 12px', background: '#FFF8E1', borderRadius: 6, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <WarningOutlined style={{ color: '#D4A72C', fontSize: 16 }} />
                  <span>此文件存在 <strong>{currentFile.conflicts.length}</strong> 个合并冲突，教师审核时将处理。</span>
                </div>
                {currentFile.conflicts.map((conflict, ci) => (
                  <div key={ci} style={{ marginBottom: 12, border: '0.5px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ padding: '8px 14px', fontWeight: 600, fontSize: 13, background: '#FAFAFA' }}>冲突 {ci + 1}: {conflict.title}</div>
                    <div style={{ display: 'flex' }}>
                      <div style={{ flex: 1, borderRight: '0.5px solid var(--color-border)' }}>
                        <div style={{ padding: '4px 12px', fontSize: 12, color: '#999', background: '#FAFAFA' }}>你的版本</div>
                        {conflict.ours.map((line, li) => <div key={li} style={{ padding: '2px 12px', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{line}</div>)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ padding: '4px 12px', fontSize: 12, color: '#999', background: '#FAFAFA' }}>班级图谱</div>
                        {conflict.theirs.map((line, li) => <div key={li} style={{ padding: '2px 12px', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{line}</div>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          }}
        />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {existingPR.status === 'rejected' && (
            <Button type="primary" icon={<SyncOutlined />} onClick={() => message.info('修改重提功能将在 V2.0 实现')}>修改重提</Button>
          )}
          <Button onClick={() => navigate(-1)}>返回</Button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 48px - 72px)' }}>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>提交 PR</h3>

      <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '0.5px solid var(--color-border)', marginBottom: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>变更类型</div>
          <Select value={changeType} onChange={setChangeType} style={{ width: 260 }}
            options={[
              { value: 'note_add', label: '新增节点' },
              { value: 'note_edit', label: '修改节点内容' },
              { value: 'edge_add', label: '新增关系' },
              { value: 'material_add', label: '补充资料' },
              { value: 'error_point_add', label: '补充易错点' },
            ]}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>提交说明</div>
          <Input.TextArea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="描述你的修改内容和理由..." />
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 300, marginBottom: 16 }}>
        <DiffContent files={mockDiffFiles} header={null} footer={null}
          height="100%"
          conflictFooter={(currentFile) => {
            if (!currentFile.hasConflict || !currentFile.conflicts) return null
            return (
              <div style={{ padding: 16, borderTop: '1px solid var(--color-warning)' }}>
                <div style={{ padding: '8px 12px', background: '#FFF8E1', borderRadius: 6, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <WarningOutlined style={{ color: '#D4A72C', fontSize: 16 }} />
                  <span>此文件存在 <strong>{currentFile.conflicts.length}</strong> 个合并冲突，教师审核时将处理。</span>
                </div>
                {currentFile.conflicts.map((conflict, ci) => (
                  <div key={ci} style={{ marginBottom: 12, border: '0.5px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ padding: '8px 14px', fontWeight: 600, fontSize: 13, background: '#FAFAFA' }}>冲突 {ci + 1}: {conflict.title}</div>
                    <div style={{ display: 'flex' }}>
                      <div style={{ flex: 1, borderRight: '0.5px solid var(--color-border)' }}>
                        <div style={{ padding: '4px 12px', fontSize: 12, color: '#999', background: '#FAFAFA' }}>你的版本</div>
                        {conflict.ours.map((line, li) => <div key={li} style={{ padding: '2px 12px', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{line}</div>)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ padding: '4px 12px', fontSize: 12, color: '#999', background: '#FAFAFA' }}>班级图谱</div>
                        {conflict.theirs.map((line, li) => <div key={li} style={{ padding: '2px 12px', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{line}</div>)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <Button type="primary" onClick={handleSubmitNew} loading={submitting} disabled={!description.trim()}>提交 PR</Button>
        <Button onClick={() => navigate(-1)}>取消</Button>
      </div>
    </div>
  )
}

export default StudentPRPage
