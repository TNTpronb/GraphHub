// 教师审核工作台 — GitHub 风格

import { useState } from 'react'
import { useSearchParams, useParams, useNavigate } from 'react-router-dom'
import { Select, Tag, Button, Drawer, Input, Space, message, Progress, Divider, Pagination } from 'antd'
import { CheckOutlined, CloseOutlined, SwapOutlined } from '@ant-design/icons'
import { mockPRItems } from '../../../api/mock/dashboard'
import type { PRItem } from '../../../api/mock/dashboard'

const statusConfig: Record<string, { color: string; label: string }> = {
  pending:  { color: '#D4A72C', label: '待审核' },
  approved: { color: '#1A7F1A', label: '已通过' },
  rejected: { color: '#CF222E', label: '已打回' },
}
const scoreColor = (s: number) => s >= 80 ? 'var(--color-success)' : s >= 60 ? 'var(--color-warning)' : 'var(--color-danger)'

const ReviewWorkbench = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const isInCourse = !!courseId
  const [searchParams] = useSearchParams()
  const filterCourseId = isInCourse ? 'course-1' : (searchParams.get('courseId') || 'all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [courseFilter, setCourseFilter] = useState(filterCourseId)
  const [selectedPR, setSelectedPR] = useState<PRItem | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [reviewComment, setReviewComment] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const filtered = mockPRItems.filter((pr) => {
    if (statusFilter !== 'all' && pr.status !== statusFilter) return false
    if (courseFilter !== 'all' && !pr.courseName.includes(courseFilter === 'course-1' ? '数据结构' : courseFilter === 'course-2' ? '操作系统' : '')) return false
    return true
  })
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  const hStatusChange = (v: string) => { setStatusFilter(v); setPage(1) }
  const hCourseChange = (v: string) => { setCourseFilter(v); setPage(1) }

  return (
    <div>
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 24 }}>审核工作台</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '12px 16px', background: '#fff', borderRadius: 8, border: '0.5px solid var(--color-border)' }}>
        <Space>
          {!isInCourse && (
            <Select value={courseFilter} onChange={hCourseChange} style={{ width: 140 }}
              options={[{ value: 'all', label: '全部课程' }, { value: 'course-1', label: '数据结构' }, { value: 'course-2', label: '操作系统' }]} />
          )}
          <Select value={statusFilter} onChange={hStatusChange} style={{ width: 110 }}
            options={[{ value: 'all', label: '全部状态' }, { value: 'pending', label: '待审核' }, { value: 'approved', label: '已通过' }, { value: 'rejected', label: '已打回' }]} />
        </Space>
      </div>

      {paginated.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 8, border: '0.5px solid var(--color-border)', padding: 48, textAlign: 'center', color: '#999', fontSize: 14 }}>
          暂无待审核内容
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {paginated.map((pr) => {
            const st = statusConfig[pr.status]
            return (
              <div key={pr.id}
                onClick={() => { setSelectedPR(pr); setDrawerOpen(true); setReviewComment('') }}
                style={{
                  padding: '14px 16px', background: '#fff',
                  border: '0.5px solid var(--color-border)', borderRadius: 8,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  borderLeft: pr.aiReport?.riskLevel === 'high' ? '3px solid var(--color-danger)' : '3px solid transparent',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>#{pr.id}</span>
                    <Tag style={{ margin: 0, fontSize: 11 }}>{pr.changeSummary}</Tag>
                  </div>
                  <div style={{ fontSize: 12, color: '#999' }}>
                    {pr.submitter} · {pr.courseName} · {pr.createdAt}
                    {pr.aiScore !== null && (
                      <span style={{ color: scoreColor(pr.aiScore), marginLeft: 8, fontWeight: 600 }}>AI {pr.aiScore}</span>
                    )}
                  </div>
                </div>
                <Button size="small"
                  icon={<SwapOutlined />}
                  onClick={(e) => { e.stopPropagation(); navigate(`/teacher/courses/course-1/diff/${pr.id}`) }}
                  style={{ marginRight: 8 }}
                >对比</Button>
                <Tag style={{ color: st.color, background: `${st.color}15`, border: 'none', margin: 0 }}>{st.label}</Tag>
              </div>
            )
          })}
        </div>
      )}

      {filtered.length > pageSize && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Pagination current={page} pageSize={pageSize} total={filtered.length} onChange={setPage} simple />
        </div>
      )}

      <Drawer title={`PR #${selectedPR?.id} 详情`} open={drawerOpen} onClose={() => setDrawerOpen(false)} width={640}
        extra={selectedPR?.status === 'pending' && (
          <Space>
            <Button icon={<CloseOutlined />} danger>打回</Button>
            <Button type="primary" icon={<CheckOutlined />}>通过</Button>
          </Space>
        )}
      >
        {selectedPR && (
          <>
            <div style={{ marginBottom: 12 }}>
              <Tag style={{ marginRight: 8 }}>{selectedPR.changeSummary}</Tag>
              <span style={{ fontSize: 13, color: '#999' }}>{selectedPR.submitter} · {selectedPR.createdAt}</span>
            </div>
            <div style={{ padding: 8, background: '#FAFAFA', borderRadius: 6, marginBottom: 16, fontSize: 13, fontFamily: 'var(--font-mono)' }}>
              {selectedPR.diffPreview}
            </div>
            <Button size="small"
              icon={<SwapOutlined />}
              onClick={() => { setDrawerOpen(false); navigate(`/teacher/courses/course-1/diff/${selectedPR.id}`) }}
            >查看完整对比</Button>

            {selectedPR.aiReport && (
              <>
                <Divider />
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>AI 自动审查结果</div>
                <div style={{ textAlign: 'center', marginBottom: 12 }}>
                  <Progress type="dashboard" percent={selectedPR.aiScore || 0}
                    strokeColor={scoreColor(selectedPR.aiScore || 0)}
                    format={() => `${selectedPR.aiScore} 分`} size={100} />
                </div>
                <div style={{ padding: 12, background: '#FAFAFA', borderRadius: 6, marginBottom: 8 }}>
                  <span style={{ fontWeight: 500 }}>重复度：</span>{selectedPR.aiReport.duplicateCheck.score}%
                  {selectedPR.aiReport.duplicateCheck.similarNodes.length > 0 && (
                    <span style={{ color: '#D4A72C', marginLeft: 8 }}>疑似重复：{selectedPR.aiReport.duplicateCheck.similarNodes.join(', ')}</span>
                  )}
                </div>
                <div style={{ padding: 12, background: '#FAFAFA', borderRadius: 6, marginBottom: 8 }}>
                  <span style={{ fontWeight: 500 }}>内容质量：</span>{selectedPR.aiReport.contentQuality.score}%
                  {selectedPR.aiReport.contentQuality.issues.map((issue, i) => (
                    <div key={i} style={{ color: '#CF222E', fontSize: 12, marginTop: 4 }}>⚠ {issue}</div>
                  ))}
                </div>
                {selectedPR.aiReport.suggestions.length > 0 && (
                  <div style={{ padding: 12, background: '#F4F0FF', borderRadius: 6 }}>
                    <div style={{ fontWeight: 500, color: 'var(--color-primary)' }}>修改建议</div>
                    {selectedPR.aiReport.suggestions.map((s, i) => (
                      <div key={i} style={{ fontSize: 13, marginTop: 4 }}>· {s}</div>
                    ))}
                  </div>
                )}
              </>
            )}

            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>审核意见</div>
              <Input.TextArea rows={3} placeholder="输入审核意见" value={reviewComment} onChange={e => setReviewComment(e.target.value)} />
            </div>
          </>
        )}
      </Drawer>
    </div>
  )
}

export default ReviewWorkbench
