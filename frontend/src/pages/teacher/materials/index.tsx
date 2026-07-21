// 课程资料管理页 — 紧凑列表样式

import { useState } from 'react'
import { Button, Upload, Modal, Tag, Input, Select } from 'antd'
import { useNavigate } from 'react-router-dom'
import { UploadOutlined, FilePdfOutlined, FilePptOutlined, FileTextOutlined, VideoCameraOutlined, SearchOutlined } from '@ant-design/icons'
import { useWorkspaceStore } from '../../../stores/workspaceStore'
import { useGraphStore } from '../../../stores/graphStore'

// 资料 ID 到图谱节点 ID 的映射
const materialToNodeId: Record<string, string> = {
  'm1': 'm1', 'm2': 'm2', 'm3': 'm3', 'm4': 'm4', 'm5': 'm5', 'm6': 'm6',
}

const fileIcons: Record<string, { icon: React.ReactNode; label: string }> = {
  pdf:   { icon: <FilePdfOutlined style={{ color: '#CF222E' }} />,       label: 'PDF' },
  ppt:   { icon: <FilePptOutlined style={{ color: '#D4A72C' }} />,       label: 'PPT' },
  doc:   { icon: <FileTextOutlined style={{ color: '#1A7F1A' }} />,      label: '文档' },
  video: { icon: <VideoCameraOutlined style={{ color: '#956BF5' }} />,   label: '视频' },
  code:  { icon: <FileTextOutlined style={{ color: '#2C2C2C' }} />,      label: '代码' },
  other: { icon: <FileTextOutlined style={{ color: '#999' }} />,          label: '其他' },
}

interface Material { id: string; title: string; fileType: string; uploadedAt: string; mountedNodes: string[] }

const mockMaterials: Material[] = [
  { id: 'm1', title: '第三章 栈与队列.pptx', fileType: 'ppt', uploadedAt: '2026-07-10', mountedNodes: ['栈', '队列'] },
  { id: 'm2', title: '链表操作详解.pdf', fileType: 'pdf', uploadedAt: '2026-07-12', mountedNodes: ['链表'] },
  { id: 'm3', title: '二叉树遍历动画.mp4', fileType: 'video', uploadedAt: '2026-07-14', mountedNodes: ['二叉树'] },
  { id: 'm4', title: '快速排序算法分析.md', fileType: 'code', uploadedAt: '2026-07-15', mountedNodes: ['快速排序'] },
  { id: 'm5', title: '堆排序图解.pdf', fileType: 'pdf', uploadedAt: '2026-07-13', mountedNodes: ['堆排序'] },
  { id: 'm6', title: '红黑树旋转演示.pptx', fileType: 'ppt', uploadedAt: '2026-07-16', mountedNodes: ['红黑树'] },
]

const MaterialsPage = () => {
  const [materials] = useState<Material[]>(mockMaterials)
  const navigate = useNavigate()
  const openTab = useWorkspaceStore((s) => s.openTab)
  const setSelectedNodeId = useGraphStore((s) => s.setSelectedNodeId)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [fileTypeFilter, setFileTypeFilter] = useState('all')
  const [mountFilter, setMountFilter] = useState('all')

  const filtered = materials.filter((m) => {
    if (searchText && !m.title.includes(searchText)) return false
    if (fileTypeFilter !== 'all' && m.fileType !== fileTypeFilter) return false
    if (mountFilter === 'mounted' && m.mountedNodes.length === 0) return false
    if (mountFilter === 'unmounted' && m.mountedNodes.length > 0) return false
    return true
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>资料管理</h3>
        <Button type="primary" icon={<UploadOutlined />} onClick={() => setUploadOpen(true)}>上传资料</Button>
      </div>

      {/* 筛选栏 */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <Input prefix={<SearchOutlined />} placeholder="搜索资料名称..." value={searchText}
          onChange={(e) => setSearchText(e.target.value)} style={{ width: 260 }} allowClear />
        <Select value={fileTypeFilter} onChange={setFileTypeFilter} style={{ width: 120 }}
          options={[
            { value: 'all', label: '全部类型' },
            { value: 'ppt', label: 'PPT' },
            { value: 'pdf', label: 'PDF' },
            { value: 'code', label: '代码' },
            { value: 'video', label: '视频' },
          ]} />
        <Select value={mountFilter} onChange={setMountFilter} style={{ width: 120 }}
          options={[
            { value: 'all', label: '全部状态' },
            { value: 'mounted', label: '已挂载' },
            { value: 'unmounted', label: '未挂载' },
          ]} />
        <span style={{ fontSize: 12, color: '#999', lineHeight: '32px', marginLeft: 'auto' }}>
          {filtered.length} 条
        </span>
      </div>

      {/* 文件列表 */}
      <div style={{ background: '#fff', borderRadius: 8, border: '0.5px solid var(--color-border)', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#999', padding: 48, fontSize: 14 }}>暂无匹配资料</div>
        ) : (
          filtered.map((m, i) => {
            const cfg = fileIcons[m.fileType] || fileIcons.other
            return (
              <div key={m.id} style={{
                padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12,
                borderBottom: i < filtered.length - 1 ? '0.5px solid var(--color-border)' : 'none',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FAFAFA' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                onDoubleClick={() => {
                  const nodeId = materialToNodeId[m.id] || m.id
                  setSelectedNodeId(nodeId)
                  openTab({ key: nodeId, label: m.title, type: 'editor', nodeId })
                  navigate('/teacher/courses/course-1/graph')
                }}
              >
                {cfg.icon}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.title}
                  </div>
                  <div style={{ fontSize: 11, color: '#999' }}>
                    {cfg.label} · {m.uploadedAt}
                  </div>
                </div>
                {m.mountedNodes.length > 0 ? (
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    {m.mountedNodes.map((node) => (
                      <Tag key={node} style={{ fontSize: 11, margin: 0 }}>{node}</Tag>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: 11, color: '#999', flexShrink: 0 }}>未挂载</span>
                )}
              </div>
            )
          })
        )}
      </div>

      <Modal title="上传资料" open={uploadOpen} onCancel={() => setUploadOpen(false)} onOk={() => setUploadOpen(false)}>
        <Upload.Dragger multiple beforeUpload={() => false}>
          <p><UploadOutlined style={{ fontSize: 24 }} /></p>
          <p>点击或拖拽文件上传</p>
        </Upload.Dragger>
      </Modal>
    </div>
  )
}

export default MaterialsPage
