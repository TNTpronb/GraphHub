// 教师审核工作台 — 简化为 GitHub 风格：一次人工审核，通过或打回

import { useState } from 'react'
import { useSearchParams, useParams } from 'react-router-dom'
import { Select, Tag, Button, Drawer, Input, Space, message, Progress, Divider, Pagination } from 'antd'
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

const ReviewWorkbench = () => {
  const { courseId } = useParams()
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

  const filteredPRs = mockPRItems.filter((pr) => {
    if (statusFilter !== 'all' && pr.status !== statusFilter) return false
    if (courseFilter !== 'all' && !pr.courseName.includes(
      courseFilter === 'course-1' ? '数据结构' : courseFilter === 'course-2' ? '操作系统' : ''
    )) return false
    return true
  })
  const paginatedPRs = filteredPRs.slice((page - 1) * pageSize, page * pageSize)

  // 筛选变化时回到第一页
  const handleStatusChange = (val: string) => { setStatusFilter(val); setPage(1) }
  const handleCourseChange = (val: string) => { setCourseFilter(val); setPage(1) }

  const handleApprove = () => {
    message.success(`PR #${selectedPR?.id} 已通过`)
    setDrawerOpen(false)
  }

  const handleReject = () => {
    message.success(`PR #${selectedPR?.id} 已打回`)
    setDrawerOpen(false)
  }

  return (
    <div>
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 24 }}>审核工作台</h2>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 16, padding: '12px 16px',
        background: '#fff', borderRadius: 8, border: '0.5px solid var(--color-border)',
      }}>
        <Space>
          {!isInCourse && (
            <Select value={courseFilter} onChange={handleCourseChange} style={{ width: 140 }}
              options={[
                { value: 'all', label: '全部课程' },
                { value: 'course-1', label: '数据结构' },
                { value: 'course-2', label: '操作系统' },
              ]}
            />
          )}
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 110 }}
            options={[
              { value: 'all', label: '全部状态' },
              { value: 'pending', label: '待审核' },
              { value: 'approved', label: '已通过' },
              { value: 'rejected', label: '已打回' },
            ]}
          />
        </Space>
      </div>

      {paginatedPRs.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 8, border: '0.5px solid var(--color-border)', padding: 48, textAlign: 'center', color: '#999', fontSize: 14 }}>
          暂无待审核内容
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {paginatedPRs.map((pr) => {
            const status = statusConfig[pr.status]
            return (
              <div
                key={pr.id}
                onClick={() => { setSelectedPR(pr); setDrawerOpen(true); setReviewComment('') }}
                style={{
                  padding: '14px 16px', background: '#fff',
                  border: '0.5px solid var(--color-border)', borderRadius: 8,
                  cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', transition: 'border-color 0.15s',
                  borderLeft: pr.aiReport?.riskLevel === 'high'
                    ? '3px solid var(--color-danger)'
                    : '3px solid transparent',
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
                      <span style={{ color: scoreColor(pr.aiScore), marginLeft: 8, fontWeight: 600 }}>
                        AI 评分 {pr.aiScore}
                      </span>
                    )}
                  </div>
                </div>
                <Tag style={{ margin: 0, marginLeft: 12, color: status.color, background: `${status.color}15`, border: 'none' }}>
                  {status.label}
                </Tag>
              </div>
            )
          })}
        </div>
      )}
      {filteredPRs.length > pageSize && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={filteredPRs.length}
            onChange={setPage}
            simple
          />
        </div>
      )}

      <Drawer
        title={`PR #${selectedPR?.id} 详情`}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={640}
        extra={
          selectedPR?.status === 'pending' && (
            <Space>
              <Button icon={<CloseOutlined />} danger onClick={handleReject}>打回</Button>
              <Button type="primary" icon={<CheckOutlined />} onClick={handleApprove}>通过</Button>
            </Space>
          )
        }
      >
        {selectedPR && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: '#999', marginBottom: 4 }}>提交人</div>
              <div style={{ fontWeight: 500 }}>{selectedPR.submitter}</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: '#999', marginBottom: 4 }}>变更摘要</div>
              <Tag>{selectedPR.changeSummary}</Tag>
            </div>

            <div style={{
              fontSize: 13, color: '#999', marginBottom: 8,
              padding: '12px 0', borderTop: '0.5px solid var(--color-border)', borderBottom: '0.5px solid var(--color-border)',
            }}>
              {selectedPR.diffPreview}
            </div>

            {selectedPR.aiReport && (
              <>
                <Divider style={{ borderColor: 'var(--color-border)' }} />
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>AI 自动审查结果（提交时已生成）</div>

                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <Progress
                    type="dashboard"
                    percent={selectedPR.aiScore || 0}
                    strokeColor={scoreColor(selectedPR.aiScore || 0)}
                    format={() => `${selectedPR.aiScore} 分`}
                    size={120}
                  />
                </div>

                <div style={{ padding: 12, background: '#FAFAFA', borderRadius: 6, marginBottom: 8 }}>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>重复度检测</div>
                  <div>相似度评分：{selectedPR.aiReport.duplicateCheck.score}%</div>
                  {selectedPR.aiReport.duplicateCheck.similarNodes.length > 0 && (
                    <div style={{ color: 'var(--color-warning)', marginTop: 4 }}>
                      疑似重复节点：{selectedPR.aiReport.duplicateCheck.similarNodes.join(', ')}
                    </div>
                  )}
                </div>

                <div style={{ padding: 12, background: '#FAFAFA', borderRadius: 6, marginBottom: 8 }}>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>内容质量评估</div>
                  <div>质量评分：{selectedPR.aiReport.contentQuality.score}%</div>
                  {selectedPR.aiReport.contentQuality.issues.map((issue, i) => (
                    <div key={i} style={{ color: 'var(--color-danger)', fontSize: 13, marginTop: 4 }}>⚠ {issue}</div>
                  ))}
                </div>

                {selectedPR.aiReport.suggestions.length > 0 && (
                  <div style={{ padding: 12, background: '#F4F0FF', borderRadius: 6 }}>
                    <div style={{ fontWeight: 500, marginBottom: 4, color: 'var(--color-primary)' }}>AI 修改建议</div>
                    {selectedPR.aiReport.suggestions.map((s, i) => (
                      <div key={i} style={{ fontSize: 13, marginTop: 4 }}>· {s}</div>
                    ))}
                  </div>
                )}
              </>
            )}

            {selectedPR.status === 'pending' && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>审核意见</div>
                <Input.TextArea
                  rows={3}
                  placeholder="输入审核意见（打回时建议说明原因）"
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                />
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default ReviewWorkbench
