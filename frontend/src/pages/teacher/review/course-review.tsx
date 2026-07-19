// 课程审核页（教师端）— 仅显示本课程 PR

import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Drawer, Input, Space, message, Progress, Divider, Select, Tag } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { mockPRItems } from '../../../api/mock/dashboard'
import type { PRItem } from '../../../api/mock/dashboard'

const statusConfig: Record<string, { color: string; label: string }> = {
  pending:  { color: '#D4A72C', label: '待审核' },
  approved: { color: '#1A7F1A', label: '已通过' },
  rejected: { color: '#CF222E', label: '已打回' },
}
const scoreColor = (score: number) =>
  score >= 80 ? 'var(--color-success)' : score >= 60 ? 'var(--color-warning)' : 'var(--color-danger)'

const CourseReviewPage = () => {
  const { courseId } = useParams()
  const [statusFilter, setStatusFilter] = useState('pending')
  const [selectedPR, setSelectedPR] = useState<PRItem | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [reviewComment, setReviewComment] = useState('')

  // 过滤本课程 PR
  const coursePRs = mockPRItems.filter((pr) => {
    const matchCourse = pr.courseName === '数据结构' // TODO: 根据 courseId 匹配
    if (statusFilter !== 'all' && pr.status !== statusFilter) return false
    return matchCourse
  })

  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>课程审核</h3>
      <div style={{ marginBottom: 16 }}>
        <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 120 }}
          options={[
            { value: 'pending', label: '待审核' },
            { value: 'approved', label: '已通过' },
            { value: 'rejected', label: '已打回' },
            { value: 'all', label: '全部' },
          ]}
        />
      </div>

      {coursePRs.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#999', padding: 48, background: '#fff', borderRadius: 8, border: '0.5px solid var(--color-border)' }}>
          暂无{statusFilter === 'all' ? '' : statusConfig[statusFilter]?.label}PR
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {coursePRs.map((pr) => {
            const st = statusConfig[pr.status]
            return (
              <div key={pr.id}
                onClick={() => { setSelectedPR(pr); setDrawerOpen(true); setReviewComment('') }}
                style={{
                  padding: '12px 16px', background: '#fff', cursor: 'pointer',
                  border: '0.5px solid var(--color-border)', borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  borderLeft: pr.aiReport?.riskLevel === 'high' ? '3px solid var(--color-danger)' : '3px solid transparent',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
              >
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 2 }}>
                    #{pr.id} {pr.changeSummary}
                  </div>
                  <div style={{ fontSize: 12, color: '#999' }}>
                    {pr.submitter} · {pr.createdAt}
                    {pr.aiScore !== null && (
                      <span style={{ color: scoreColor(pr.aiScore), marginLeft: 8, fontWeight: 600 }}>
                        AI {pr.aiScore}
                      </span>
                    )}
                  </div>
                </div>
                <Tag style={{ color: st.color, background: `${st.color}15`, border: 'none', margin: 0 }}>
                  {st.label}
                </Tag>
              </div>
            )
          })}
        </div>
      )}

      <Drawer
        title={`PR #${selectedPR?.id}`}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={640}
        extra={selectedPR?.status === 'pending' && (
          <Space>
            <Button icon={<CloseOutlined />} danger onClick={() => setDrawerOpen(false)}>打回</Button>
            <Button type="primary" icon={<CheckOutlined />} onClick={() => setDrawerOpen(false)}>通过</Button>
          </Space>
        )}
      >
        {selectedPR && (
          <>
            <div style={{ marginBottom: 12 }}>
              <Tag style={{ marginRight: 8 }}>{selectedPR.changeSummary}</Tag>
              <span style={{ fontSize: 13, color: '#999' }}>{selectedPR.submitter} · {selectedPR.createdAt}</span>
            </div>
            <div style={{ padding: '8px 12px', background: '#FAFAFA', borderRadius: 6, marginBottom: 16, fontSize: 13 }}>
              {selectedPR.diffPreview}
            </div>
            {selectedPR.aiReport && (
              <>
                <Divider />
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>AI 自动审查</div>
                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                  <Progress type="dashboard" percent={selectedPR.aiScore || 0}
                    strokeColor={scoreColor(selectedPR.aiScore || 0)}
                    format={() => `${selectedPR.aiScore} 分`} size={100} />
                </div>
                <div style={{ padding: 10, background: '#FAFAFA', borderRadius: 6, marginBottom: 8 }}>
                  <span style={{ fontWeight: 500 }}>重复度 </span>
                  <span>{selectedPR.aiReport.duplicateCheck.score}%</span>
                </div>
                <div style={{ padding: 10, background: '#FAFAFA', borderRadius: 6, marginBottom: 8 }}>
                  <span style={{ fontWeight: 500 }}>内容质量 </span>
                  <span>{selectedPR.aiReport.contentQuality.score}%</span>
                  {selectedPR.aiReport.contentQuality.issues.map((issue, i) => (
                    <div key={i} style={{ color: '#CF222E', fontSize: 12, marginTop: 4 }}>⚠ {issue}</div>
                  ))}
                </div>
              </>
            )}
            {selectedPR.status === 'pending' && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>审核意见</div>
                <Input.TextArea rows={3} placeholder="输入审核意见" value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)} />
              </div>
            )}
          </>
        )}
      </Drawer>
    </div>
  )
}

export default CourseReviewPage
