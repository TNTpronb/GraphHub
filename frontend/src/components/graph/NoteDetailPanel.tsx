// src/components/graph/NoteDetailPanel.tsx
// 点击图谱节点后，右侧展示节点详情

import { Tag, Divider } from 'antd'
import { mockGraphNodes, mockGraphEdges, relationColors } from '../../api/mock/graph'

interface NoteDetailPanelProps {
  nodeId: string | null
}

// 关系类型中文名映射
const relationNameMap: Record<string, string> = {
  CONTAINS:     '包含',
  PREREQUISITE: '前置依赖',
  CODE_IMPL:    '代码实现',
  CONFUSE_WITH: '易混淆',
  OPTIMIZE_FROM:'优化演进',
  HAS_ERROR:    '常见错误',
}

const NoteDetailPanel: React.FC<NoteDetailPanelProps> = ({ nodeId }) => {
  // 未选中任何节点
  if (!nodeId) {
    return (
      <div style={{
        padding: 24,
        color: 'var(--color-text-tertiary)',
        fontSize: 'var(--text-sm)',
        textAlign: 'center',
      }}>
        点击图谱中的节点查看详情
      </div>
    )
  }

  // 查找节点数据
  const node = mockGraphNodes.find((n) => n.id === nodeId)
  if (!node) {
    return <div style={{ padding: 24 }}>节点未找到</div>
  }

  // 查找与该节点相关的所有边
  const relatedEdges = mockGraphEdges.filter(
    (e) => e.source === nodeId || e.target === nodeId
  )

  return (
    <div style={{ padding: 'var(--space-4)' }}>
      {/* ── 节点标题 ── */}
      <h3 style={{
        fontSize: 'var(--text-lg)',
        fontWeight: 600,
        marginBottom: 'var(--space-3)',
      }}>
        {node.data.title}
      </h3>

      {/* ── 标签 ── */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        {node.data.tags.map((tag: string) => (
          <Tag
            key={tag}
            style={{
              marginBottom: 4,
              fontSize: 11,
              color: 'var(--color-primary)',
              background: 'var(--color-primary-light)',
              border: 'none',
            }}
          >
            {tag}
          </Tag>
        ))}
      </div>

      {/* ── 关联关系 ── */}
      {relatedEdges.length > 0 && (
        <>
          <Divider style={{ margin: '12px 0', borderColor: 'var(--color-border)' }} />
          <div style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-secondary)',
            marginBottom: 8,
          }}>
            关联关系
          </div>
          {relatedEdges.map((edge, index) => {
            // 判断当前节点是 source 还是 target
            const isSource = edge.source === nodeId
            const otherNodeId = isSource ? edge.target : edge.source
            const otherNode = mockGraphNodes.find((n) => n.id === otherNodeId)
            const relation = edge.data.relation

            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 0',
                  fontSize: 'var(--text-sm)',
                }}
              >
                {/* 关系类型标识色块 */}
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: relationColors[relation] || '#CECECE',
                  flexShrink: 0,
                }} />
                <span style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }}>
                  {relationNameMap[relation] || relation}
                </span>
                {/* 箭头方向 */}
                <span style={{ color: 'var(--color-text-tertiary)' }}>
                  {isSource ? '→' : '←'}
                </span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                  {otherNode?.data.title || otherNodeId}
                </span>
              </div>
            )
          })}
        </>
      )}

      {/* ── 节点内容（Markdown 占位，后续替换为 MarkdownRenderer） ── */}
      <Divider style={{ margin: '12px 0', borderColor: 'var(--color-border)' }} />
      <div style={{
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-secondary)',
        marginBottom: 8,
      }}>
        节点内容
      </div>
      <div style={{
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text)',
        lineHeight: 1.6,
        background: '#FAFAFA',
        padding: 12,
        borderRadius: 'var(--radius-md)',
        border: '0.5px solid var(--color-border)',
      }}>
        <em># 待从 Neo4j 加载 Markdown 内容</em>
        <br />
        <em>此处将渲染 Note.content 的 Markdown 正文</em>
      </div>
    </div>
  )
}

export default NoteDetailPanel