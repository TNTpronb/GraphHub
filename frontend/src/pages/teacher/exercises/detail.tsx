// 教师端 - 习题库详情页（展示习题列表 + 编辑题目 + AI录入/生题）

import { useMemo, useState } from 'react'
import { Button, Checkbox, Divider, Form, Input, Modal, Progress, Radio, Select, Slider, Space, Spin, Table, Tag, Upload, message } from 'antd'
import type { TableProps, UploadProps } from 'antd'
import {
  ArrowLeftOutlined,
  AuditOutlined,
  DeleteOutlined,
  EditOutlined,
  InboxOutlined,
  PlusOutlined,
  RobotOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { useGraphStore } from '../../../stores/graphStore'

const { Dragger } = Upload

interface ExerciseQuestion {
  id: string
  stem: string
  type: string
  difficulty: string
  options: string[]
  answer: string
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
  aiGradingEnabled: boolean
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
    retryLimit: 0,
    aiGradingEnabled: true,
    questions: [
      { id: 'q1', stem: '栈的入栈和出栈操作遵循什么原则？', type: '单选题', difficulty: '简单', options: ['A. 先进先出', 'B. 后进先出', 'C. 先进后出', 'D. 随机存取'], answer: 'B. 后进先出' },
      { id: 'q2', stem: '以下哪个场景适合使用栈？', type: '单选题', difficulty: '简单', options: ['A. 排队叫号', 'B. 括号匹配', 'C. 好友推荐', 'D. 最短路径'], answer: 'B. 括号匹配' },
      { id: 'q3', stem: '若入栈序列为 1,2,3，则不可能的出栈序列是？', type: '单选题', difficulty: '简单', options: ['A. 1,2,3', 'B. 3,2,1', 'C. 3,1,2', 'D. 2,3,1'], answer: 'C. 3,1,2' },
      { id: 'q4', stem: '栈的 top 指针在入栈时如何变化？', type: '单选题', difficulty: '简单', options: ['A. top++', 'B. top--', 'C. 不变', 'D. top = top * 2'], answer: 'A. top++' },
      { id: 'q5', stem: '判断括号匹配问题适合使用什么数据结构？', type: '单选题', difficulty: '中等', options: ['A. 队列', 'B. 栈', 'C. 树', 'D. 图'], answer: 'B. 栈' },
      { id: 'q6', stem: '用栈实现队列至少需要几个栈？', type: '单选题', difficulty: '中等', options: ['A. 1', 'B. 2', 'C. 3', 'D. 4'], answer: 'B. 2' },
      { id: 'q7', stem: '表达式求值中两个栈分别存储什么？', type: '单选题', difficulty: '中等', options: ['A. 操作数和运算符', 'B. 数字和字母', 'C. 输入和输出', 'D. 函数和参数'], answer: 'A. 操作数和运算符' },
      { id: 'q8', stem: '深度优先搜索使用栈还是队列？', type: '单选题', difficulty: '简单', options: ['A. 栈', 'B. 队列', 'C. 两者都可', 'D. 两者都不可'], answer: 'A. 栈' },
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
    aiGradingEnabled: false,
    questions: [
      { id: 'q9', stem: '实现单链表反转函数。', type: '算法题', difficulty: '简单', options: [], answer: '' },
      { id: 'q10', stem: '判断链表是否存在环。', type: '算法题', difficulty: '中等', options: [], answer: '' },
      { id: 'q11', stem: '合并两个有序链表。', type: '算法题', difficulty: '中等', options: [], answer: '' },
      { id: 'q12', stem: '删除链表的倒数第 N 个节点。', type: '算法题', difficulty: '中等', options: [], answer: '' },
      { id: 'q13', stem: '找出两个链表的第一个公共节点。', type: '算法题', difficulty: '中等', options: [], answer: '' },
      { id: 'q14', stem: '链表排序（要求 O(n log n)）。', type: '算法题', difficulty: '困难', options: [], answer: '' },
      { id: 'q15', stem: '复制带随机指针的链表。', type: '算法题', difficulty: '困难', options: [], answer: '' },
      { id: 'q16', stem: '判断链表是否为回文结构。', type: '算法题', difficulty: '中等', options: [], answer: '' },
      { id: 'q17', stem: '移除链表中的重复元素 II。', type: '算法题', difficulty: '中等', options: [], answer: '' },
      { id: 'q18', stem: '旋转链表（右移 k 位）。', type: '算法题', difficulty: '中等', options: [], answer: '' },
      { id: 'q19', stem: '分隔链表（小于 x 的节点在前）。', type: '算法题', difficulty: '中等', options: [], answer: '' },
      { id: 'q20', stem: 'K 个一组翻转链表。', type: '算法题', difficulty: '困难', options: [], answer: '' },
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
    aiGradingEnabled: false,
    questions: [
      { id: 'q21', stem: '实现 AVL 树的左旋操作。', type: '代码题', difficulty: '中等', options: [], answer: '' },
      { id: 'q22', stem: '实现 AVL 树的右旋操作。', type: '代码题', difficulty: '中等', options: [], answer: '' },
      { id: 'q23', stem: '实现 AVL 树的左右旋操作。', type: '代码题', difficulty: '困难', options: [], answer: '' },
      { id: 'q24', stem: '实现 AVL 树的右左旋操作。', type: '代码题', difficulty: '困难', options: [], answer: '' },
      { id: 'q25', stem: 'AVL 树插入节点后自动平衡。', type: '代码题', difficulty: '困难', options: [], answer: '' },
      { id: 'q26', stem: 'AVL 树删除节点后自动平衡。', type: '代码题', difficulty: '困难', options: [], answer: '' },
    ],
  },
]

const questionTypes = ['单选题', '多选题', '判断题', '算法题', '代码题']
const difficultyLevels = ['简单', '中等', '困难']

const difficultyColor: Record<string, string> = {
  简单: 'green',
  中等: 'gold',
  困难: 'red',
}

const typeColor: Record<string, string> = {
  单选题: 'blue',
  多选题: 'geekblue',
  判断题: 'cyan',
  算法题: 'volcano',
  代码题: 'purple',
}

const hasOptions = (type: string) => ['单选题', '多选题', '判断题'].includes(type)

interface QuestionFormValues {
  stem: string
  type: string
  difficulty: string
  options: string[]
  answer: string
}

// ── mock AI 解析：从文本中提取题目 ──
const mockAiParseQuestions = (text: string, bankTitle: string): Promise<ExerciseQuestion[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const stemCount = (text.match(/[。？?！!]/g) || []).length
      if (stemCount < 2) {
        resolve(simulateParse(bankTitle))
      } else {
        resolve(simulateDeepParse(bankTitle, stemCount))
      }
    }, 1500)
  })
}

const simulateParse = (bankTitle: string): ExerciseQuestion[] => {
  if (bankTitle.includes('栈')) {
    return [
      { id: '', stem: '链栈的入栈操作时间复杂度为？', type: '单选题', difficulty: '简单', options: ['A. O(1)', 'B. O(n)', 'C. O(log n)', 'D. O(n^2)'], answer: 'A. O(1)' },
      { id: '', stem: '顺序栈的栈满判断条件是什么？', type: '单选题', difficulty: '简单', options: ['A. top == 0', 'B. top == MAXSIZE', 'C. top == -1', 'D. top == MAXSIZE-1'], answer: 'D. top == MAXSIZE-1' },
      { id: '', stem: '递归函数调用过程中，系统使用什么结构存储返回地址？', type: '单选题', difficulty: '中等', options: ['A. 队列', 'B. 栈', 'C. 数组', 'D. 链表'], answer: 'B. 栈' },
    ]
  }
  if (bankTitle.includes('链表')) {
    return [
      { id: '', stem: '双向链表的每个节点包含几个指针域？', type: '单选题', difficulty: '简单', options: ['A. 1 个', 'B. 2 个', 'C. 3 个', 'D. 0 个'], answer: 'B. 2 个' },
      { id: '', stem: '循环链表与普通单链表的区别是什么？', type: '单选题', difficulty: '简单', options: ['A. 有无头节点', 'B. 尾节点指针指向头节点', 'C. 节点数量不同', 'D. 数据类型不同'], answer: 'B. 尾节点指针指向头节点' },
      { id: '', stem: '在单链表中删除一个节点需要修改几个指针？', type: '单选题', difficulty: '中等', options: ['A. 1 个', 'B. 2 个', 'C. 0 个', 'D. 3 个'], answer: 'A. 1 个' },
    ]
  }
  if (bankTitle.includes('AVL')) {
    return [
      { id: '', stem: 'AVL 树的平衡因子绝对值上限是多少？', type: '单选题', difficulty: '简单', options: ['A. 0', 'B. 1', 'C. 2', 'D. 3'], answer: 'B. 1' },
      { id: '', stem: '以下哪种情况需要左右旋操作？', type: '单选题', difficulty: '中等', options: ['A. LL型', 'B. RR型', 'C. LR型', 'D. 平衡'], answer: 'C. LR型' },
      { id: '', stem: 'AVL 树的查找时间复杂度是？', type: '单选题', difficulty: '简单', options: ['A. O(n)', 'B. O(log n)', 'C. O(n log n)', 'D. O(1)'], answer: 'B. O(log n)' },
    ]
  }
  return [
    { id: '', stem: '从文档中识别到：什么是算法的复杂度？', type: '单选题', difficulty: '简单', options: ['A. 代码行数', 'B. 时间和空间开销', 'C. 运行次数', 'D. 编译速度'], answer: 'B. 时间和空间开销' },
    { id: '', stem: '从文档中识别到：递归必须具备什么条件？', type: '单选题', difficulty: '中等', options: ['A. 循环', 'B. 终止条件和递推关系', 'C. 数组', 'D. 指针'], answer: 'B. 终止条件和递推关系' },
  ]
}

const simulateDeepParse = (bankTitle: string, count: number): ExerciseQuestion[] => {
  const base = simulateParse(bankTitle)
  const extra: ExerciseQuestion[] = [
    { id: '', stem: '文档识别：下列哪种数据结构适合实现递归？', type: '多选题', difficulty: '中等', options: ['A. 栈', 'B. 队列', 'C. 数组', 'D. 树'], answer: 'A. 栈' },
    { id: '', stem: '文档识别：时间复杂度为 O(1) 的操作有哪些？', type: '多选题', difficulty: '简单', options: ['A. 数组随机访问', 'B. 链表头插', 'C. 二分查找', 'D. 哈希查找'], answer: 'A. 数组随机访问' },
    { id: '', stem: '文档识别：简述栈和队列的主要区别。', type: '算法题', difficulty: '简单', options: [], answer: '' },
    { id: '', stem: '文档识别：实现一个最小栈，支持常数时间获取最小值。', type: '代码题', difficulty: '中等', options: [], answer: '' },
    { id: '', stem: '文档识别：判断链表中是否存在环。', type: '算法题', difficulty: '中等', options: [], answer: '' },
  ]
  return [...base, ...extra.slice(0, Math.min(count - base.length, extra.length))]
}

// ── mock AI 生成题目 ──
const mockAiGenerateQuestions = (
  bankTitle: string,
  count: number,
  difficulty: string,
  qt: string
): Promise<ExerciseQuestion[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(generateMockQuestions(bankTitle, count, difficulty, qt))
    }, 2000)
  })
}

const generateMockQuestions = (
  bankTitle: string,
  count: number,
  difficulty: string,
  qt: string
): ExerciseQuestion[] => {
  const pools: Record<string, ExerciseQuestion[]> = {
    栈: [
      { id: '', stem: '共享栈（两栈共享空间）的栈满条件是什么？', type: '单选题', difficulty: '简单', options: ['A. top1 == 0', 'B. top2 == MAXSIZE', 'C. top1+1 == top2', 'D. top1 == top2'], answer: 'C. top1+1 == top2' },
      { id: '', stem: '中缀表达式 a+b*c 转为后缀表达式的结果是？', type: '单选题', difficulty: '中等', options: ['A. abc*+', 'B. ab+c*', 'C. a*bc+', 'D. +*abc'], answer: 'A. abc*+' },
      { id: '', stem: '设计一个支持 push、pop、min 操作的栈，要求 O(1) 时间。', type: '算法题', difficulty: '中等', options: [], answer: '' },
      { id: '', stem: '用两个栈实现队列的 push 和 pop 操作。', type: '算法题', difficulty: '中等', options: [], answer: '' },
      { id: '', stem: '实现一个栈的数据结构（包含构造函数、push、pop、top）。', type: '代码题', difficulty: '简单', options: [], answer: '' },
      { id: '', stem: '判断出栈序列的合法性。', type: '代码题', difficulty: '中等', options: [], answer: '' },
      { id: '', stem: '回溯算法中栈的作用是什么？', type: '单选题', difficulty: '中等', options: ['A. 存储最终结果', 'B. 保存状态便于回溯', 'C. 计数', 'D. 排序'], answer: 'B. 保存状态便于回溯' },
      { id: '', stem: '自底向上分析（算符优先分析）用到哪种数据结构？', type: '单选题', difficulty: '困难', options: ['A. 栈', 'B. 堆', 'C. 图', 'D. 散列表'], answer: 'A. 栈' },
    ],
    链表: [
      { id: '', stem: '头插法建立单链表的时间复杂度是多少？', type: '单选题', difficulty: '简单', options: ['A. O(1)', 'B. O(n)', 'C. O(n^2)', 'D. O(log n)'], answer: 'B. O(n)' },
      { id: '', stem: 'LRU 缓存适合用哪种数据结构实现？', type: '单选题', difficulty: '中等', options: ['A. 数组', 'B. 链表', 'C. 链表+哈希表', 'D. 栈'], answer: 'C. 链表+哈希表' },
      { id: '', stem: '求两个链表的交点。', type: '算法题', difficulty: '中等', options: [], answer: '' },
      { id: '', stem: '对链表进行插入排序。', type: '代码题', difficulty: '中等', options: [], answer: '' },
      { id: '', stem: '设计支持 O(1) 时间插入、删除、随机访问的数据结构。', type: '算法题', difficulty: '中等', options: [], answer: '' },
      { id: '', stem: '什么是跳表？它与链表的区别是什么？', type: '单选题', difficulty: '困难', options: ['A. 跳表是有序的', 'B. 跳表通过多层索引加速查找', 'C. 跳表不需要指针', 'D. 跳表与链表没有区别'], answer: 'B. 跳表通过多层索引加速查找' },
      { id: '', stem: '链表排序的最优时间复杂度是？', type: '单选题', difficulty: '中等', options: ['A. O(n)', 'B. O(n log n)', 'C. O(n^2)', 'D. O(log n)'], answer: 'B. O(n log n)' },
      { id: '', stem: '实现归并排序对链表进行排序。', type: '代码题', difficulty: '中等', options: [], answer: '' },
    ],
    AVL: [
      { id: '', stem: 'AVL 树删除节点后最多需要几次旋转恢复平衡？', type: '单选题', difficulty: '中等', options: ['A. 1 次', 'B. 2 次', 'C. O(log n) 次', 'D. n 次'], answer: 'C. O(log n) 次' },
      { id: '', stem: 'AVL 树插入节点后最多需要几次旋转？', type: '单选题', difficulty: '简单', options: ['A. 1 次', 'B. 2 次', 'C. 3 次', 'D. 4 次'], answer: 'B. 2 次' },
      { id: '', stem: 'RR 型失衡需要什么旋转？', type: '单选题', difficulty: '简单', options: ['A. 左旋', 'B. 右旋', 'C. 左右旋', 'D. 右左旋'], answer: 'A. 左旋' },
      { id: '', stem: '如何在 AVL 树中查找第 k 小的元素？', type: '算法题', difficulty: '困难', options: [], answer: '' },
      { id: '', stem: 'AVL 树与红黑树的性能差异主要体现在哪里？', type: '单选题', difficulty: '困难', options: ['A. 查找速度', 'B. 插入删除的旋转次数', 'C. 内存占用', 'D. 没有任何差异'], answer: 'B. 插入删除的旋转次数' },
      { id: '', stem: '实现 AVL 树节点高度的更新与平衡因子计算。', type: '代码题', difficulty: '中等', options: [], answer: '' },
      { id: '', stem: '判断一棵二叉树是否为 AVL 树。', type: '代码题', difficulty: '中等', options: [], answer: '' },
      { id: '', stem: '在 AVL 树中插入一个节点并保持平衡。', type: '代码题', difficulty: '困难', options: [], answer: '' },
    ],
  }

  const keyWords = Object.keys(pools)
  const matchedKey = keyWords.find((k) => bankTitle.includes(k)) || keyWords[0]
  const pool = pools[matchedKey] || pools['栈']

  const filtered = pool.filter((q) => {
    let match = true
    if (qt !== '全部') match = match && q.type === qt
    if (difficulty !== '全部') match = match && q.difficulty === difficulty
    return match
  })

  if (filtered.length === 0) return pool.slice(0, count)

  return filtered.slice(0, count)
}

// ── 组件 ──

const ExerciseBankDetailPage = () => {
  const navigate = useNavigate()
  const { courseId = 'course-1', bankId } = useParams<{ courseId: string; bankId: string }>()
  const graphNodes = useGraphStore((s) => s.graphNodes)

  const initialBank = useMemo(() => {
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

  const [questions, setQuestions] = useState<ExerciseQuestion[]>(() => initialBank?.questions ?? [])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [questionForm] = Form.useForm<QuestionFormValues>()
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>('单选题')

  // ── AI 录入 ──
  const [aiInputOpen, setAiInputOpen] = useState(false)
  const [aiInputStep, setAiInputStep] = useState<'input' | 'loading' | 'review'>('input')
  const [aiInputText, setAiInputText] = useState('')
  const [aiInputParsedQuestions, setAiInputParsedQuestions] = useState<ExerciseQuestion[]>([])
  const [aiInputProgress, setAiInputProgress] = useState(0)
  const [aiInputSelected, setAiInputSelected] = useState<Set<number>>(new Set())
  const [aiInputEditingIdx, setAiInputEditingIdx] = useState<number | null>(null)
  const [aiInputEditDraft, setAiInputEditDraft] = useState<ExerciseQuestion | null>(null)

  // ── AI 生题 ──
  const [aiGenOpen, setAiGenOpen] = useState(false)
  const [aiGenStep, setAiGenStep] = useState<'input' | 'loading' | 'review'>('input')
  const [aiGenText, setAiGenText] = useState('')
  const [aiGenType, setAiGenType] = useState('全部')
  const [aiGenDifficulty, setAiGenDifficulty] = useState('全部')
  const [aiGenCount, setAiGenCount] = useState(5)
  const [aiGenQuestions, setAiGenQuestions] = useState<ExerciseQuestion[]>([])
  const [aiGenProgress, setAiGenProgress] = useState(0)
  const [aiGenSelected, setAiGenSelected] = useState<Set<number>>(new Set())
  const [aiGenEditingIdx, setAiGenEditingIdx] = useState<number | null>(null)
  const [aiGenEditDraft, setAiGenEditDraft] = useState<ExerciseQuestion | null>(null)

  if (!initialBank) {
    return (
      <div style={{ padding: 24 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/teacher/courses/${courseId}/exercises`)}>
          返回习题库列表
        </Button>
        <div style={{ marginTop: 48, textAlign: 'center', color: '#999' }}>习题库不存在</div>
      </div>
    )
  }

  const handleAdd = () => {
    setEditingId(null)
    questionForm.resetFields()
    questionForm.setFieldsValue({ type: '单选题', difficulty: '中等', options: ['', '', '', ''], answer: '' })
    setSelectedQuestionType('单选题')
    setModalOpen(true)
  }

  const handleEdit = (question: ExerciseQuestion) => {
    setEditingId(question.id)
    setSelectedQuestionType(question.type)
    questionForm.setFieldsValue({
      stem: question.stem,
      type: question.type,
      difficulty: question.difficulty,
      options: hasOptions(question.type) && question.options.length > 0 ? question.options : ['', '', '', ''],
      answer: question.answer,
    })
    setModalOpen(true)
  }

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后不可恢复，确认删除这道题目？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        setQuestions((prev) => prev.filter((q) => q.id !== id))
        message.success('题目已删除')
      },
    })
  }

  const handleFormSubmit = () => {
    const values = questionForm.getFieldsValue()
    if (!values.stem?.trim()) {
      message.warning('请输入题面')
      return
    }
    if (hasOptions(values.type)) {
      const validOpts = (values.options || []).filter((o: string) => o?.trim())
      if (!values.answer?.trim()) {
        message.warning('请设置正确答案')
        return
      }
      if (values.type === '单选题' && !validOpts.includes(values.answer)) {
        message.warning('正确答案必须在选项中')
        return
      }
    }

    const questionType = values.type || '单选题'
    const difficulty = values.difficulty || '中等'
    const opts = hasOptions(questionType) ? (values.options || []).filter((o: string) => o?.trim()) : []

    if (editingId) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === editingId
            ? { ...q, stem: values.stem.trim(), type: questionType, difficulty, options: opts, answer: values.answer || '' }
            : q
        )
      )
      message.success('题目已更新')
    } else {
      const newQuestion: ExerciseQuestion = {
        id: `q${Date.now()}`,
        stem: values.stem.trim(),
        type: questionType,
        difficulty,
        options: opts,
        answer: values.answer || '',
      }
      setQuestions((prev) => [...prev, newQuestion])
      message.success('题目已添加')
    }

    setModalOpen(false)
  }

  // ── AI 录入 handlers ──
  const openAiInput = () => {
    setAiInputStep('input')
    setAiInputText('')
    setAiInputParsedQuestions([])
    setAiInputProgress(0)
    setAiInputSelected(new Set())
    setAiInputOpen(true)
  }

  const startAiInput = async () => {
    if (!aiInputText.trim()) {
      message.warning('请输入或粘贴文档内容')
      return
    }
    setAiInputStep('loading')
    setAiInputProgress(0)
    const timer = setInterval(() => {
      setAiInputProgress((prev) => {
        if (prev >= 90) return prev
        return prev + Math.random() * 20 + 5
      })
    }, 300)

    try {
      const parsed = await mockAiParseQuestions(aiInputText, initialBank.title)
      clearInterval(timer)
      setAiInputProgress(100)
      setAiInputParsedQuestions(parsed)
      setAiInputSelected(new Set(parsed.map((_, i) => i)))
      setTimeout(() => setAiInputStep('review'), 400)
    } catch {
      clearInterval(timer)
      message.error('AI 识别失败，请重试')
      setAiInputStep('input')
    }
  }

  const confirmAiInput = () => {
    const selected = Array.from(aiInputSelected)
      .filter((i) => i < aiInputParsedQuestions.length)
      .map((i) => {
        const q = aiInputParsedQuestions[i]
        return { ...q, id: `q${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}` }
      })
    if (selected.length === 0) {
      message.warning('请至少选择一道题目')
      return
    }
    setQuestions((prev) => [...prev, ...selected])
    message.success(`已录入 ${selected.length} 道题目`)
    setAiInputOpen(false)
  }

  const startEditAiInput = (i: number) => {
    setAiInputEditingIdx(i)
    setAiInputEditDraft({ ...aiInputParsedQuestions[i] })
  }
  const cancelEditAiInput = () => {
    setAiInputEditingIdx(null)
    setAiInputEditDraft(null)
  }
  const saveEditAiInput = () => {
    if (aiInputEditingIdx === null || !aiInputEditDraft) return
    if (!aiInputEditDraft.stem.trim()) { message.warning('题面不能为空'); return }
    setAiInputParsedQuestions((prev) => {
      const next = [...prev]
      next[aiInputEditingIdx] = { ...aiInputEditDraft, stem: aiInputEditDraft.stem.trim() }
      return next
    })
    setAiInputEditingIdx(null)
    setAiInputEditDraft(null)
  }

  // ── AI 生题 handlers ──
  const openAiGen = () => {
    setAiGenStep('input')
    setAiGenText('')
    setAiGenType('全部')
    setAiGenDifficulty('全部')
    setAiGenCount(5)
    setAiGenQuestions([])
    setAiGenProgress(0)
    setAiGenSelected(new Set())
    setAiGenOpen(true)
  }

  const startAiGen = async () => {
    if (!aiGenText.trim()) {
      message.warning('请输入知识点范围或参考文档')
      return
    }
    setAiGenStep('loading')
    setAiGenProgress(0)
    const timer = setInterval(() => {
      setAiGenProgress((prev) => {
        if (prev >= 85) return prev
        return prev + Math.random() * 15 + 5
      })
    }, 400)

    try {
      const generated = await mockAiGenerateQuestions(initialBank.title, aiGenCount, aiGenDifficulty, aiGenType)
      clearInterval(timer)
      setAiGenProgress(100)
      setAiGenQuestions(generated)
      setAiGenSelected(new Set(generated.map((_, i) => i)))
      setTimeout(() => setAiGenStep('review'), 400)
    } catch {
      clearInterval(timer)
      message.error('AI 生成失败，请重试')
      setAiGenStep('input')
    }
  }

  const confirmAiGen = () => {
    const selected = Array.from(aiGenSelected)
      .filter((i) => i < aiGenQuestions.length)
      .map((i) => {
        const q = aiGenQuestions[i]
        return { ...q, id: `q${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}` }
      })
    if (selected.length === 0) {
      message.warning('请至少选择一道题目')
      return
    }
    setQuestions((prev) => [...prev, ...selected])
    message.success(`已生成并录入 ${selected.length} 道题目`)
    setAiGenOpen(false)
  }

  const startEditAiGen = (i: number) => {
    setAiGenEditingIdx(i)
    setAiGenEditDraft({ ...aiGenQuestions[i] })
  }
  const cancelEditAiGen = () => {
    setAiGenEditingIdx(null)
    setAiGenEditDraft(null)
  }
  const saveEditAiGen = () => {
    if (aiGenEditingIdx === null || !aiGenEditDraft) return
    if (!aiGenEditDraft.stem.trim()) { message.warning('题面不能为空'); return }
    setAiGenQuestions((prev) => {
      const next = [...prev]
      next[aiGenEditingIdx] = { ...aiGenEditDraft, stem: aiGenEditDraft.stem.trim() }
      return next
    })
    setAiGenEditingIdx(null)
    setAiGenEditDraft(null)
  }

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    showUploadList: true,
    beforeUpload: (file) => {
      message.info(`已选择文件: ${file.name}（当前为模拟模式）`)
      return false
    },
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
      ellipsis: true,
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
    {
      title: '答案',
      dataIndex: 'answer',
      key: 'answer',
      width: 160,
      ellipsis: true,
      render: (a: string) => a ? <span style={{ color: '#1A7F1A' }}>{a}</span> : <span style={{ color: '#ccc' }}>未设置</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_: unknown, record: ExerciseQuestion) => (
        <Space size={4}>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={(e) => { e.stopPropagation(); handleEdit(record) }}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={(e) => { e.stopPropagation(); handleDelete(record.id) }}>
            删除
          </Button>
        </Space>
      ),
    },
  ]

  const currentQuestionCount = questions.length

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(`/teacher/courses/${courseId}/exercises`)}
        style={{ marginBottom: 16 }}
      >
        返回习题库列表
      </Button>

      <div style={{
        background: '#fff', borderRadius: 8, padding: '16px 20px', marginBottom: 16,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{initialBank.title}</h3>
          <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{initialBank.description}</div>
          <Space size={8} style={{ marginTop: 8 }}>
            <Tag color={typeColor[initialBank.type]}>{initialBank.type}</Tag>
            <Tag color={difficultyColor[initialBank.difficulty]}>{initialBank.difficulty}</Tag>
            <Tag color={initialBank.status === '已发布' ? 'green' : 'gold'}>{initialBank.status}</Tag>
            <Tag color="purple">挂载: {initialBank.mountedNodeName}</Tag>
            <Tag>{currentQuestionCount} 题</Tag>
          </Space>
        </div>
        <Space>
          <Button icon={<AuditOutlined />} onClick={() => navigate(`/teacher/courses/${courseId}/exercises/${bankId}/review`)}>做题情况</Button>
          <Button icon={<RobotOutlined />} onClick={openAiInput}>AI录入</Button>
          <Button icon={<ThunderboltOutlined />} onClick={openAiGen}>AI生题</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>添加题目</Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={questions}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        style={{ background: '#fff', borderRadius: 8 }}
      />

      {/* ── 手动添加/编辑题目 Modal ── */}
      <Modal
        title={editingId ? '编辑题目' : '添加题目'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={660}
        destroyOnClose
        footer={[
          <Button key="cancel" onClick={() => setModalOpen(false)}>取消</Button>,
          <Button key="save" type="primary" onClick={handleFormSubmit}>{editingId ? '保存' : '添加'}</Button>,
        ]}
      >
        <Form form={questionForm} layout="vertical">
          <Form.Item name="type" label="题型" rules={[{ required: true, message: '请选择题型' }]}>
            <Select
              options={questionTypes.map((t) => ({ label: t, value: t }))}
              onChange={(val) => {
                setSelectedQuestionType(val)
                if (hasOptions(val) && !editingId) {
                  questionForm.setFieldsValue({ options: ['', '', '', ''], answer: '' })
                }
              }}
            />
          </Form.Item>

          <Form.Item name="difficulty" label="难度" rules={[{ required: true, message: '请选择难度' }]}>
            <Select options={difficultyLevels.map((d) => ({ label: d, value: d }))} />
          </Form.Item>

          <Form.Item name="stem" label="题面" rules={[{ required: true, message: '请输入题面' }]}>
            <Input.TextArea rows={3} placeholder="请输入题目描述..." />
          </Form.Item>

          {hasOptions(selectedQuestionType) && (
            <>
              <Form.Item label="选项">
                <Space direction="vertical" style={{ width: '100%' }}>
                  {['A', 'B', 'C', 'D'].map((letter, idx) => (
                    <Form.Item
                      key={idx}
                      name={['options', idx]}
                      noStyle
                      rules={idx < 2 ? [{ required: true, message: `请输入选项 ${letter}` }] : undefined}
                    >
                      <Input
                        placeholder={`选项 ${letter}`}
                        addonBefore={letter}
                      />
                    </Form.Item>
                  ))}
                </Space>
              </Form.Item>

              <Form.Item name="answer" label="正确答案">
                <Select placeholder="选择正确答案">
                  {(questionForm.getFieldValue('options') || []).filter((o: string) => o?.trim()).map((opt: string) => (
                    <Select.Option key={opt} value={opt}>{opt}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </>
          )}

          {!hasOptions(selectedQuestionType) && (
            <Form.Item name="answer" label="参考答案">
              <Input.TextArea rows={4} placeholder="请输入参考答案..." />
            </Form.Item>
          )}
        </Form>
      </Modal>

      {/* ── AI 录入 Modal ── */}
      <Modal
        title={
          <Space>
            <RobotOutlined style={{ color: '#956BF5' }} />
            <span>AI 智能录入</span>
          </Space>
        }
        open={aiInputOpen}
        onCancel={() => setAiInputOpen(false)}
        width={720}
        destroyOnClose
        footer={
          aiInputStep === 'review' ? (
            <Space>
              <Button onClick={() => { setAiInputStep('input'); setAiInputText('') }}>重新录入</Button>
              <Button type="primary" onClick={confirmAiInput}>
                确认录入（{aiInputSelected.size} 题）
              </Button>
            </Space>
          ) : aiInputStep === 'loading' ? null : (
            <Space>
              <Button onClick={() => setAiInputOpen(false)}>取消</Button>
              <Button type="primary" onClick={startAiInput} icon={<RobotOutlined />}>开始识别</Button>
            </Space>
          )
        }
      >
        {aiInputStep === 'input' && (
          <div>
            <div style={{ marginBottom: 16, color: '#666', fontSize: 13 }}>
              上传课件、笔记、试卷等文档，或直接粘贴文字内容，AI 将自动识别其中的题目并提取。
            </div>

            <Dragger {...uploadProps} style={{ marginBottom: 16 }}>
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">支持 .txt、.md、.docx、.pdf 格式（当前为模拟模式）</p>
            </Dragger>

            <Divider plain>或直接粘贴文本</Divider>

            <Input.TextArea
              rows={8}
              placeholder="请粘贴需要识别的文档内容，例如：&#10;&#10;栈（Stack）是一种后进先出（LIFO）的线性数据结构。栈的基本操作包括 push（入栈）、pop（出栈）、peek（查看栈顶元素）。&#10;&#10;1. 栈的入栈和出栈操作遵循什么原则？&#10;2. 如何用栈实现队列？"
              value={aiInputText}
              onChange={(e) => setAiInputText(e.target.value)}
            />
          </div>
        )}

        {aiInputStep === 'loading' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, fontSize: 14, color: '#666' }}>AI 正在识别题目...</div>
            <div style={{ width: 300, margin: '24px auto' }}>
              <Progress percent={Math.round(aiInputProgress)} status="active" strokeColor="#956BF5" />
            </div>
          </div>
        )}

        {aiInputStep === 'review' && (
          <div>
            <div style={{ marginBottom: 12, fontSize: 14, color: '#666' }}>
              AI 识别到 <strong>{aiInputParsedQuestions.length}</strong> 道题目，可点击题目旁的编辑按钮修改后录入：
            </div>
            <div style={{ maxHeight: 400, overflow: 'auto' }}>
              {aiInputParsedQuestions.map((q, i) => {
                const editing = aiInputEditingIdx === i
                const draft = editing ? aiInputEditDraft : null
                const displayQ = draft || q
                const isChoice = hasOptions(displayQ.type)

                return (
                  <div
                    key={i}
                    style={{
                      padding: editing ? 12 : '10px 12px',
                      marginBottom: 8,
                      background: editing ? '#fff' : aiInputSelected.has(i) ? '#F5F0FF' : '#fafafa',
                      borderRadius: 6,
                      border: editing ? '1px solid #956BF5' : aiInputSelected.has(i) ? '1px solid #D9B8FF' : '1px solid #f0f0f0',
                    }}
                  >
                    {editing ? (
                      <div>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                          <Select
                            size="small"
                            style={{ width: 100 }}
                            value={displayQ.type}
                            onChange={(val) => setAiInputEditDraft((prev) => prev ? { ...prev, type: val, options: hasOptions(val) ? (prev.options.length ? prev.options : ['', '', '', '']) : [] } : null)}
                            options={questionTypes.map((t) => ({ label: t, value: t }))}
                          />
                          <Select
                            size="small"
                            style={{ width: 90 }}
                            value={displayQ.difficulty}
                            onChange={(val) => setAiInputEditDraft((prev) => prev ? { ...prev, difficulty: val } : null)}
                            options={difficultyLevels.map((d) => ({ label: d, value: d }))}
                          />
                        </div>
                        <Input.TextArea
                          rows={2}
                          style={{ marginBottom: 8 }}
                          value={displayQ.stem}
                          onChange={(e) => setAiInputEditDraft((prev) => prev ? { ...prev, stem: e.target.value } : null)}
                          placeholder="题面"
                        />
                        {isChoice && (
                          <div style={{ marginBottom: 8 }}>
                            <Space direction="vertical" style={{ width: '100%' }}>
                              {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                                <Input
                                  key={optIdx}
                                  size="small"
                                  placeholder={`选项 ${letter}`}
                                  addonBefore={letter}
                                  value={(displayQ.options || [])[optIdx] || ''}
                                  onChange={(e) => {
                                    setAiInputEditDraft((prev) => {
                                      if (!prev) return null
                                      const opts = [...(prev.options || [])]
                                      while (opts.length <= optIdx) opts.push('')
                                      opts[optIdx] = e.target.value
                                      return { ...prev, options: opts }
                                    })
                                  }}
                                />
                              ))}
                            </Space>
                          </div>
                        )}
                        <div style={{ marginBottom: 4, fontSize: 13, color: '#666' }}>{isChoice ? '正确答案' : '参考答案'}</div>
                          {isChoice ? (
                            <Select
                              size="small"
                              style={{ width: '100%' }}
                              value={displayQ.answer || undefined}
                              onChange={(val) => setAiInputEditDraft((prev) => prev ? { ...prev, answer: val } : null)}
                            >
                              {(displayQ.options || []).filter((o: string) => o?.trim()).map((opt: string) => (
                                <Select.Option key={opt} value={opt}>{opt}</Select.Option>
                              ))}
                            </Select>
                          ) : (
                            <Input.TextArea
                              size="small"
                              rows={2}
                              value={displayQ.answer}
                              onChange={(e) => setAiInputEditDraft((prev) => prev ? { ...prev, answer: e.target.value } : null)}
                              placeholder="参考答案"
                            />
                          )}
                        <Space>
                          <Button size="small" type="primary" onClick={saveEditAiInput}>保存</Button>
                          <Button size="small" onClick={cancelEditAiInput}>取消</Button>
                        </Space>
                      </div>
                    ) : (
                      <div
                        style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}
                        onClick={() => {
                          const next = new Set(aiInputSelected)
                          if (next.has(i)) next.delete(i)
                          else next.add(i)
                          setAiInputSelected(next)
                        }}
                      >
                        <Checkbox checked={aiInputSelected.has(i)} style={{ marginTop: 2 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, marginBottom: 4 }}>{i + 1}. {q.stem}</div>
                          <Space size={4}>
                            <Tag color={typeColor[q.type]} style={{ fontSize: 11 }}>{q.type}</Tag>
                            <Tag color={difficultyColor[q.difficulty]} style={{ fontSize: 11 }}>{q.difficulty}</Tag>
                            {q.answer && <Tag color="green" style={{ fontSize: 11 }}>答案: {q.answer}</Tag>}
                          </Space>
                          {q.options.length > 0 && (
                            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                              {q.options.join('  |  ')}
                            </div>
                          )}
                        </div>
                        <Button
                          type="link"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={(e) => { e.stopPropagation(); startEditAiInput(i) }}
                          style={{ flexShrink: 0 }}
                        >
                          编辑
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Modal>

      {/* ── AI 生题 Modal ── */}
      <Modal
        title={
          <Space>
            <ThunderboltOutlined style={{ color: '#FAAD14' }} />
            <span>AI 智能生题</span>
          </Space>
        }
        open={aiGenOpen}
        onCancel={() => setAiGenOpen(false)}
        width={720}
        destroyOnClose
        footer={
          aiGenStep === 'review' ? (
            <Space>
              <Button onClick={() => { setAiGenStep('input'); setAiGenText('') }}>重新生成</Button>
              <Button type="primary" onClick={confirmAiGen}>
                确认添加（{aiGenSelected.size} 题）
              </Button>
            </Space>
          ) : aiGenStep === 'loading' ? null : (
            <Space>
              <Button onClick={() => setAiGenOpen(false)}>取消</Button>
              <Button type="primary" onClick={startAiGen} icon={<ThunderboltOutlined />}>开始生成</Button>
            </Space>
          )
        }
      >
        {aiGenStep === 'input' && (
          <div>
            <div style={{ marginBottom: 16, color: '#666', fontSize: 13 }}>
              输入知识点范围或参考文档内容，指定题型和数量，AI 将基于知识图谱自动生成题目。
            </div>

            <Form layout="vertical">
              <Form.Item label="知识点范围 / 参考内容">
                <Input.TextArea
                  rows={5}
                  placeholder="输入需要出题的知识点范围，可粘贴相关教材内容...
例如：栈的入栈、出栈操作，栈的应用——括号匹配、表达式求值、递归实现。"
                  value={aiGenText}
                  onChange={(e) => setAiGenText(e.target.value)}
                />
              </Form.Item>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <Form.Item label="题目类型">
                  <Select value={aiGenType} onChange={setAiGenType}>
                    <Select.Option value="全部">全部类型</Select.Option>
                    {questionTypes.map((t) => (
                      <Select.Option key={t} value={t}>{t}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label="难度">
                  <Select value={aiGenDifficulty} onChange={setAiGenDifficulty}>
                    <Select.Option value="全部">全部难度</Select.Option>
                    {difficultyLevels.map((d) => (
                      <Select.Option key={d} value={d}>{d}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label={`生成数量`}>
                  <div style={{ display: 'flex', alignItems: 'center', height: 32 }}>
                    <span style={{ marginRight: 8, fontSize: 12, color: '#999' }}>1</span>
                    <Slider
                      style={{ flex: 1, margin: 0 }}
                      min={1}
                      max={20}
                      value={aiGenCount}
                      onChange={setAiGenCount}
                    />
                    <span style={{ marginLeft: 8, fontWeight: 600, width: 28, textAlign: 'center' }}>{aiGenCount}</span>
                  </div>
                </Form.Item>
              </div>
            </Form>
          </div>
        )}

        {aiGenStep === 'loading' && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, fontSize: 14, color: '#666' }}>AI 正在生成题目...</div>
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              基于知识图谱生成 {aiGenCount} 道题目
            </div>
            <div style={{ width: 300, margin: '24px auto' }}>
              <Progress percent={Math.round(aiGenProgress)} status="active" strokeColor="#FAAD14" />
            </div>
          </div>
        )}

        {aiGenStep === 'review' && (
          <div>
            <div style={{ marginBottom: 12, fontSize: 14, color: '#666' }}>
              AI 已生成 <strong>{aiGenQuestions.length}</strong> 道题目，可点击题目旁的编辑按钮修改后添加：
            </div>
            <div style={{ maxHeight: 400, overflow: 'auto' }}>
              {aiGenQuestions.map((q, i) => {
                const editing = aiGenEditingIdx === i
                const draft = editing ? aiGenEditDraft : null
                const displayQ = draft || q
                const isChoice = hasOptions(displayQ.type)

                return (
                  <div
                    key={i}
                    style={{
                      padding: editing ? 12 : '10px 12px',
                      marginBottom: 8,
                      background: editing ? '#fff' : aiGenSelected.has(i) ? '#FFFBE6' : '#fafafa',
                      borderRadius: 6,
                      border: editing ? '1px solid #FAAD14' : aiGenSelected.has(i) ? '1px solid #FFE58F' : '1px solid #f0f0f0',
                    }}
                  >
                    {editing ? (
                      <div>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                          <Select
                            size="small"
                            style={{ width: 100 }}
                            value={displayQ.type}
                            onChange={(val) => setAiGenEditDraft((prev) => prev ? { ...prev, type: val, options: hasOptions(val) ? (prev.options.length ? prev.options : ['', '', '', '']) : [] } : null)}
                            options={questionTypes.map((t) => ({ label: t, value: t }))}
                          />
                          <Select
                            size="small"
                            style={{ width: 90 }}
                            value={displayQ.difficulty}
                            onChange={(val) => setAiGenEditDraft((prev) => prev ? { ...prev, difficulty: val } : null)}
                            options={difficultyLevels.map((d) => ({ label: d, value: d }))}
                          />
                        </div>
                        <Input.TextArea
                          rows={2}
                          style={{ marginBottom: 8 }}
                          value={displayQ.stem}
                          onChange={(e) => setAiGenEditDraft((prev) => prev ? { ...prev, stem: e.target.value } : null)}
                          placeholder="题面"
                        />
                        {isChoice && (
                          <div style={{ marginBottom: 8 }}>
                            <Space direction="vertical" style={{ width: '100%' }}>
                              {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                                <Input
                                  key={optIdx}
                                  size="small"
                                  placeholder={`选项 ${letter}`}
                                  addonBefore={letter}
                                  value={(displayQ.options || [])[optIdx] || ''}
                                  onChange={(e) => {
                                    setAiGenEditDraft((prev) => {
                                      if (!prev) return null
                                      const opts = [...(prev.options || [])]
                                      while (opts.length <= optIdx) opts.push('')
                                      opts[optIdx] = e.target.value
                                      return { ...prev, options: opts }
                                    })
                                  }}
                                />
                              ))}
                            </Space>
                          </div>
                        )}
                        <div style={{ marginBottom: 4, fontSize: 13, color: '#666' }}>{isChoice ? '正确答案' : '参考答案'}</div>
                          {isChoice ? (
                            <Select
                              size="small"
                              style={{ width: '100%' }}
                              value={displayQ.answer || undefined}
                              onChange={(val) => setAiGenEditDraft((prev) => prev ? { ...prev, answer: val } : null)}
                            >
                              {(displayQ.options || []).filter((o: string) => o?.trim()).map((opt: string) => (
                                <Select.Option key={opt} value={opt}>{opt}</Select.Option>
                              ))}
                            </Select>
                          ) : (
                            <Input.TextArea
                              size="small"
                              rows={2}
                              value={displayQ.answer}
                              onChange={(e) => setAiGenEditDraft((prev) => prev ? { ...prev, answer: e.target.value } : null)}
                              placeholder="参考答案"
                            />
                          )}
                        <Space>
                          <Button size="small" type="primary" onClick={saveEditAiGen}>保存</Button>
                          <Button size="small" onClick={cancelEditAiGen}>取消</Button>
                        </Space>
                      </div>
                    ) : (
                      <div
                        style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}
                        onClick={() => {
                          const next = new Set(aiGenSelected)
                          if (next.has(i)) next.delete(i)
                          else next.add(i)
                          setAiGenSelected(next)
                        }}
                      >
                        <Checkbox checked={aiGenSelected.has(i)} style={{ marginTop: 2 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, marginBottom: 4 }}>{i + 1}. {q.stem}</div>
                          <Space size={4}>
                            <Tag color={typeColor[q.type]} style={{ fontSize: 11 }}>{q.type}</Tag>
                            <Tag color={difficultyColor[q.difficulty]} style={{ fontSize: 11 }}>{q.difficulty}</Tag>
                            {q.answer && <Tag color="green" style={{ fontSize: 11 }}>答案: {q.answer}</Tag>}
                          </Space>
                          {q.options.length > 0 && (
                            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                              {q.options.join('  |  ')}
                            </div>
                          )}
                        </div>
                        <Button
                          type="link"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={(e) => { e.stopPropagation(); startEditAiGen(i) }}
                          style={{ flexShrink: 0 }}
                        >
                          编辑
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ExerciseBankDetailPage
