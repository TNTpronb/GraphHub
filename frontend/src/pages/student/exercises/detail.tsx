// 学生端 - 习题库详情页（做题界面）

import { useMemo, useState } from 'react'
import { Button, Card, Input, Radio, Space, Table, Tag, message } from 'antd'
import type { TableProps } from 'antd'
import { ArrowLeftOutlined, CheckOutlined } from '@ant-design/icons'
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

interface ChoiceQuestion extends ExerciseQuestion {
  options: string[]
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
      { id: 'q11', stem: '实现 AVL 树的左旋操作。', type: '代码题', difficulty: '中等' },
      { id: 'q12', stem: '实现 AVL 树的右旋操作。', type: '代码题', difficulty: '中等' },
    ],
  },
]

const choiceBankIds = new Set(['ex1'])
const mockChoices: Record<string, ChoiceQuestion> = {
  q1: { id: 'q1', stem: '栈的入栈和出栈操作遵循什么原则？', type: '单选题', difficulty: '简单', options: ['A. 先进先出', 'B. 后进先出', 'C. 先进后出', 'D. 随机存取'] },
  q2: { id: 'q2', stem: '以下哪个场景适合使用栈？', type: '单选题', difficulty: '简单', options: ['A. 排队叫号', 'B. 括号匹配', 'C. 好友推荐', 'D. 最短路径'] },
  q3: { id: 'q3', stem: '若入栈序列为 1,2,3，则不可能的出栈序列是？', type: '单选题', difficulty: '简单', options: ['A. 1,2,3', 'B. 3,2,1', 'C. 3,1,2', 'D. 2,3,1'] },
  q4: { id: 'q4', stem: '栈的 top 指针在入栈时如何变化？', type: '单选题', difficulty: '简单', options: ['A. top++', 'B. top--', 'C. 不变', 'D. top = top * 2'] },
  q5: { id: 'q5', stem: '判断括号匹配问题适合使用什么数据结构？', type: '单选题', difficulty: '中等', options: ['A. 队列', 'B. 栈', 'C. 树', 'D. 图'] },
  q6: { id: 'q6', stem: '用栈实现队列至少需要几个栈？', type: '单选题', difficulty: '中等', options: ['A. 1', 'B. 2', 'C. 3', 'D. 4'] },
  q7: { id: 'q7', stem: '表达式求值中两个栈分别存储什么？', type: '单选题', difficulty: '中等', options: ['A. 操作数和运算符', 'B. 数字和字母', 'C. 输入和输出', 'D. 函数和参数'] },
  q8: { id: 'q8', stem: '深度优先搜索使用栈还是队列？', type: '单选题', difficulty: '简单', options: ['A. 栈', 'B. 队列', 'C. 两者都可', 'D. 两者都不可'] },
}

const difficultyColor: Record<string, string> = {
  简单: 'green',
  中等: 'gold',
  困难: 'red',
}

const StudentExercisesDetailPage = () => {
  const navigate = useNavigate()
  const { courseId = 'course-1', bankId } = useParams<{ courseId: string; bankId: string }>()
  const graphNodes = useGraphStore((s) => s.graphNodes)
  const [answers, setAnswers] = useState<Record<string, string | undefined>>({})
  const [submitted, setSubmitted] = useState(false)

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
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/student/courses/${courseId}/exercises`)}>
          返回习题库列表
        </Button>
        <div style={{ marginTop: 48, textAlign: 'center', color: '#999' }}>习题库不存在</div>
      </div>
    )
  }

  const isChoice = choiceBankIds.has(bank.key)

  const handleSubmit = () => {
    const answered = Object.values(answers).filter(Boolean).length
    message.success(`已提交 ${answered}/${bank.questions.length} 题`)
    setSubmitted(true)
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
    { title: '难度', dataIndex: 'difficulty', key: 'difficulty', width: 70, render: (d: string) => <Tag color={difficultyColor[d]}>{d}</Tag> },
  ]

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/student/courses/${courseId}/exercises`)}
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
            <Tag>{bank.type}</Tag>
            <Tag color={difficultyColor[bank.difficulty]}>{bank.difficulty}</Tag>
            <Tag color="purple">关联: {bank.mountedNodeName}</Tag>
          </Space>
        </div>
        <Button type="primary" icon={<CheckOutlined />} onClick={handleSubmit} disabled={submitted}>
          {submitted ? '已提交' : '提交答案'}
        </Button>
      </div>

      {isChoice ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {bank.questions.map((q, i) => {
            const choice = mockChoices[q.id]
            return (
              <Card key={q.id} size="small" style={{ background: '#fff', borderRadius: 8 }}>
                <div style={{ fontWeight: 500, marginBottom: 8 }}>{i + 1}. {q.stem}</div>
                {choice ? (
                  <Radio.Group
                    value={answers[q.id]}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    disabled={submitted}
                  >
                    <Space direction="vertical">
                      {choice.options.map((opt) => (
                        <Radio key={opt} value={opt}>{opt}</Radio>
                      ))}
                    </Space>
                  </Radio.Group>
                ) : (
                  <Input.TextArea rows={3} placeholder="请输入你的答案..."
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    disabled={submitted} />
                )}
              </Card>
            )
          })}
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={bank.questions}
          rowKey="id"
          pagination={false}
          style={{ background: '#fff', borderRadius: 8 }}
          expandable={{
            expandedRowRender: (q) => (
              <div style={{ padding: '8px 0' }}>
                <div style={{ fontWeight: 500, marginBottom: 8 }}>你的答案</div>
                {isChoice && mockChoices[q.id] ? (
                  <Radio.Group
                    value={answers[q.id]}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    disabled={submitted}
                  >
                    <Space direction="vertical">
                      {mockChoices[q.id].options.map((opt) => (
                        <Radio key={opt} value={opt}>{opt}</Radio>
                      ))}
                    </Space>
                  </Radio.Group>
                ) : (
                  <Input.TextArea rows={4} placeholder="请输入你的答案..."
                    value={answers[q.id] || ''}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
                    disabled={submitted} />
                )}
              </div>
            ),
          }}
        />
      )}
    </div>
  )
}

export default StudentExercisesDetailPage
