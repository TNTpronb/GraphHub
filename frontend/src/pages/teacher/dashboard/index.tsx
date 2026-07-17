// 教师首页：待审核概览 + 课程卡片列表

import { useNavigate } from 'react-router-dom'
import { Row, Col, Button, Tag } from 'antd'
import { PlusOutlined, RightOutlined } from '@ant-design/icons'
import { mockPendingReviews, mockCourses } from '../../../api/mock/dashboard'

const TeacherDashboard = () => {
  const navigate = useNavigate()
  const teacherName = '张老师'

  return (
    <div>
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 'var(--space-5)' }}>
        欢迎回来，{teacherName}
      </h2>

      {/* 待审核概览 */}
      <section style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 'var(--space-4)',
        }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>待审核</h3>
          <Button type="text" size="small" onClick={() => navigate('/teacher/review')}
            style={{ color: 'var(--color-text-secondary)' }}>
            进入审核工作台 <RightOutlined style={{ fontSize: 10 }} />
          </Button>
        </div>

        <Row gutter={[16, 16]}>
          {mockPendingReviews.map((item) => (
            <Col key={item.courseId} xs={24} sm={12} md={8}>
              <div
                onClick={() => navigate(`/teacher/review?courseId=${item.courseId}`)}
                style={{
                  padding: 'var(--space-4)', background: '#fff',
                  border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer', transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 'var(--text-base)', fontWeight: 500 }}>{item.courseName}</span>
                  <span style={{
                    fontSize: 'var(--text-xl)', fontWeight: 700,
                    color: item.pendingCount > 0 ? 'var(--color-danger)' : 'var(--color-text-tertiary)',
                  }}>
                    {item.pendingCount}
                  </span>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </section>

      {/* 我的课程 */}
      <section>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 'var(--space-4)',
        }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>我的课程</h3>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/teacher/courses/new')}>
            新建课程
          </Button>
        </div>

        <Row gutter={[16, 16]}>
          {mockCourses.map((course) => (
            <Col key={course.id} xs={24} sm={12} md={8}>
              <div
                onClick={() => navigate(`/teacher/courses/${course.id}/graph`)}
                style={{
                  padding: 'var(--space-4)', background: '#fff',
                  border: '0.5px solid var(--color-border)', borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer', transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
              >
                <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, marginBottom: 4 }}>
                  {course.name}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                  {course.className} · {course.semester}
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)',
                }}>
                  <Tag style={{
                    margin: 0, fontSize: 11, background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)', border: 'none',
                  }}>
                    {course.nodeCount} 个节点
                  </Tag>
                  <span>更新于 {course.lastUpdated}</span>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </section>
    </div>
  )
}

export default TeacherDashboard
