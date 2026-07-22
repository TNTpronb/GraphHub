// 学生端 - 习题库浏览页

import { useMemo } from 'react'
import { Table, Tag } from 'antd'
import type { TableProps } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { useGraphStore } from '../../../stores/graphStore'

interface ExerciseQuestion {
  id: string
  stem: string
}

interface ExerciseBank {
  key: string
  title: string
  type: string
  difficulty: string
  description: string
  mountedNodeName: string
  questionCount: number
  status: string
  questions: ExerciseQuestion[]
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
    questions: [
      { id: 'q1', stem: '栈的入栈和出栈操作遵循什么原则？' },
      { id: 'q2', stem: '以下哪个场景适合使用栈？' },
    ],
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
    questions: [
      { id: 'q3', stem: '实现单链表反转函数。' },
      { id: 'q4', stem: '判断链表是否存在环。' },
    ],
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
    questions: [
      { id: 'q5', stem: '实现 AVL 树的左旋操作。' },
      { id: 'q6', stem: '实现 AVL 树的右旋操作。' },
    ],
  },
]

const difficultyColor: Record<string, string> = {
  简单: 'green',
  中等: 'gold',
  困难: 'red',
}

const StudentExercisesPage = () => {
  const navigate = useNavigate()
  const { courseId = 'course-1' } = useParams()
  const graphNodes = useGraphStore((s) => s.graphNodes)

  const exerciseBanks = useMemo<ExerciseBank[]>(() => {
    const richMap = new Map(mockExerciseBanks.map((b) => [b.key, b]))
    return graphNodes
      .filter((n) => n.data.tags.includes('#exercise-bank'))
      .map((n) => {
        const rich = richMap.get(n.id)
        if (rich) return rich
        return {
          key: n.id,
          title: n.data.title as string,
          type: '通用',
          difficulty: '中等',
          description: (n.data.content as string) || '',
          mountedNodeName: '-',
          questionCount: 0,
          status: '草稿',
          questions: [],
        }
      })
  }, [graphNodes])

  const columns: TableProps<ExerciseBank>['columns'] = [
    {
      title: '习题库',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{title}</div>
          <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>{record.description}</div>
        </div>
      ),
    },
    {
      title: '题型',
      dataIndex: 'type',
      key: 'type',
      width: 90,
      render: (type: string) => <Tag>{type}</Tag>,
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 80,
      render: (difficulty: string) => <Tag color={difficultyColor[difficulty]}>{difficulty}</Tag>,
    },
    {
      title: '题目数',
      dataIndex: 'questionCount',
      key: 'questionCount',
      width: 90,
      render: (count: number) => `${count} 题`,
    },
    {
      title: '关联知识点',
      dataIndex: 'mountedNodeName',
      key: 'mountedNodeName',
      width: 120,
      render: (name: string) => <Tag color="purple">{name}</Tag>,
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>习题库</h3>
        <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>选择习题库开始练习。</div>
      </div>

      <Table
        columns={columns}
        dataSource={exerciseBanks}
        pagination={{ pageSize: 10 }}
        style={{ background: '#fff', borderRadius: 8 }}
        onRow={(record) => ({
          onDoubleClick: () => navigate(`/student/courses/${courseId}/exercises/${record.key}`),
          style: { cursor: 'pointer' },
        })}
      />
    </div>
  )
}

export default StudentExercisesPage
