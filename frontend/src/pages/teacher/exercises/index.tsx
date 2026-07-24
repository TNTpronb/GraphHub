// 教师端习题库管理页

import { useState, useMemo } from 'react'
import { Button, Form, Input, Modal, Select, Space, Switch, Table, Tag } from 'antd'
import type { TableProps } from 'antd'
import { ImportOutlined, PlusOutlined } from '@ant-design/icons'
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
  mountedNodeId: string
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
    mountedNodeId: 'n9',
    mountedNodeName: '栈',
    questionCount: 8,
    status: '已发布',
    retryLimit: 0,
    aiGradingEnabled: true,
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
    mountedNodeId: 'n8',
    mountedNodeName: '链表',
    questionCount: 12,
    status: '已发布',
    retryLimit: 1,
    aiGradingEnabled: false,
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
    mountedNodeId: 'n13',
    mountedNodeName: 'AVL 树',
    questionCount: 6,
    status: '待审核',
    retryLimit: 0,
    aiGradingEnabled: false,
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

const TeacherExercisesPage = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm<ExerciseBank>()
  const navigate = useNavigate()
  const { courseId = 'course-1' } = useParams()
  const addExerciseBank = useGraphStore((s) => s.addExerciseBank)
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
          mountedNodeId: '',
          mountedNodeName: '-',
          questionCount: 0,
          status: '草稿',
          retryLimit: 0,
          aiGradingEnabled: false,
          questions: [],
        }
      })
  }, [graphNodes])

  const handleCreate = () => {
    const values = form.getFieldsValue(['title', 'description', 'retryLimit', 'aiGradingEnabled']) as { title?: string; description?: string; retryLimit?: number; aiGradingEnabled?: boolean }
    if (!values.title?.trim()) return
    addExerciseBank(values.title.trim(), values.description || '', values.retryLimit ?? 0, values.aiGradingEnabled ?? true)
    form.resetFields()
    setModalOpen(false)
  }

  const jumpToExerciseDetail = (bank: ExerciseBank) => {
    navigate(`/teacher/courses/${courseId}/exercises/${bank.key}`)
  }

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
      title: '挂载节点',
      dataIndex: 'mountedNodeName',
      key: 'mountedNodeName',
      width: 120,
      render: (name: string) => <Tag color="purple">{name}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: string) => <Tag color={status === '已发布' ? 'green' : 'gold'}>{status}</Tag>,
    },
    {
      title: '重做次数',
      dataIndex: 'retryLimit',
      key: 'retryLimit',
      width: 100,
      render: (v: number) => v === 0 ? '不限' : `${v} 次`,
    },
    {
      title: 'AI 判题',
      dataIndex: 'aiGradingEnabled',
      key: 'aiGradingEnabled',
      width: 100,
      render: (v: boolean) => v ? '启用' : '关闭',
    },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>习题库</h3>
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>一个习题库作为一个图谱节点，内部维护多道同类题。</div>
        </div>
        <Space>
          <Button icon={<ImportOutlined />}>批量导入</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setModalOpen(true) }}>
            新建习题库
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={exerciseBanks}
        pagination={{ pageSize: 10 }}
        style={{ background: '#fff', borderRadius: 8 }}
        onRow={(record) => ({
          onDoubleClick: () => jumpToExerciseDetail(record),
          style: { cursor: 'pointer' },
        })}
      />

      <Modal
        title="新建习题库"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={480}
        footer={[
          <Button key="cancel" onClick={() => setModalOpen(false)}>取消</Button>,
          <Button key="save" type="primary" onClick={handleCreate}>创建</Button>,
        ]}
      >
        <Form form={form} layout="vertical" initialValues={{ retryLimit: 0, aiGradingEnabled: true }}>
          <Form.Item name="title" label="习题库名称">
            <Input placeholder="例如：栈基础练习" />
          </Form.Item>
          <Form.Item name="description" label="习题库说明">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="retryLimit" label="重新作答次数">
            <Select options={[
              { value: 0, label: '不限' },
              { value: 1, label: '1 次' },
              { value: 2, label: '2 次' },
              { value: 3, label: '3 次' },
              { value: 5, label: '5 次' },
              { value: 10, label: '10 次' },
            ]} />
          </Form.Item>
          <Form.Item name="aiGradingEnabled" label="启用 AI 判题" valuePropName="checked" tooltip="针对主观题，启用后系统自动判分">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TeacherExercisesPage
