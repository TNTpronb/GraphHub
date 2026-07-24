// 教师端 - 习题库做题情况审查页

import { useMemo } from 'react'
import { Button, Card, Space, Table, Tag, message } from 'antd'
import type { TableProps } from 'antd'
import { ArrowLeftOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useGraphStore } from '../../../../stores/graphStore'

interface ExerciseBank {
  key: string
  title: string
  type: string
  difficulty: string
  description: string
  mountedNodeName: string
  questionCount: number
  status: string
  retryLimit: number
  aiGradingEnabled: boolean
  questions: any[]
}

interface StudentSubmission {
  studentId: string
  studentName: string
  status: 'not_started' | 'submitted' | 'graded'
  score: number | null
  submittedAt: string | null
  gradedAt: string | null
}

const mockExerciseBanks: ExerciseBank[] = [
  {
    key: 'ex1',
    title: '栈基础练习',
    type: '单选题',
    difficulty: '简单',
    description: '围绕栈的入栈、出栈、后进先出特性设置的基础练习。',
    mountedNodeName: '栈',
    questionCount: 8,
    status: '已发布',
    retryLimit: 0,
    aiGradingEnabled: true,
    questions: [],
  },
  {
    key: 'ex2',
    title: '链表算法训练',
    type: '算法题',
    difficulty: '中等',
    description: '覆盖链表反转、环检测、合并有序链表等高频操作。',
    mountedNodeName: '链表',
    questionCount: 12,
    status: '已发布',
    retryLimit: 1,
    aiGradingEnabled: false,
    questions: [],
  },
  {
    key: 'ex3',
    title: 'AVL 树旋转专项',
    type: '代码题',
    difficulty: '困难',
    description: '面向 AVL 树左旋、右旋、左右旋、右左旋的代码实现训练。',
    mountedNodeName: 'AVL 树',
    questionCount: 6,
    status: '待审核',
    retryLimit: 0,
    aiGradingEnabled: false,
    questions: [],
  },
]

const mockStudents: StudentSubmission[] = [
  { studentId: 's1', studentName: '张三', status: 'graded', score: 90, submittedAt: '2026-07-20 14:30', gradedAt: '2026-07-21 09:15' },
  { studentId: 's2', studentName: '李四', status: 'submitted', score: null, submittedAt: '2026-07-21 16:45', gradedAt: null },
  { studentId: 's3', studentName: '王五', status: 'not_started', score: null, submittedAt: null, gradedAt: null },
  { studentId: 's4', studentName: '赵六', status: 'submitted', score: null, submittedAt: '2026-07-21 18:20', gradedAt: null },
  { studentId: 's5', studentName: '钱七', status: 'graded', score: 75, submittedAt: '2026-07-20 10:00', gradedAt: '2026-07-20 15:30' },
]

const statusMap: Record<string, { color: string; text: string }> = {
  not_started: { color: 'default', text: '未作答' },
  submitted: { color: 'gold', text: '待批改' },
  graded: { color: 'green', text: '已批改' },
}

const TeacherExercisesReviewPage = () => {
  const navigate = useNavigate()
  const { courseId = 'course-1', bankId } = useParams<{ courseId: string; bankId: string }>()
  const graphNodes = useGraphStore((s) => s.graphNodes)

  const bank = useMemo(() => {
    const graphNode = graphNodes.find((n) => n.id === bankId)
    if (!graphNode) return null
    const richData = mockExerciseBanks.find((b) => b.key === bankId)
    if (richData) return richData
    return {
      key: bankId!,
      title: graphNode.data.title as string,
      type: '通用',
      difficulty: '中等',
      description: (graphNode.data.content as string) || '',
      mountedNodeName: '-',
      questionCount: 0,
      status: '草稿',
      retryLimit: 0,
      aiGradingEnabled: false,
      questions: [],
    } as ExerciseBank
  }, [bankId, graphNodes])

  const stats = useMemo(() => {
    const notStarted = mockStudents.filter((s) => s.status === 'not_started').length
    const submitted = mockStudents.filter((s) => s.status === 'submitted').length
    const graded = mockStudents.filter((s) => s.status === 'graded').length
    return { notStarted, submitted, graded, total: mockStudents.length }
  }, [])

  const handleGrade = (studentId: string) => {
    message.info(`进入学生 ${studentId} 的批改界面（占位）`)
  }

  const handleView = (studentId: string) => {
    message.info(`查看学生 ${studentId} 的批改结果（占位）`)
  }

  const columns: TableProps<StudentSubmission>['columns'] = [
    {
      title: '学生',
      dataIndex: 'studentName',
      key: 'studentName',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const info = statusMap[status] || { color: 'default', text: status }
        return <Tag color={info.color}>{info.text}</Tag>
      },
    },
    {
      title: '得分',
      dataIndex: 'score',
      key: 'score',
      width: 80,
      render: (score: number | null) => score !== null ? <strong>{score}</strong> : '-',
    },
    {
      title: '提交时间',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 160,
      render: (v: string | null) => v || '-',
    },
    {
      title: '批改时间',
      dataIndex: 'gradedAt',
      key: 'gradedAt',
      width: 160,
      render: (v: string | null) => v || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: unknown, record: StudentSubmission) => {
        if (record.status === 'not_started') {
          return <span style={{ color: '#ccc', fontSize: 12 }}>未作答</span>
        }
        if (record.status === 'submitted') {
          return (
            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleGrade(record.studentId)}>
              批改
            </Button>
          )
        }
        return (
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record.studentId)}>
            查看
          </Button>
        )
      },
    },
  ]

  if (!bank) {
    return (
      <div style={{ padding: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/teacher/courses/${courseId}/exercises`)}>
          返回习题库列表
        </Button>
        <div style={{ marginTop: 48, textAlign: 'center', color: '#999' }}>习题库不存在</div>
      </div>
    )
  }

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/teacher/courses/${courseId}/exercises`)}
        style={{ marginBottom: 16 }}>
        返回习题库列表
      </Button>

      <div style={{
        background: '#fff', borderRadius: 8, padding: '16px 20px', marginBottom: 16,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{bank.title} - 做题情况</h3>
          <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{bank.description}</div>
          <Space size={8} style={{ marginTop: 8 }}>
            <Tag>{bank.type}</Tag>
            <Tag color={bank.difficulty === '简单' ? 'green' : bank.difficulty === '中等' ? 'gold' : 'red'}>{bank.difficulty}</Tag>
            <Tag color="purple">关联: {bank.mountedNodeName}</Tag>
            <Tag>重做: {bank.retryLimit === 0 ? '不限' : `${bank.retryLimit} 次`}</Tag>
            <Tag color={bank.aiGradingEnabled ? 'blue' : 'default'}>{bank.aiGradingEnabled ? 'AI 判题' : '人工批改'}</Tag>
          </Space>
        </div>
      </div>

      <Card style={{ marginBottom: 16, borderRadius: 8, border: '1px solid #CECECE' }}>
        <Space size={24}>
          <span style={{ fontSize: 14 }}>
            未作答 <strong style={{ color: '#999' }}>{stats.notStarted}</strong> 人
          </span>
          <span style={{ fontSize: 14 }}>
            待批改 <strong style={{ color: '#D4A72C' }}>{stats.submitted}</strong> 人
          </span>
          <span style={{ fontSize: 14 }}>
            已批改 <strong style={{ color: '#448544' }}>{stats.graded}</strong> 人
          </span>
          <span style={{ fontSize: 14 }}>
            共 <strong>{stats.total}</strong> 人
          </span>
        </Space>
      </Card>

      <Table
        columns={columns}
        dataSource={mockStudents}
        rowKey="studentId"
        pagination={false}
        style={{ background: '#fff', borderRadius: 8 }}
      />
    </div>
  )
}

export default TeacherExercisesReviewPage
