// 知识图谱文件资源管理器 — 按章节层级树状展示 Note 节点
// 点击节点跳转到图谱中对应位置，双向联动
// 悬浮节点尾部出现 ··· 操作菜单

import { useState, useMemo, useCallback } from 'react'
import { Input, Tree, Dropdown, message, Modal } from 'antd'
import type { DataNode } from 'antd/es/tree'
import {
  SearchOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  FileTextOutlined,
  CodeOutlined,
  ExperimentOutlined,
  BugOutlined,
  BulbOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  ImportOutlined,
  FormOutlined,
  FolderAddOutlined,
  PaperClipOutlined,
  LinkOutlined,
  SwapOutlined,
} from '@ant-design/icons'
import { mockGraphNodes, mockGraphEdges } from '../../api/mock/graph'
import { useGraphStore } from '../../stores/graphStore'
import { useWorkspaceStore } from '../../stores/workspaceStore'

// 标签 → 图标映射
const tagIconMap: Record<string, { icon: React.ReactNode; label: string }> = {
  '#subject':             { icon: <FolderOpenOutlined style={{ color: '#956BF5' }} />,      label: '学科' },
  '#chapter':             { icon: <FolderOutlined style={{ color: '#7B52E0' }} />,           label: '章节' },
  '#knowledge-point':     { icon: <FileTextOutlined style={{ color: '#2C2C2C' }} />,        label: '知识点' },
  '#code-implementation': { icon: <CodeOutlined style={{ color: '#1A7F1A' }} />,            label: '代码实现' },
  '#experiment':          { icon: <ExperimentOutlined style={{ color: '#D4A72C' }} />,      label: '实验' },
  '#error-point':         { icon: <BugOutlined style={{ color: '#CF222E' }} />,             label: '易错点' },
  '#algorithm-case':      { icon: <BulbOutlined style={{ color: '#D4A72C' }} />,            label: '算法案例' },
}

// 构建章节树（含根目录）
const buildTreeData = (): DataNode[] => {
  const nodeMap = new Map<string, any>()
  mockGraphNodes.forEach((n) => nodeMap.set(n.id, n))

  const childrenMap = new Map<string, string[]>()
  mockGraphEdges
    .filter((e) => e.data.relation === 'CONTAINS')
    .forEach((e) => {
      const list = childrenMap.get(e.source) || []
      list.push(e.target)
      childrenMap.set(e.source, list)
    })

  const buildNodes = (parentId: string): DataNode[] => {
    const childIds = childrenMap.get(parentId)
    if (!childIds) return []
    return childIds
      .map((cid) => {
        const node = nodeMap.get(cid)
        if (!node) return null
        return {
          key: cid,
          data: node,
          children: buildNodes(cid),
        } as any
      })
      .filter(Boolean) as DataNode[]
  }

  const subjectNode = mockGraphNodes.find((n) => n.data.tags.includes('#subject'))
  if (!subjectNode) return []

  // 根目录：学科名称，children 为章节树
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
  return nodes
    .map((node) => {
      const children = node.children ? filterTree(node.children, text) : []
      const titleStr = typeof (node as any).data?.data?.title === 'string'
        ? (node as any).data.data.title
        : typeof node.title === 'string' ? node.title : ''
      const titleMatch = titleStr.toLowerCase().includes(text.toLowerCase())
      if (titleMatch || children.length > 0) {
        return { ...node, children: children.length > 0 ? children : node.children }
      }
      return null
    })
    .filter(Boolean) as DataNode[]
}

const TreeNodeList: React.FC = () => {
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId)
  const setSelectedNodeId = useGraphStore((s) => s.setSelectedNodeId)
  const openTab = useWorkspaceStore((s) => s.openTab)
  const [searchText, setSearchText] = useState('')
  const [deleteModal, setDeleteModal] = useState<{ nodeKey: string; title: string } | null>(null)

  // 悬停操作菜单节点 key
  const [hoveredKey, setHoveredKey] = useState<string | null>(null)

  const nodeMap = useMemo(() => {
    const map = new Map<string, any>()
    mockGraphNodes.forEach((n) => map.set(n.id, n))
    return map
  }, [])

  const isFolder = useCallback((key: string) => {
    return mockGraphEdges.some((e) => e.data.relation === 'CONTAINS' && e.source === key)
  }, [])

  // 获取节点显示标题
  const getTitle = useCallback((key: string) => {
    return nodeMap.get(key)?.data?.title || key
  }, [nodeMap])

  // 操作菜单 — 文件夹和文件菜单不同
  const getContextMenu = useCallback((nodeKey: string, nodeTitle: string): any => {
    const folder = isFolder(nodeKey)

    if (folder) {
      return {
        items: [
          { key: `create-folder-${nodeKey}`, label: '新建子文件夹', icon: <FolderAddOutlined /> },
          { key: `create-note-${nodeKey}`,     label: '新建节点',     icon: <FileTextOutlined /> },
          { key: `create-exercise-${nodeKey}`,  label: '新建习题',     icon: <FormOutlined /> },
          { type: 'divider' as const },
          { key: `rename-${nodeKey}`, label: '重命名', icon: <EditOutlined /> },
          { key: `import-${nodeKey}`, label: '导入',   icon: <ImportOutlined /> },
          { type: 'divider' as const },
          { key: `delete-${nodeKey}`, label: '删除', icon: <DeleteOutlined />, danger: true },
        ],
        onClick: ({ key }: { key: string }) => {
          if (key.startsWith('create-folder-')) message.info('新建子文件夹功能开发中')
          if (key.startsWith('create-note-'))    message.info('新建节点功能开发中')
          if (key.startsWith('create-exercise-')) message.info('新建习题功能开发中')
          if (key.startsWith('rename-'))  message.info('重命名功能开发中')
          if (key.startsWith('import-')) {
            const input = document.createElement('input')
            input.type = 'file'; input.multiple = true
            input.accept = '.ppt,.pptx,.pdf,.doc,.docx,.md,.py,.java,.cpp,.txt'
            input.onchange = () => {
              if (input.files?.length) {
                message.success(`已选择：${Array.from(input.files).map(f => f.name).join(', ')}`)
              }
            }
            input.click()
          }
          if (key.startsWith('delete-')) setDeleteModal({ nodeKey, title: nodeTitle })
        },
      }
    }

    // 文件节点菜单
    return {
      items: [
        { key: `rename-${nodeKey}`,     label: '重命名',   icon: <EditOutlined /> },
        { key: `attach-${nodeKey}`,     label: '挂载附件',  icon: <PaperClipOutlined /> },
        { key: `link-exercise-${nodeKey}`, label: '关联习题', icon: <LinkOutlined /> },
        { type: 'divider' as const },
        { key: `delete-${nodeKey}`,     label: '删除',     icon: <DeleteOutlined />, danger: true },
      ],
      onClick: ({ key }: { key: string }) => {
        if (key.startsWith('rename-'))        message.info('重命名功能开发中')
        if (key.startsWith('attach-')) {
          const input = document.createElement('input')
          input.type = 'file'; input.multiple = true
          input.accept = '.ppt,.pptx,.pdf,.doc,.docx,.md,.py,.java,.cpp,.txt'
          input.onchange = () => {
            if (input.files?.length) {
              message.success(`已挂载到「${nodeTitle}」：${Array.from(input.files).map(f => f.name).join(', ')}`)
            }
          }
          input.click()
        }
        if (key.startsWith('link-exercise-')) message.info('关联习题功能开发中')
        if (key.startsWith('delete-'))        setDeleteModal({ nodeKey, title: nodeTitle })
      },
    }
  }, [isFolder])

  // 每个树节点的 title 渲染（标题 + 悬浮三点按钮）
  const renderTreeTitle = useCallback(
    (node: any) => {
      const nodeKey = node.key as string
      const nodeData = node.data || node
      const title = nodeData?.data?.title || node.title || nodeKey
      const isHovered = hoveredKey === nodeKey
      const isRoot = node.isRoot

      return (
        <div
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}
          onMouseEnter={() => setHoveredKey(nodeKey)}
          onMouseLeave={() => setHoveredKey(null)}
          onDoubleClick={(e) => {
            e.stopPropagation()
            if (!isFolder(nodeKey) && nodeKey !== 'root') {
              openTab({ key: nodeKey, label: title, type: 'editor', nodeId: nodeKey })
            }
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {title}
          </span>
          {(isHovered || isRoot) && (
            <Dropdown
              menu={getContextMenu(nodeKey, title)}
              trigger={['click']}
            >
              <span
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 20,
                  height: 20,
                  borderRadius: 4,
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#E8E8E8'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                }}
              >
                <MoreOutlined style={{ fontSize: 12, color: '#666' }} />
              </span>
            </Dropdown>
          )}
        </div>
      )
    },
    [hoveredKey, getContextMenu]
  )

  // 把树节点 title 替换为自定义渲染
  const renderNodes = useCallback(
    (nodes: DataNode[]): DataNode[] =>
      nodes.map((node) => ({
        ...node,
        title: renderTreeTitle(node),
        children: node.children ? renderNodes(node.children) : undefined,
      })),
    [renderTreeTitle]
  )

  const rawTree = useMemo(buildTreeData, [])
  const searchFiltered = useMemo(() => filterTree(rawTree, searchText), [rawTree, searchText])
  const treeData = useMemo(() => renderNodes(searchFiltered), [searchFiltered, renderNodes])

  const stats = useMemo(() => {
    const counts: Record<string, number> = {}
    mockGraphNodes.forEach((n) => {
      const tag = n.data.tags[0] || '#unknown'
      counts[tag] = (counts[tag] || 0) + 1
    })
    return counts
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 搜索栏 */}
      <div style={{ padding: '8px 12px', borderBottom: '0.5px solid var(--color-border)' }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#999' }} />}
          placeholder="搜索节点..."
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ borderRadius: 6 }}
          allowClear
        />
      </div>

      {/* 目录树 */}
      <div style={{ flex: 1, overflow: 'auto', padding: '4px 0' }}>
        {treeData.length > 0 ? (
          <Tree
            treeData={treeData}
            selectedKeys={selectedNodeId ? [selectedNodeId] : []}
            onSelect={(keys) => {
              if (keys.length > 0 && keys[0] !== 'root') {
                setSelectedNodeId(keys[0] as string)
              }
            }}
            defaultExpandedKeys={['root']}
            showLine={{ showLeafIcon: false }}
            draggable
            allowDrop={({ dropNode }) => {
              // 只允许拖入文件夹节点，不允许拖到叶子文件上
              const key = dropNode.key as string
              return key === 'root' || isFolder(key)
            }}
            onDrop={({ node, dragNode, dropPosition }) => {
              message.success(`已将「${(dragNode as any).data?.data?.title || dragNode.title}」移动到「${(node as any).data?.data?.title || node.title}」`)
            }}
            style={{ background: 'transparent', fontSize: 13, padding: '0 8px' }}
          />
        ) : (
          <div style={{ color: '#999', fontSize: 13, textAlign: 'center', padding: '32px 12px' }}>
            {searchText ? '无匹配节点' : '暂无节点数据'}
          </div>
        )}
      </div>

      {/* 底部统计 */}
      <div style={{
        padding: '8px 12px', borderTop: '0.5px solid var(--color-border)',
        fontSize: 11, color: '#999', display: 'flex', flexWrap: 'wrap', gap: '4px 12px',
      }}>
        {Object.entries(tagIconMap)
          .filter(([tag]) => stats[tag])
          .map(([tag, cfg]) => (
            <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {cfg.icon}
              <span>{stats[tag]}</span>
            </span>
          ))}
      </div>

      {/* 删除确认弹窗 */}
      <Modal
        title="确认删除"
        open={!!deleteModal}
        onCancel={() => setDeleteModal(null)}
        onOk={() => {
          message.success(`「${deleteModal?.title}」及其所有内容已删除`)
          setDeleteModal(null)
        }}
        okText="确认删除"
        okButtonProps={{ danger: true }}
        cancelText="取消"
      >
        <p>
          确定要删除文件夹「<strong>{deleteModal?.title}</strong>」吗？
        </p>
        <p style={{ color: '#CF222E', fontSize: 13 }}>
          此操作将同时删除该文件夹中的所有子节点和内容，且不可恢复。
        </p>
      </Modal>
    </div>
  )
}

export default TreeNodeList
