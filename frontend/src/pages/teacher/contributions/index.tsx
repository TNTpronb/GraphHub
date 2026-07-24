// src/pages/teacher/contributions/index.tsx
// 班级贡献排行榜（教师端）

import { useState, useMemo } from 'react'
import { Table, Tag, Progress, Card, Row, Col, Tabs, Statistic } from 'antd'
import { TrophyOutlined, BugOutlined, StarOutlined } from '@ant-design/icons'

type TimeRange = 'week' | 'month' | 'all'

interface StudentContribution {
  id: string
  name: string
  studentId: string
  points: number
  prCount: number
  issueCount: number
  lastActive: string
}

const allContributions: Record<TimeRange, StudentContribution[]> = {
  week: [
    { id: '1', name: '张三', studentId: '2024001', points: 120, prCount: 3, issueCount: 1, lastActive: '2 小时前' },
    { id: '2', name: '李四', studentId: '2024002', points: 85, prCount: 2, issueCount: 1, lastActive: '1 天前' },
    { id: '3', name: '王五', studentId: '2024003', points: 40, prCount: 1, issueCount: 0, lastActive: '3 天前' },
    { id: '4', name: '赵六', studentId: '2024004', points: 0, prCount: 0, issueCount: 0, lastActive: '1 周前' },
    { id: '5', name: '孙七', studentId: '2024005', points: 65, prCount: 2, issueCount: 0, lastActive: '5 天前' },
  ],
  month: [
    { id: '1', name: '张三', studentId: '2024001', points: 450, prCount: 8, issueCount: 4, lastActive: '2 小时前' },
    { id: '2', name: '李四', studentId: '2024002', points: 320, prCount: 6, issueCount: 2, lastActive: '1 天前' },
    { id: '3', name: '王五', studentId: '2024003', points: 180, prCount: 3, issueCount: 2, lastActive: '3 天前' },
    { id: '4', name: '赵六', studentId: '2024004', points: 50, prCount: 1, issueCount: 0, lastActive: '1 周前' },
    { id: '5', name: '孙七', studentId: '2024005', points: 290, prCount: 5, issueCount: 1, lastActive: '5 天前' },
    { id: '6', name: '周八', studentId: '2024006', points: 210, prCount: 4, issueCount: 1, lastActive: '2 天前' },
  ],
  all: [
    { id: '1', name: '张三', studentId: '2024001', points: 1280, prCount: 22, issueCount: 12, lastActive: '2 小时前' },
    { id: '2', name: '李四', studentId: '2024002', points: 950, prCount: 15, issueCount: 8, lastActive: '1 天前' },
    { id: '6', name: '周八', studentId: '2024006', points: 780, prCount: 12, issueCount: 6, lastActive: '2 天前' },
    { id: '5', name: '孙七', studentId: '2024005', points: 650, prCount: 10, issueCount: 5, lastActive: '5 天前' },
    { id: '3', name: '王五', studentId: '2024003', points: 420, prCount: 6, issueCount: 4, lastActive: '3 天前' },
    { id: '4', name: '赵六', studentId: '2024004', points: 150, prCount: 2, issueCount: 1, lastActive: '1 周前' },
  ],
}

const TeacherContributions = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month')
  const data = allContributions[timeRange]

  const totalPoints = useMemo(() => data.reduce((s, d) => s + d.points, 0), [data])
  const totalPR = useMemo(() => data.reduce((s, d) => s + d.prCount, 0), [data])
  const totalIssue = useMemo(() => data.reduce((s, d) => s + d.issueCount, 0), [data])
  const activeCount = useMemo(() => data.filter(d => d.points > 0).length, [data])

  const prPercent = totalPR + totalIssue > 0 ? Math.round((totalPR / (totalPR + totalIssue)) * 100) : 0
  const issuePercent = 100 - prPercent

  const columns = [
    {
      title: '排名',
      key: 'rank',
      width: 60,
      render: (_: any, __: any, index: number) => {
        let color = '#999'
        let bg = 'transparent'
        if (index === 0) { color = '#D4A72C'; bg = '#FFF9E6' }
        else if (index === 1) { color = '#6B6B6B'; bg = '#F5F5F5' }
        else if (index === 2) { color = '#B8591A'; bg = '#FFF4E6' }
        return (
          <div style={{
            width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: bg, color, fontWeight: 700, fontSize: 13,
          }}>
            {index + 1}
          </div>
        )
      },
    },
    {
      title: '学生',
      key: 'name',
      dataIndex: 'name',
      render: (name: string, record: any) => `${name} ${record.studentId}`,
    },
    {
      title: '积分',
      key: 'points',
      dataIndex: 'points',
      sorter: (a: any, b: any) => a.points - b.points,
      render: (v: number) => <span style={{ fontWeight: 700, color: '#956BF5' }}>{v}</span>,
    },
    { title: 'PR 数', key: 'prCount', dataIndex: 'prCount' },
    { title: 'Issue 数', key: 'issueCount', dataIndex: 'issueCount' },
    {
      title: '贡献类型',
      key: 'typeDist',
      render: (_: any, record: any) => {
        const total = record.prCount + record.issueCount
        if (total === 0) return <span style={{ color: '#999' }}>暂无</span>
        const prP = Math.round((record.prCount / total) * 100)
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Progress percent={prP} size="small" style={{ width: 100 }}
              strokeColor="#956BF5" trailColor="#D6CCF0" />
            <span style={{ fontSize: 12, color: '#999' }}>PR {prP}% / Issue {100 - prP}%</span>
          </div>
        )
      },
    },
    { title: '最后活跃', key: 'lastActive', dataIndex: 'lastActive' },
  ]

  return (
    <div>
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 24 }}>班级贡献</h2>

      {/* 时间筛选 */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Tabs activeKey={timeRange} onChange={(k) => setTimeRange(k as TimeRange)}
          items={[
            { key: 'week', label: '本周' },
            { key: 'month', label: '本月' },
            { key: 'all', label: '全部' },
          ]}
        />
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic title="总积分" value={totalPoints} prefix={<TrophyOutlined style={{ color: '#D4A72C' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic title="PR 提交" value={totalPR} prefix={<StarOutlined style={{ color: '#956BF5' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic title="Issue 反馈" value={totalIssue} prefix={<BugOutlined style={{ color: '#CF222E' }} />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Statistic title="活跃学生" value={`${activeCount} / ${data.length}`} />
          </Card>
        </Col>
      </Row>

      {/* 贡献类型分布 */}
      <Card title="贡献类型分布" style={{ borderRadius: 8, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Progress type="circle" percent={prPercent} width={80}
            strokeColor="#956BF5" trailColor="#D6CCF0"
            format={(p) => <span style={{ fontSize: 18, fontWeight: 700 }}>{p}%</span>} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>PR {prPercent}% / Issue {issuePercent}%</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
              共 {totalPR + totalIssue} 次贡献（PR {totalPR} 次，Issue {totalIssue} 次）
            </div>
          </div>
        </div>
      </Card>

      {/* 排行榜 */}
      <Card title="贡献排行榜" style={{ borderRadius: 8 }}>
        <Table dataSource={data} pagination={false} size="middle" rowKey="id"
          columns={columns}
        />
      </Card>
    </div>
  )
}

export default TeacherContributions
