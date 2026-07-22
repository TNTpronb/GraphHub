// 知识图谱文件资源管理器
// MD 节点 + 资料节点统一在树中展示

import { useState, useMemo, useCallback, useEffect } from 'react'
import { Input, Tree, Dropdown, message, Modal } from 'antd'
import type { DataNode } from 'antd/es/tree'
import {
  SearchOutlined, FolderOutlined, FolderOpenOutlined, FileTextOutlined,
  CodeOutlined, ExperimentOutlined, BugOutlined, BulbOutlined,
  MoreOutlined, EditOutlined, DeleteOutlined, ImportOutlined,
  FormOutlined, FolderAddOutlined, LinkOutlined, BookOutlined,
} from '@ant-design/icons'
import { useGraphStore } from '../../stores/graphStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'
import { useNavigate, useParams } from 'react-router-dom'

const tagIconMap: Record<string, { icon: React.ReactNode; label: string }> = {
  '#subject':             { icon: <FolderOpenOutlined style={{ color: '#956BF5' }} />,      label: '学科' },
  '#chapter':             { icon: <FolderOutlined style={{ color: '#7B52E0' }} />,           label: '章节' },
  '#knowledge-point':     { icon: <FileTextOutlined style={{ color: '#2C2C2C' }} />,        label: '知识点' },
  '#code-implementation': { icon: <CodeOutlined style={{ color: '#1A7F1A' }} />,            label: '代码实现' },
  '#experiment':          { icon: <ExperimentOutlined style={{ color: '#D4A72C' }} />,      label: '实验' },
  '#error-point':         { icon: <BugOutlined style={{ color: '#CF222E' }} />,             label: '易错点' },
  '#algorithm-case':      { icon: <BulbOutlined style={{ color: '#D4A72C' }} />,            label: '算法案例' },
  '#material':            { icon: <BookOutlined style={{ color: '#B8591A' }} />,            label: '资料' },
  '#exercise-bank':       { icon: <FormOutlined style={{ color: '#3B82F6' }} />,            label: '习题库' },
}

const buildTreeData = (nodes: any[], edges: any[]): DataNode[] => {
  const nodeMap = new Map<string, any>()
  nodes.forEach((n) => nodeMap.set(n.id, n))

  const childrenMap = new Map<string, string[]>()
  edges
    .filter((e) => e.data.relation === 'CONTAINS')
    .forEach((e) => {
      const list = childrenMap.get(e.source) || []
      list.push(e.target)
      childrenMap.set(e.source, list)
    })

  const buildNodes = (parentId: string): DataNode[] => {
    const childIds = childrenMap.get(parentId)
    if (!childIds) return []
    return childIds.map((cid) => {
      const node = nodeMap.get(cid)
      if (!node) return null
      const primaryTag = node.data.tags[0] || ''
      const cfg = tagIconMap[primaryTag]
      return {
        key: cid,
        data: node,
        icon: cfg?.icon || <FileTextOutlined style={{ color: '#999' }} />,
        children: buildNodes(cid),
      } as any
    }).filter(Boolean) as DataNode[]
  }

  const subjectNode = nodes.find((n) => n.data.tags.includes('#subject'))
  if (!subjectNode) return []
  return [{
    key: 'root',
    title: subjectNode.data.title,
    icon: <FolderOpenOutlined style={{ color: '#956BF5' }} />,
    data: subjectNode,
    isRoot: true,
    children: buildNodes(subjectNode.id),
  } as any]
}

const filterTree = (nodes: DataNode[], text: string): DataNode[] => {
  if (!text) return nodes
  return nodes.map((node) => {
    const children = node.children ? filterTree(node.children, text) : []
    const title = (node as any).data?.data?.title || node.title
    const titleStr = typeof title === 'string' ? title : ''
    const titleMatch = titleStr.toLowerCase().includes(text.toLowerCase())
    if (titleMatch || children.length > 0) {
      return { ...node, children: children.length > 0 ? children : node.children }
    }
    return null
  }).filter(Boolean) as DataNode[]
}

const TreeNodeList: React.FC<{ readOnly?: boolean }> = ({ readOnly = false }) => {
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId)
  const setSelectedNodeId = useGraphStore((s) => s.setSelectedNodeId)
  const graphNodes = useGraphStore((s) => s.graphNodes)
  const graphEdges = useGraphStore((s) => s.graphEdges)
  const openTab = useWorkspaceStore((s) => s.openTab)
  const navigate = useNavigate()
  const { courseId = 'course-1' } = useParams()
  const [searchText, setSearchText] = useState('')
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['root'])
  const [deleteModal, setDeleteModal] = useState<{ nodeKey: string; title: string } | null>(null)
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)

  const parentMap = useMemo(() => {
    const map = new Map<string, string>()
    graphEdges.filter((e) => e.data.relation === 'CONTAINS').forEach((e) => map.set(e.target, e.source))
    return map
  }, [graphEdges])

  const isFolder = useCallback((key: string) => {
    return graphEdges.some((e) => e.data.relation === 'CONTAINS' && e.source === key)
  }, [graphEdges])

  useEffect(() => {
    if (!selectedNodeId) return
    const ancestors: string[] = []
    let current = selectedNodeId
    while (parentMap.has(current)) {
      const parent = parentMap.get(current)!
      ancestors.unshift(parent)
      current = parent
    }
    setExpandedKeys((prev) => {
      const set = new Set([...prev, ...ancestors, 'root'])
      return Array.from(set)
    })
  }, [selectedNodeId, parentMap])

  const getContextMenu = useCallback((dataNode: any): any => {
    const nodeKey = dataNode.key as string
    const nodeTitle = dataNode.data?.data?.title || dataNode.title || nodeKey
    if (readOnly) return { items: [] }
    const folder = isFolder(nodeKey)
    if (folder) {
      return {
        items: [
          { key: `create-folder-${nodeKey}`, label: '新建子文件夹', icon: <FolderAddOutlined /> },
          { key: `create-note-${nodeKey}`, label: '新建节点', icon: <FileTextOutlined /> },
          { key: `create-exercise-${nodeKey}`, label: '新建习题', icon: <FormOutlined /> },
          { type: 'divider' as const },
          { key: `rename-${nodeKey}`, label: '重命名', icon: <EditOutlined /> },
          { key: `import-${nodeKey}`, label: '导入', icon: <ImportOutlined /> },
          { type: 'divider' as const },
          { key: `delete-${nodeKey}`, label: '删除', icon: <DeleteOutlined />, danger: true },
        ],
        onClick: ({ key }: { key: string }) => {
          if (key.startsWith('create-')) message.info('新建功能开发中')
          if (key.startsWith('rename-')) message.info('重命名功能开发中')
          if (key.startsWith('import-')) {
            const input = document.createElement('input'); input.type = 'file'; input.multiple = true
            input.accept = '.ppt,.pptx,.pdf,.doc,.docx,.md,.py,.java,.cpp,.txt'
            input.onchange = () => { if (input.files?.length) message.success(`已选择 ${input.files.length} 个文件`) }
            input.click()
          }
          if (key.startsWith('delete-')) setDeleteModal({ nodeKey, title: nodeTitle })
        },
      }
    }
    return {
      items: [
        { key: `rename-${nodeKey}`, label: '重命名', icon: <EditOutlined /> },
        { key: `link-exercise-${nodeKey}`, label: '关联习题', icon: <LinkOutlined /> },
        { type: 'divider' as const },
        { key: `delete-${nodeKey}`, label: '删除', icon: <DeleteOutlined />, danger: true },
      ],
      onClick: ({ key }: { key: string }) => {
        if (key.startsWith('rename-')) message.info('重命名功能开发中')
        if (key.startsWith('link-exercise-')) message.info('关联习题功能开发中')
        if (key.startsWith('delete-')) setDeleteModal({ nodeKey, title: nodeTitle })
      },
    }
  }, [readOnly, isFolder])

  const renderTreeTitle = useCallback((node: any) => {
    const nodeKey = node.key as string
    const nodeTitle = node.data?.data?.title || node.title || nodeKey
    const isHovered = hoveredKey === nodeKey
    const isRoot = node.isRoot
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}
        onMouseEnter={() => setHoveredKey(nodeKey)}
        onMouseLeave={() => setHoveredKey(null)}
        onDoubleClick={(e) => {
          e.stopPropagation()
          if (!isFolder(nodeKey) && nodeKey !== 'root') {
            const tags = node.data?.data?.tags || []
            if (tags.includes('#exercise-bank')) {
              navigate(`/teacher/courses/${courseId}/exercises/${nodeKey}`)
            } else {
              openTab({ key: nodeKey, label: nodeTitle, type: 'editor', nodeId: nodeKey })
            }
          }
        }}>
        <span style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', fontSize: 14 }}>{node.icon}</span>
        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nodeTitle}</span>
        {(isHovered || isRoot) && !readOnly && (
          <Dropdown menu={getContextMenu(node)} trigger={['click']}>
            <span onClick={(e) => e.stopPropagation()} style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 20, height: 20, borderRadius: 4, flexShrink: 0, cursor: 'pointer',
            }} onMouseEnter={(e) => { e.currentTarget.style.background = '#E8E8E8' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
              <MoreOutlined style={{ fontSize: 12, color: '#666' }} />
            </span>
          </Dropdown>
        )}
      </div>
    )
  }, [hoveredKey, getContextMenu, readOnly, isFolder, openTab])

  const renderNodes = useCallback((nodes: DataNode[]): DataNode[] =>
    nodes.map((node) => {
      const { icon: _icon, ...rest } = node as any
      return {
        ...rest,
        title: renderTreeTitle(node),
        children: node.children ? renderNodes(node.children) : undefined,
      } as DataNode
    }), [renderTreeTitle])

  const rawTree = useMemo(() => buildTreeData(graphNodes, graphEdges), [graphNodes, graphEdges])
  const searchFiltered = useMemo(() => filterTree(rawTree, searchText), [rawTree, searchText])
  const treeData = useMemo(() => renderNodes(searchFiltered), [searchFiltered, renderNodes])

  const stats = useMemo(() => {
    const counts: Record<string, number> = {}
    graphNodes.forEach((n) => {
      const tag = n.data.tags[0] || '#unknown'
      counts[tag] = (counts[tag] || 0) + 1
    })
    return counts
  }, [graphNodes])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '8px 12px', borderBottom: '0.5px solid var(--color-border)' }}>
        <Input prefix={<SearchOutlined style={{ color: '#999' }} />} placeholder="搜索..." size="small"
          value={searchText} onChange={(e) => setSearchText(e.target.value)} style={{ borderRadius: 6 }} allowClear />
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
        {treeData.length > 0 ? (
          <Tree treeData={treeData}
            selectedKeys={selectedNodeId ? [selectedNodeId] : []}
            onSelect={(keys) => { if (keys.length > 0 && keys[0] !== 'root') setSelectedNodeId(keys[0] as string) }}
            expandedKeys={expandedKeys}
            onExpand={(keys) => setExpandedKeys(keys as string[])}
            showLine={{ showLeafIcon: false }}
            blockNode
            draggable
            allowDrop={({ dropNode }) => { const k = dropNode.key as string; return k === 'root' || isFolder(k) }}
            onDrop={({ node: _node, dragNode }) => message.success(`已移动 ${(dragNode as any).data?.data?.title || dragNode.title}`)}
            style={{ background: 'transparent', fontSize: 13, padding: '0 8px' }} />
        ) : (
          <div style={{ color: '#999', fontSize: 13, textAlign: 'center', padding: '32px 12px' }}>{searchText ? '无匹配' : '暂无数据'}</div>
        )}
      </div>
      <div style={{ padding: '8px 12px', borderTop: '0.5px solid var(--color-border)', fontSize: 11, color: '#999', display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }}>
        {Object.entries(tagIconMap).filter(([tag]) => stats[tag]).map(([tag, cfg]) => (
          <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>{cfg.icon}<span>{stats[tag]}</span></span>
        ))}
      </div>
      <Modal title="确认删除" open={!!deleteModal}
        onCancel={() => setDeleteModal(null)}
        onOk={() => { message.success('已删除'); setDeleteModal(null) }}
        okText="确认删除" okButtonProps={{ danger: true }} cancelText="取消">
        <p>确定要删除「<strong>{deleteModal?.title}</strong>」吗？</p>
      </Modal>
    </div>
  )
}

export default TreeNodeList
