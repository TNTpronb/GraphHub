// 新建课程向导 — 四步流程

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Steps, Button, Form, Input, Select, Upload, Progress, message, Divider, Modal } from 'antd'
import { InboxOutlined, PlusOutlined } from '@ant-design/icons'

const { Dragger } = Upload
// const { Step } = Steps

/*
  步骤流转：
  Step 0: 课程信息表单
  Step 1: 上传课件资料
  Step 2: AI 生成图谱（进度条 + 日志）
  Step 3: 预览校验 → 确认发布
*/

const CreateCourseWizard = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [form] = Form.useForm()

  // 课程信息
  const [courseInfo, setCourseInfo] = useState({ name: '', className: '', semester: '' })
  // 班级列表（可新建）
  const [classOptions, setClassOptions] = useState([
    { value: '计科2101', label: '计科 2101 班' },
    { value: '计科2102', label: '计科 2102 班' },
    { value: '计科2103', label: '计科 2103 班' },
  ])

  // 上传的文件列表（模拟：实际接 MinIO）
  const [fileList, setFileList] = useState<any[]>([])

  // AI 生成状态
  const [generating, setGenerating] = useState(false)
  const [genProgress, setGenProgress] = useState(0)
  const [genLogs, setGenLogs] = useState<string[]>([])
  // 新建班级弹窗
  const [newClassModal, setNewClassModal] = useState(false)
  const [newClassName, setNewClassName] = useState('')

  const handleCreateClass = () => {
    if (!newClassName.trim()) return
    const val = `custom-${Date.now()}`
    setClassOptions((prev) => [...prev, { value: val, label: newClassName.trim() }])
    const current = form.getFieldValue('classes') || []
    form.setFieldsValue({ classes: [...current, val] })
    setNewClassName('')
    setNewClassModal(false)
  }

  // Step 0 → Step 1
  const handleNextFromInfo = () => {
    form.validateFields().then((values) => {
      setCourseInfo(values)
      setCurrentStep(1)
    })
  }

  // Step 1 → Step 2（开始 AI 生成）
  const handleStartGenerate = () => {
    setCurrentStep(2)
    setGenerating(true)
    // 模拟 AI 生成进度（3 个阶段）
    const stages = [
      { progress: 30, log: '实体抽取中：从《第三章 栈与队列.pptx》识别到 12 个候选知识节点' },
      { progress: 60, log: '关系生成中：建立 8 条 PREREQUISITE 依赖、15 条 CONTAINS 关系' },
      { progress: 90, log: '校验去重中：合并 3 个重复节点，标记 2 个易错点' },
      { progress: 100, log: '生成完成：共创建 50 个节点、45 条关系' },
    ]
    stages.forEach((stage, idx) => {
      setTimeout(() => {
        setGenProgress(stage.progress)
        setGenLogs((prev) => [...prev, stage.log])
        if (idx === stages.length - 1) {
          setGenerating(false)
          message.success('知识图谱生成完成！请预览并确认。')
        }
      }, (idx + 1) * 1500)
    })
  }

  // Step 3 → 完成 → 跳转
  const handlePreview = () => {
    // 跳转到新课程的真实图谱管理页
    navigate('/teacher/courses/course-new/graph')
  }

  // ── 步骤条配置 ──
  const steps = [
    { title: '课程信息' },
    { title: '上传资料' },
    { title: 'AI 生成' },
  ]

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* ★ 步骤条 */}
      <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

      {/* ── Step 0：课程信息 ── */}
      {currentStep === 0 && (
        <div style={{ background: '#fff', padding: 24, borderRadius: 8, border: '0.5px solid var(--color-border)' }}>
          <Form form={form} layout="vertical" initialValues={courseInfo}>
            <Form.Item name="name" label="课程名称" rules={[{ required: true }]}>
              <Input placeholder="例如：数据结构" />
            </Form.Item>
            <Form.Item name="classes" label="授课班级" rules={[{ required: true, message: '请选择至少一个班级' }]}>
              <Select
                mode="multiple"
                placeholder="选择授课班级（可多选）"
                options={classOptions}
                style={{ width: '100%' }}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider style={{ margin: '8px 0' }} />
                    <div style={{ padding: '0 8px 4px' }}>
                      <Button
                        type="link"
                        icon={<PlusOutlined />}
                        onClick={() => setNewClassModal(true)}
                        style={{ padding: 0, fontSize: 13 }}
                      >
                        + 新建班级
                      </Button>
                    </div>
                  </>
                )}
              />
            </Form.Item>
            <Form.Item name="semester" label="学期" rules={[{ required: true }]}>
              <Select placeholder="选择学期" options={[
                { value: '2025-2026-1', label: '2025-2026 第一学期' },
                { value: '2025-2026-2', label: '2025-2026 第二学期' },
              ]} />
            </Form.Item>
          </Form>
          <div style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={handleNextFromInfo}>下一步：上传资料</Button>
          </div>
        </div>
      )}

      {/* ── Step 1：上传资料 ── */}
      {currentStep === 1 && (
        <div style={{ background: '#fff', padding: 24, borderRadius: 8, border: '0.5px solid var(--color-border)' }}>
          <Dragger
            multiple
            fileList={fileList}
            onChange={({ fileList: newList }) => setFileList(newList)}
            beforeUpload={() => false}  // ● 阻止自动上传，手动控制
            accept=".ppt,.pptx,.pdf,.doc,.docx,.md,.py,.java,.cpp"
          >
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p>点击或拖拽文件到此区域上传</p>
            <p style={{ color: 'var(--color-text-tertiary)', fontSize: 12 }}>
              支持 PPT、PDF、Word、Markdown、代码文件
            </p>
          </Dragger>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <Button onClick={() => setCurrentStep(0)}>上一步</Button>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={handlePreview}>跳过 AI 生成，直接创建</Button>
              <Button type="primary" onClick={handleStartGenerate} disabled={fileList.length === 0}>
                AI 生成知识图谱
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2：AI 生成中 ── */}
      {currentStep === 2 && (
        <div style={{ background: '#fff', padding: 24, borderRadius: 8, border: '0.5px solid var(--color-border)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Progress type="circle" percent={genProgress} />
            <p style={{ marginTop: 16, color: 'var(--color-text-secondary)' }}>
              {generating ? 'AI 正在分析文档并生成知识图谱...' : '生成完成！'}
            </p>
          </div>
          {/* 生成日志 */}
          <div style={{
            background: '#FAFAFA',
            borderRadius: 6,
            padding: 12,
            maxHeight: 240,
            overflow: 'auto',
            fontSize: 13,
            fontFamily: 'var(--font-mono)',
            lineHeight: 1.8,
          }}>
            {genLogs.map((log, i) => (
              <div key={i} style={{ color: 'var(--color-text-secondary)' }}>
                [{new Date().toLocaleTimeString()}] {log}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
              <Button onClick={() => setCurrentStep(1)} disabled={generating}>上一步</Button>
              <Button type="primary" onClick={handlePreview} disabled={generating}>
                预览校验
              </Button>
          </div>
        </div>
      )}
      <Modal
        title="新建班级"
        open={newClassModal}
        onCancel={() => { setNewClassModal(false); setNewClassName('') }}
        onOk={handleCreateClass}
        okText="创建"
        cancelText="取消"
      >
        <Input
          placeholder="输入班级名称，如：计科 2104 班"
          value={newClassName}
          onChange={(e) => setNewClassName(e.target.value)}
          onPressEnter={handleCreateClass}
          autoFocus
        />
      </Modal>
    </div>
  )
}

export default CreateCourseWizard