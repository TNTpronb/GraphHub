// 学生首页：课程列表 + PR 状态 + 贡献概览

import { useNavigate } from 'react-router-dom'
import { Row, Col, Tag } from 'antd'
import { FireOutlined, TrophyOutlined } from '@ant-design/icons'
import { mockStudentCourses, mockStudentPRs, mockStudentStats } from '../../../api/mock/dashboard'

const StudentDashboard = () => {
  const navigate = useNavigate()
  const studentName = '张三'

  const statusConfig: Record<string, { color: string; label: string }> = {
    approved: { color: 'var(--color-success)', label: '已通过' },
    pending:  { color: 'var(--color-warning)', label: '审核中' },
    rejected: { color: 'var(--color-danger)',  label: '已打回' },
    draft:    { color: 'var(--color-text-tertiary)', label: '草稿' },
  }

  return (
    <div>
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 'var(--space-5)' }}>
        欢迎回来，{studentName}
      </h2>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {/* 我的课程 */}
          <section style={{ marginBottom: 'var(--space-5)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
              我的课程
            </h3>
            <Row gutter={[16, 16]}>
              {mockStudentCourses.map((course) => (
                <Col key={course.id} xs={24} sm={12} md={8}>
                  <div onClick={() => navigate(`/student/courses/${course.id}/graph`)}
                    style={{
                      padding: 'var(--space-4)', background: '#fff',
                      border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
                      cursor: 'pointer', transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
                  >
                    <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 2 }}>
                      {course.name}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                      {course.teacherName}
                    </div>
                    {course.pendingPRCount > 0 && (
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-primary)' }}>
                        {course.pendingPRCount} 个待处理 PR
                      </div>
                    )}
                  </div>
                </Col>
              ))}
            </Row>
          </section>

          {/* 最近 PR */}
          <section>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-4)' }}>
              最近提交
            </h3>
            <div style={{
              background: '#fff', border: '0.5px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)', overflow: 'hidden',
            }}>
              {mockStudentPRs.map((pr, index) => {
                const status = statusConfig[pr.status]
                return (
                  <div key={pr.id} onClick={() => navigate(`/student/pr/${pr.id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px var(--space-4)', cursor: 'pointer',
                      borderBottom: index < mockStudentPRs.length - 1 ? '0.5px solid var(--color-border)' : 'none',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <div>
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500, marginBottom: 2 }}>
                        #{pr.id} {pr.title}
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                        {pr.description}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Tag style={{
                        margin: 0, fontSize: 11, color: status.color,
                        background: `${status.color}15`, border: `0.5px solid ${status.color}30`,
                      }}>
                        {status.label}
                      </Tag>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
                        {pr.createdAt}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </Col>

        <Col xs={24} lg={8}>
          <div style={{
            padding: 'var(--space-4)', background: '#fff',
            border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
            marginBottom: 'var(--space-4)',
          }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
              贡献概览
            </div>
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>
              {mockStudentStats.totalPoints}
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: 12 }}>
              本周 +{mockStudentStats.weeklyPoints}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              <TrophyOutlined style={{ color: 'var(--color-warning)' }} />
              <span>
                班级排名
                <span style={{ fontWeight: 600, color: 'var(--color-text)', margin: '0 4px' }}>
                  #{mockStudentStats.rank}
                </span>
                / {mockStudentStats.totalStudents}
              </span>
            </div>
          </div>

          <div style={{
            padding: 'var(--space-4)', background: '#fff',
            border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
          }}>
            <FireOutlined style={{ fontSize: 28, color: 'var(--color-warning)', marginBottom: 8 }} />
            <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text)' }}>
              {mockStudentStats.streakDays} 天
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
              连续学习
            </div>
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default StudentDashboard
