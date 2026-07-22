// 教师端 - 习题库详情页（展示习题列表）

import { useMemo } from 'react'
import { Button, Space, Table, Tag } from 'antd'
import type { TableProps } from 'antd'
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useGraphStore } from '../../../stores/graphStore'

interface ExerciseQuestion {
  id: string
  stem: string
  type: string
  difficulty: string
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
      { id: 'q1', stem: '栈的入栈和出栈操作遵循什么原则？', type: '单选题', difficulty: '简单' },
      { id: 'q2', stem: '以下哪个场景适合使用栈？', type: '单选题', difficulty: '简单' },
      { id: 'q3', stem: '若入栈序列为 1,2,3，则不可能的出栈序列是？', type: '单选题', difficulty: '简单' },
      { id: 'q4', stem: '栈的 top 指针在入栈时如何变化？', type: '单选题', difficulty: '简单' },
      { id: 'q5', stem: '判断括号匹配问题适合使用什么数据结构？', type: '单选题', difficulty: '中等' },
      { id: 'q6', stem: '用栈实现队列至少需要几个栈？', type: '单选题', difficulty: '中等' },
      { id: 'q7', stem: '表达式求值中两个栈分别存储什么？', type: '单选题', difficulty: '中等' },
      { id: 'q8', stem: '深度优先搜索使用栈还是队列？', type: '单选题', difficulty: '简单' },
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
      { id: 'q9', stem: '实现单链表反转函数。', type: '算法题', difficulty: '简单' },
      { id: 'q10', stem: '判断链表是否存在环。', type: '算法题', difficulty: '中等' },
      { id: 'q11', stem: '合并两个有序链表。', type: '算法题', difficulty: '中等' },
      { id: 'q12', stem: '删除链表的倒数第 N 个节点。', type: '算法题', difficulty: '中等' },
      { id: 'q13', stem: '找出两个链表的第一个公共节点。', type: '算法题', difficulty: '中等' },
      { id: 'q14', stem: '链表排序（要求 O(n log n)）。', type: '算法题', difficulty: '困难' },
      { id: 'q15', stem: '复制带随机指针的链表。', type: '算法题', difficulty: '困难' },
      { id: 'q16', stem: '判断链表是否为回文结构。', type: '算法题', difficulty: '中等' },
      { id: 'q17', stem: '移除链表中的重复元素 II。', type: '算法题', difficulty: '中等' },
      { id: 'q18', stem: '旋转链表（右移 k 位）。', type: '算法题', difficulty: '中等' },
      { id: 'q19', stem: '分隔链表（小于 x 的节点在前）。', type: '算法题', difficulty: '中等' },
      { id: 'q20', stem: 'K 个一组翻转链表。', type: '算法题', difficulty: '困难' },
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
      { id: 'q21', stem: '实现 AVL 树的左旋操作。', type: '代码题', difficulty: '中等' },
      { id: 'q22', stem: '实现 AVL 树的右旋操作。', type: '代码题', difficulty: '中等' },
      { id: 'q23', stem: '实现 AVL 树的左右旋操作。', type: '代码题', difficulty: '困难' },
      { id: 'q24', stem: '实现 AVL 树的右左旋操作。', type: '代码题', difficulty: '困难' },
      { id: 'q25', stem: 'AVL 树插入节点后自动平衡。', type: '代码题', difficulty: '困难' },
      { id: 'q26', stem: 'AVL 树删除节点后自动平衡。', type: '代码题', difficulty: '困难' },
    ],
  },
]

const difficultyColor: Record<string, string> = {
  简单: 'green',
  中等: 'gold',
  困难: 'red',
}

const typeColor: Record<string, string> = {
  单选题: 'blue',
  算法题: 'volcano',
  代码题: 'purple',
}

const ExerciseBankDetailPage = () => {
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
      questions: [],
    } as ExerciseBank
  }, [bankId, graphNodes])

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

  const columns: TableProps<ExerciseQuestion>['columns'] = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (_: unknown, __: unknown, i: number) => i + 1,
    },
    {
      title: '题目',
      dataIndex: 'stem',
      key: 'stem',
    },
    {
      title: '题型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => <Tag color={typeColor[type]}>{type}</Tag>,
    },
    {
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 80,
      render: (d: string) => <Tag color={difficultyColor[d]}>{d}</Tag>,
    },
  ]

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
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{bank.title}</h3>
          <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{bank.description}</div>
          <Space size={8} style={{ marginTop: 8 }}>
            <Tag color={typeColor[bank.type]}>{bank.type}</Tag>
            <Tag color={difficultyColor[bank.difficulty]}>{bank.difficulty}</Tag>
            <Tag color={bank.status === '已发布' ? 'green' : 'gold'}>{bank.status}</Tag>
            <Tag color="purple">挂载: {bank.mountedNodeName}</Tag>
          </Space>
        </div>
        <Button type="primary" icon={<PlusOutlined />}>添加题目</Button>
      </div>

      <Table
        columns={columns}
        dataSource={bank.questions}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        style={{ background: '#fff', borderRadius: 8 }}
      />
    </div>
  )
}

export default ExerciseBankDetailPage
