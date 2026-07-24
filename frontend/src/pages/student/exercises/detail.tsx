// 学生端 - 习题库详情页（做题 + 判题）

import { useMemo, useState } from 'react'
import { Button, Card, Input, Modal, Radio, Space, Table, Tag, message } from 'antd'
import type { TableProps } from 'antd'
import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  RetweetOutlined,
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useGraphStore } from '../../../stores/graphStore'

interface ExerciseQuestion {
  id: string
  stem: string
  type: string
  difficulty: string
  options: string[]
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
  retryLimit: number
  questions: ExerciseQuestion[]
}

interface AnswerKey {
  answer: number
  explanation: string
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
    questions: [
      { id: 'q1', stem: '栈的入栈和出栈操作遵循什么原则？', type: '单选题', difficulty: '简单', options: ['A. 先进先出', 'B. 后进先出', 'C. 先进后出', 'D. 随机存取'] },
      { id: 'q2', stem: '以下哪个场景适合使用栈？', type: '单选题', difficulty: '简单', options: ['A. 排队叫号', 'B. 括号匹配', 'C. 好友推荐', 'D. 最短路径'] },
      { id: 'q3', stem: '若入栈序列为 1,2,3，则不可能的出栈序列是？', type: '单选题', difficulty: '简单', options: ['A. 1,2,3', 'B. 3,2,1', 'C. 3,1,2', 'D. 2,3,1'] },
      { id: 'q4', stem: '栈的 top 指针在入栈时如何变化？', type: '单选题', difficulty: '简单', options: ['A. top++', 'B. top--', 'C. 不变', 'D. top = top * 2'] },
      { id: 'q5', stem: '判断括号匹配问题适合使用什么数据结构？', type: '单选题', difficulty: '中等', options: ['A. 队列', 'B. 栈', 'C. 树', 'D. 图'] },
      { id: 'q6', stem: '用栈实现队列至少需要几个栈？', type: '单选题', difficulty: '中等', options: ['A. 1', 'B. 2', 'C. 3', 'D. 4'] },
      { id: 'q7', stem: '表达式求值中两个栈分别存储什么？', type: '单选题', difficulty: '中等', options: ['A. 操作数和运算符', 'B. 数字和字母', 'C. 输入和输出', 'D. 函数和参数'] },
      { id: 'q8', stem: '深度优先搜索使用栈还是队列？', type: '单选题', difficulty: '简单', options: ['A. 栈', 'B. 队列', 'C. 两者都可', 'D. 两者都不可'] },
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
    retryLimit: 1,
    questions: [
      { id: 'q9', stem: '实现单链表反转函数。', type: '算法题', difficulty: '简单', options: [] },
      { id: 'q10', stem: '判断链表是否存在环。', type: '算法题', difficulty: '中等', options: [] },
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
    retryLimit: 0,
    questions: [
      { id: 'q11', stem: '实现 AVL 树的左旋操作。', type: '代码题', difficulty: '中等', options: [] },
      { id: 'q12', stem: '实现 AVL 树的右旋操作。', type: '代码题', difficulty: '中等', options: [] },
    ],
  },
]

const answerKeys: Record<string, AnswerKey> = {
  q1: { answer: 1, explanation: '栈是一种后进先出（LIFO, Last In First Out）的线性结构。最后入栈的元素最先出栈，类比叠盘子。' },
  q2: { answer: 1, explanation: '括号匹配是栈的经典应用。遇到左括号入栈，遇到右括号出栈匹配，最后栈为空则匹配成功。' },
  q3: { answer: 2, explanation: '3,1,2 不可能。3 出栈后，栈中剩余 1,2（1 在底），只能先出 2 再出 1，无法先出 1 再出 2。' },
  q4: { answer: 0, explanation: '入栈时元素放到 top+1 位置，然后 top 自增指向新的栈顶，即 top++。' },
  q5: { answer: 1, explanation: '括号匹配遵循"后进先出"原则，左括号入栈，右括号出栈比较，天然适合栈结构。' },
  q6: { answer: 1, explanation: '需要两个栈：栈 A 用于入队，栈 B 用于出队。出队时若 B 为空则将 A 全部倒入 B。' },
  q7: { answer: 0, explanation: '一个栈存储操作数（数字），另一个栈存储运算符。遇到运算符根据优先级决定是否先计算栈顶。' },
  q8: { answer: 0, explanation: 'DFS 使用栈（或递归调用栈）实现"一条路走到黑"的回溯特性；BFS 才使用队列。' },
  q9: { answer: -1, explanation: '核心思路：遍历链表，每步将当前节点插入新链表头部。需维护 prev、curr、next 三个指针。时间复杂度 O(n)，空间复杂度 O(1)。' },
  q10: { answer: -1, explanation: '快慢指针法：快指针每次走两步，慢指针每次走一步。若快指针追上慢指针则存在环。空间复杂度 O(1)。' },
  q11: { answer: -1, explanation: '左旋针对右右失衡（RR型）。将右子节点提升为根，原根成为新根的左子，原右子的左子树成为原根的右子树。' },
  q12: { answer: -1, explanation: '右旋针对左左失衡（LL型）。将左子节点提升为根，原根成为新根的右子，原左子的右子树成为原根的左子树。' },
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
      retryLimit: (graphNode.data.retryLimit as number) ?? 0,
      questions: [],
    } as ExerciseBank
  }, [bankId, graphNodes])

  const [answers, setAnswers] = useState<Record<string, number | string | undefined>>({})
  const [summarySubmitted, setSummarySubmitted] = useState(false)
  const [unansweredModalOpen, setUnansweredModalOpen] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

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

  const isChoice = bank.questions.length > 0 && bank.questions[0].options.length > 0

  const handleSummarySubmit = () => {
    const unanswered = bank.questions.filter((q) => {
      if (q.options.length > 0) return answers[q.id] === undefined
      return !answers[q.id]?.toString().trim()
    })

    if (unanswered.length > 0) {
      setUnansweredModalOpen(true)
      return
    }

    setSummarySubmitted(true)
    message.success('答案已提交')
  }

  const handleJumpToQuestion = (qid: string) => {
    setUnansweredModalOpen(false)
    const el = document.getElementById(`question-${qid}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handleForceSubmit = () => {
    setUnansweredModalOpen(false)
    setSummarySubmitted(true)
    message.success('答案已提交')
  }

  const handleRetry = () => {
    setSummarySubmitted(false)
    setAnswers({})
    setRetryCount((prev) => prev + 1)
  }

  const getAnswerKey = (qid: string): AnswerKey => {
    return answerKeys[qid] || { answer: -1, explanation: '' }
  }

  const remainingRetries = bank.retryLimit === 0 ? Infinity : Math.max(0, bank.retryLimit - retryCount)
  const canRetry = remainingRetries > 0
  const retryHint = bank.retryLimit === 0
    ? '不限次数'
    : remainingRetries === 0
      ? '已达上限'
      : `还可作答 ${remainingRetries} 次`

  const score = useMemo(() => {
    let correct = 0
    bank.questions.forEach((q) => {
      if (q.options.length > 0) {
        const key = getAnswerKey(q.id)
        if (answers[q.id] === key.answer) correct++
      }
    })
    return { correct, total: bank.questions.length }
  }, [bank.questions, answers])

  const answeredCount = useMemo(() => {
    return bank.questions.filter((q) => {
      if (q.options.length > 0) return answers[q.id] !== undefined
      return answers[q.id]?.toString().trim()
    }).length
  }, [bank.questions, answers])

  const unansweredQuestions = useMemo(() => {
    return bank.questions.filter((q) => {
      if (q.options.length > 0) return answers[q.id] === undefined
      return !answers[q.id]?.toString().trim()
    })
  }, [bank.questions, answers])

  const choiceColumns: TableProps<ExerciseQuestion>['columns'] = [
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
      title: '难度',
      dataIndex: 'difficulty',
      key: 'difficulty',
      width: 70,
      render: (d: string) => <Tag color={difficultyColor[d]}>{d}</Tag>,
    },
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
            <Tag>{bank.questions.length} 题</Tag>
          </Space>
        </div>
        {summarySubmitted ? (
          <div>
            <Button icon={<RetweetOutlined />} onClick={handleRetry} disabled={!canRetry}>
              重新作答
            </Button>
            {bank.retryLimit > 0 && (
              <div style={{ fontSize: 12, color: '#999', textAlign: 'center', marginTop: 4 }}>
                {retryHint}
              </div>
            )}
          </div>
        ) : (
          <Button type="primary" icon={<CheckOutlined />} onClick={handleSummarySubmit}>
            提交答案
          </Button>
        )}
      </div>

      {summarySubmitted && (
        <Card style={{ marginBottom: 16, borderRadius: 8, border: '1px solid #CECECE' }}>
          <Space size={24}>
            <span style={{ fontSize: 14 }}>
              已完成 <strong style={{ color: '#956BF5' }}>{answeredCount}/{bank.questions.length}</strong> 题
            </span>
            <span style={{ fontSize: 14 }}>
              正确 <strong style={{ color: '#448544' }}>{score.correct}</strong> 题
            </span>
            <span style={{ fontSize: 14 }}>
              正确率 <strong style={{ color: '#956BF5' }}>{bank.questions.length ? Math.round((score.correct / bank.questions.length) * 100) : 0}%</strong>
            </span>
          </Space>
        </Card>
      )}

      {isChoice ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {bank.questions.map((q, i) => {
            const selected = answers[q.id]
            const showResult = summarySubmitted
            const answerKey = getAnswerKey(q.id)
            const correctAnswer = answerKey.answer

            return (
              <Card key={q.id} id={`question-${q.id}`} size="small" style={{ background: '#fff', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
                  <div style={{ fontWeight: 500, flex: 1 }}>{i + 1}. {q.stem}</div>
                  {showResult && (
                    selected === correctAnswer
                      ? <CheckOutlined style={{ color: 'var(--color-success)', fontSize: 18, flexShrink: 0, marginTop: 2 }} />
                      : <CloseOutlined style={{ color: 'var(--color-danger)', fontSize: 18, flexShrink: 0, marginTop: 2 }} />
                  )}
                </div>

                <Radio.Group
                  value={selected}
                  onChange={(e) => {
                    if (summarySubmitted) return
                    setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                  }}
                  disabled={summarySubmitted}
                  style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                >
                  {q.options.map((opt, idx) => {
                    const isCorrectOpt = showResult && idx === correctAnswer
                    const isSelected = idx === selected
                    const isWrongSelect = showResult && isSelected && !isCorrectOpt
                    const showOptStyle = showResult && (isCorrectOpt || isWrongSelect)

                    return (
                      <Radio
                        key={idx}
                        value={idx}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 6,
                          border: showOptStyle ? '1px solid' : '1px solid transparent',
                          borderColor: isCorrectOpt ? '#448544' : isWrongSelect ? '#BA2E38' : 'transparent',
                          background: isCorrectOpt ? '#E8F5E9' : isWrongSelect ? '#FFEBEE' : 'transparent',
                          transition: 'all 0.2s',
                        }}
                      >
                        <span style={{ marginRight: 8, color: '#999', fontSize: 12 }}>{String.fromCharCode(65 + idx)}</span>
                        {opt}
                      </Radio>
                    )
                  })}
                </Radio.Group>

                {showResult && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: 6,
                      background: '#FAFAFA',
                      border: '1px solid #CECECE',
                      fontSize: 13,
                      color: '#666',
                      lineHeight: 1.6,
                    }}>
                      <strong>解析：</strong>{answerKey.explanation}
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      ) : (
        <Table
          columns={choiceColumns}
          dataSource={bank.questions}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          style={{ background: '#fff', borderRadius: 8 }}
          expandable={{
            expandedRowRender: (q) => {
              const textAnswer = answers[q.id]?.toString() || ''
              const showResult = summarySubmitted
              const answerKey = getAnswerKey(q.id)

              return (
                <div id={`question-${q.id}`} style={{ padding: '12px 0' }}>
                  {showResult && (
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: 6,
                      background: '#FAFAFA',
                      border: '1px solid #CECECE',
                      fontSize: 13,
                      color: '#666',
                      lineHeight: 1.6,
                      marginBottom: 12,
                    }}>
                      <strong>参考答案：</strong>{answerKey.answer !== -1 ? answerKey.answer : '（本题为开放性作答，请自行核对）'}
                      <div style={{ marginTop: 8 }}><strong>解析：</strong>{answerKey.explanation}</div>
                    </div>
                  )}

                  <Input.TextArea
                    rows={4}
                    placeholder="请输入你的答案..."
                    value={textAnswer}
                    onChange={(e) => {
                      if (summarySubmitted) return
                      setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                    }}
                    disabled={summarySubmitted}
                    style={{ marginBottom: 10 }}
                  />
                </div>
              )
            },
          }}
        />
      )}

      <Modal
        title="还有未完成的题目"
        open={unansweredModalOpen}
        onCancel={() => setUnansweredModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setUnansweredModalOpen(false)}>继续作答</Button>,
          <Button key="submit" type="primary" onClick={handleForceSubmit}>
            强制提交
          </Button>,
        ]}
      >
        <div style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>
          共有 <strong>{unansweredQuestions.length}</strong> 题未作答
        </div>
        <Space wrap>
          {unansweredQuestions.map((q) => (
            <Button
              key={q.id}
              onClick={() => handleJumpToQuestion(q.id)}
            >
              第 {bank.questions.indexOf(q) + 1} 题
            </Button>
          ))}
        </Space>
      </Modal>
    </div>
  )
}

export default StudentExercisesDetailPage
