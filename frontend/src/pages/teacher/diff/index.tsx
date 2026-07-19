// 图谱 PR 对比页 — Git 风格左右 Diff 视图

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Tag, Space, Collapse } from 'antd'
import {
  ArrowLeftOutlined, CheckOutlined, FileAddOutlined, FileTextOutlined,
  ApartmentOutlined, PlusCircleOutlined, MinusCircleOutlined, EditOutlined,
  WarningOutlined,
} from '@ant-design/icons'

// 模拟变更文件
interface DiffFile {
  name: string
  type: 'modified' | 'added' | 'deleted'
  additions: number
  deletions: number
  hasConflict: boolean
  hunks: { header: string; lines: { type: 'add' | 'del' | 'ctx'; content: string }[] }[]
  conflicts?: { title: string; ours: string[]; theirs: string[] }[]
}

const mockDiffFiles: DiffFile[] = [
  {
    name: '红黑树.md',
    type: 'added',
    additions: 28,
    deletions: 0,
    hasConflict: false,
    hunks: [
      {
        header: '@@ -0,0 +1,28 @@',
        lines: [
          { type: 'add', content: '# 红黑树' },
          { type: 'add', content: '' },
          { type: 'add', content: '## 定义' },
          { type: 'add', content: '红黑树是一种自平衡二叉搜索树，每个节点额外存储一个颜色位（红或黑）。' },
          { type: 'add', content: '' },
          { type: 'add', content: '## 性质' },
          { type: 'add', content: '1. 每个节点是红色或黑色' },
          { type: 'add', content: '2. 根节点是黑色' },
          { type: 'add', content: '3. 所有叶子节点（NIL）是黑色' },
          { type: 'add', content: '4. 红色节点的两个子节点必须是黑色' },
          { type: 'add', content: '5. 从任意节点到叶子节点的路径上黑色节点数量相同' },
          { type: 'add', content: '' },
          { type: 'add', content: '## 时间复杂度' },
          { type: 'add', content: '- 查找：O(log n)' },
          { type: 'add', content: '- 插入：O(log n)' },
          { type: 'add', content: '- 删除：O(log n)' },
          { type: 'add', content: '' },
          { type: 'add', content: '## 旋转操作' },
          { type: 'add', content: '红黑树通过左旋和右旋来维持平衡...' },
        ],
      },
    ],
  },
  {
    name: '快速排序.md',
    type: 'modified',
    additions: 5,
    deletions: 2,
    hasConflict: false,
    hunks: [
      {
        header: '@@ -3,7 +3,10 @@',

        lines: [
          { type: 'ctx', content: '## 核心思想' },
          { type: 'ctx', content: '分治法：选取基准值，将数组分为两部分...' },
          { type: 'ctx', content: '' },
          { type: 'del', content: '## 时间复杂度' },
          { type: 'del', content: '- 平均：O(n log n)' },
          { type: 'add', content: '## 时间复杂度与空间复杂度' },
          { type: 'add', content: '- 平均：O(n log n)' },
          { type: 'ctx', content: '- 最坏：O(n²)' },
          { type: 'add', content: '- 最好：Ω(n log n)' },
          { type: 'add', content: '- 空间复杂度：O(log n)（递归栈）' },
          { type: 'ctx', content: '' },
          { type: 'ctx', content: '## 代码实现' },
        ],
      },
    ],
  },
  {
    name: '栈与队列.md',
    type: 'modified',
    additions: 3,
    deletions: 1,
    hasConflict: true,
    conflicts: [
      {
        title: '「栈的应用场景」章节',
        ours: ['## 常见应用', '', '- 括号匹配', '- 浏览器前进后退'],
        theirs: ['## 应用场景', '', '- 函数调用栈', '- 表达式求值（中缀转后缀）', '- 括号匹配', '- 浏览器前进后退'],
      },
    ],
    hunks: [
      {
        header: '@@ -12,4 +12,6 @@',
        lines: [
          { type: 'ctx', content: '栈是一种后进先出（LIFO）的数据结构。' },
          { type: 'ctx', content: '' },
          { type: 'del', content: '## 常见应用' },
          { type: 'add', content: '## 应用场景' },
          { type: 'add', content: '- 函数调用栈' },
          { type: 'add', content: '- 表达式求值（中缀转后缀）' },
          { type: 'ctx', content: '- 括号匹配' },
          { type: 'ctx', content: '- 浏览器前进后退' },
        ],
      },
    ],
  },
]

// 图谱变更摘要
const graphChanges = {
  nodesAdded: 1,
  nodesModified: 2,
  nodesDeleted: 0,
  edgesAdded: 2,
  edgesModified: 0,
  edgesDeleted: 0,
  details: [
    { type: 'add', desc: '新增节点：「红黑树」#knowledge-point #algorithm-case' },
    { type: 'add', desc: '新增关系：CONTAINS 树与二叉树 → 红黑树' },
    { type: 'add', desc: '新增关系：PREREQUISITE 红黑树 → 二叉搜索树' },
    { type: 'modify', desc: '修改节点：「快速排序」— 补充空间复杂度分析' },
    { type: 'modify', desc: '修改节点：「栈与队列」— 补充应用场景章节' },
  ],
}

const lineStyle = (type: string): React.CSSProperties => ({
  fontFamily: 'var(--font-mono)',
  fontSize: 12,
  lineHeight: '20px',
  padding: '1px 8px',
  whiteSpace: 'pre',
  background:
    type === 'add' ? '#E6FFEC'
    : type === 'del' ? '#FFEBE9'
    : 'transparent',
  color:
    type === 'add' ? '#1A7F1A'
    : type === 'del' ? '#CF222E'
    : '#2C2C2C',
})

const DiffComparePage = () => {
  const { courseId, prId } = useParams()
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState<string | null>(mockDiffFiles[0]?.name ?? null)
  // 冲突解决状态：key = fileName:conflictIndex
  const [resolvedConflicts, setResolvedConflicts] = useState<Record<string, 'ours' | 'theirs'>>({})
  const currentFile = mockDiffFiles.find((f) => f.name === selectedFile) || mockDiffFiles[0]

  const allConflicts = mockDiffFiles.filter((f) => f.hasConflict)
  const unresolvedCount = allConflicts.reduce((sum, f) => {
    return sum + (f.conflicts?.filter((_, i) => !resolvedConflicts[`${f.name}:${i}`]).length || 0)
  }, 0)
  const allResolved = unresolvedCount === 0

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>
            PR #{prId} · 变更对比
          </h3>
          <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
            {graphChanges.nodesAdded + graphChanges.nodesModified + graphChanges.nodesDeleted} 个节点变更 ·{' '}
            {graphChanges.edgesAdded + graphChanges.edgesModified + graphChanges.edgesDeleted} 条关系变更 ·{' '}
            {mockDiffFiles.length} 个文件变更
          </div>
        </div>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
          <Button type="primary" icon={<CheckOutlined />} disabled={!allResolved}>
            {allResolved ? '通过此 PR' : `请先解决 ${unresolvedCount} 个冲突`}
          </Button>
        </Space>
      </div>

      <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 48px - 120px)' }}>
        {/* ── 左侧：变更文件列表 ── */}
        <div style={{
          width: 220, flexShrink: 0, background: '#fff',
          border: '0.5px solid var(--color-border)', borderRadius: 8,
          overflow: 'auto',
        }}>
          <div style={{
            padding: '10px 14px', fontSize: 13, fontWeight: 600,
            borderBottom: '0.5px solid var(--color-border)',
          }}>
            变更文件 ({mockDiffFiles.length})
          </div>
          {mockDiffFiles.map((f) => (
            <div key={f.name}
              onClick={() => setSelectedFile(f.name)}
              style={{
                padding: '8px 14px', cursor: 'pointer',
                fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
                background: selectedFile === f.name ? '#F4F0FF' : 'transparent',
                borderLeft: selectedFile === f.name ? '3px solid #956BF5' : '3px solid transparent',
              }}
            >
              {f.type === 'added' ? <FileAddOutlined style={{ color: '#1A7F1A' }} />
                : f.type === 'deleted' ? <FileTextOutlined style={{ color: '#CF222E' }} />
                : f.hasConflict ? <WarningOutlined style={{ color: '#CF222E' }} />
                : <FileTextOutlined style={{ color: '#D4A72C' }} />}
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {f.name}
              </span>
              <span style={{ fontSize: 11, display: 'flex', gap: 4, flexShrink: 0 }}>
                {f.additions > 0 && <span style={{ color: '#1A7F1A' }}>+{f.additions}</span>}
                {f.deletions > 0 && <span style={{ color: '#CF222E' }}>-{f.deletions}</span>}
              </span>
            </div>
          ))}
        </div>

        {/* ── 右侧：Diff 内容 ── */}
        <div style={{ flex: 1, overflow: 'auto', background: '#fff', border: '0.5px solid var(--color-border)', borderRadius: 8 }}>
          {currentFile ? (
            <>
              {/* 文件标题 */}
              <div style={{
                padding: '10px 16px', fontWeight: 600, fontSize: 13,
                borderBottom: '0.5px solid var(--color-border)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                {currentFile.type === 'added'
                  ? <FileAddOutlined style={{ color: '#1A7F1A' }} />
                  : <FileTextOutlined style={{ color: '#D4A72C' }} />}
                {currentFile.name}
                <Tag color={currentFile.type === 'added' ? 'green' : currentFile.type === 'deleted' ? 'red' : 'gold'}
                  style={{ fontSize: 11, marginLeft: 8 }}>
                  {currentFile.type === 'added' ? '新增' : currentFile.type === 'deleted' ? '删除' : '修改'}
                </Tag>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: '#1A7F1A' }}>+{currentFile.additions}</span>
                <span style={{ fontSize: 12, color: '#CF222E', marginLeft: 8 }}>-{currentFile.deletions}</span>
              </div>

              {/* Hunk 区域 */}
              {currentFile.hunks.map((hunk, hi) => (
                <div key={hi}>
                  {/* Hunk header */}
                  <div style={{
                    padding: '4px 16px', fontSize: 12, fontFamily: 'var(--font-mono)',
                    color: '#999', background: '#F0F0FF',
                  }}>
                    {hunk.header}
                  </div>
                  {/* 代码行 */}
                  {hunk.lines.map((line, li) => (
                    <div key={li} style={{ display: 'flex' }}>
                      <span style={{
                        width: 50, textAlign: 'right', padding: '1px 8px',
                        fontSize: 12, fontFamily: 'var(--font-mono)',
                        color: '#999', background: '#FAFAFA',
                        userSelect: 'none', flexShrink: 0,
                        lineHeight: '20px',
                      }}>
                        {line.type === 'add' ? '' : line.type === 'del' ? '' : ''}
                      </span>
                      <span style={{
                        width: 24, textAlign: 'center',
                        fontSize: 12, fontFamily: 'var(--font-mono)',
                        padding: '1px 0', flexShrink: 0,
                        lineHeight: '20px',
                        color: line.type === 'add' ? '#1A7F1A' : line.type === 'del' ? '#CF222E' : '#999',
                      }}>
                        {line.type === 'add' ? '+' : line.type === 'del' ? '-' : ' '}
                      </span>
                      <span style={lineStyle(line.type)}>{line.content}</span>
                    </div>
              ))}

              {/* ★ 冲突解决面板 */}
              {currentFile.hasConflict && currentFile.conflicts && (
                <div style={{ padding: 16, borderTop: '2px solid var(--color-danger)' }}>
                  <div style={{
                    padding: '8px 12px', background: '#FFF8E1',
                    borderRadius: 6, marginBottom: 16,
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: 13,
                  }}>
                    <WarningOutlined style={{ color: '#CF222E', fontSize: 16 }} />
                    <span>
                      此文件存在 <strong>{currentFile.conflicts.length}</strong> 个合并冲突，需要手动解决后才能通过此 PR。
                    </span>
                  </div>

                  {currentFile.conflicts.map((conflict, ci) => {
                    const key = `${currentFile.name}:${ci}`
                    const resolved = resolvedConflicts[key]
                    return (
                      <div key={ci} style={{
                        marginBottom: 16,
                        border: resolved ? '0.5px solid var(--color-success)' : '0.5px solid var(--color-danger)',
                        borderRadius: 8, overflow: 'hidden',
                      }}>
                        <div style={{
                          padding: '8px 14px', fontWeight: 600, fontSize: 13,
                          background: resolved ? '#E8F5E9' : '#FFEBE9',
                          display: 'flex', alignItems: 'center', gap: 8,
                        }}>
                          <span>冲突 {ci + 1}：{conflict.title}</span>
                          {resolved && (
                            <Tag color="success" style={{ marginLeft: 'auto' }}>
                              {resolved === 'ours' ? '已保留公共图谱版本' : '已采用 PR 提交版本'}
                            </Tag>
                          )}
                        </div>

                        <div style={{ display: 'flex' }}>
                          {/* 公共图谱版本 */}
                          <div style={{ flex: 1, borderRight: '0.5px solid var(--color-border)' }}>
                            <div style={{ padding: '4px 12px', fontSize: 12, color: '#999', background: '#FAFAFA' }}>
                              公共图谱（当前版本）
                            </div>
                            {conflict.ours.map((line, li) => (
                              <div key={li} style={{
                                padding: '2px 12px', fontSize: 12,
                                fontFamily: 'var(--font-mono)',
                                background: resolved === 'ours' ? '#E8F5E9' : 'transparent',
                              }}>
                                {line}
                              </div>
                            ))}
                          </div>
                          {/* PR 提交版本 */}
                          <div style={{ flex: 1 }}>
                            <div style={{ padding: '4px 12px', fontSize: 12, color: '#999', background: '#FAFAFA' }}>
                              PR #{prId} 提交版本
                            </div>
                            {conflict.theirs.map((line, li) => (
                              <div key={li} style={{
                                padding: '2px 12px', fontSize: 12,
                                fontFamily: 'var(--font-mono)',
                                background: resolved === 'theirs' ? '#E8F5E9' : 'transparent',
                              }}>
                                {line}
                              </div>
                            ))}
                          </div>
                        </div>

                        {!resolved && (
                          <div style={{
                            padding: '8px 14px', borderTop: '0.5px solid var(--color-border)',
                            display: 'flex', gap: 8,
                          }}>
                            <Button size="small"
                              onClick={() => setResolvedConflicts((prev) => ({ ...prev, [key]: 'ours' }))}
                            >保留公共图谱版本</Button>
                            <Button size="small" type="primary"
                              onClick={() => setResolvedConflicts((prev) => ({ ...prev, [key]: 'theirs' }))}
                            >采用 PR 提交版本</Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
                </div>
              ))}
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#999', padding: 48 }}>选择左侧文件查看 Diff</div>
          )}
        </div>
      </div>

      {/* ── 底部：图谱变更摘要 ── */}
      <div style={{ marginTop: 16 }}>
        <Collapse
          items={[{
            key: 'graph',
            label: (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ApartmentOutlined style={{ color: '#956BF5' }} />
                <span>图谱变更摘要</span>
                <Tag color="green" style={{ fontSize: 11 }}>+{graphChanges.nodesAdded + graphChanges.edgesAdded}</Tag>
                <Tag color="gold" style={{ fontSize: 11 }}>~{graphChanges.nodesModified + graphChanges.edgesModified}</Tag>
              </span>
            ),
            children: (
              <div style={{ padding: '8px 0' }}>
                <div style={{ display: 'flex', gap: 24, marginBottom: 12, fontSize: 13 }}>
                  <span><PlusCircleOutlined style={{ color: '#1A7F1A' }} /> 节点 +{graphChanges.nodesAdded}</span>
                  <span><EditOutlined style={{ color: '#D4A72C' }} /> 节点 ~{graphChanges.nodesModified}</span>
                  <span><PlusCircleOutlined style={{ color: '#1A7F1A' }} /> 关系 +{graphChanges.edgesAdded}</span>
                </div>
                {graphChanges.details.map((d, i) => (
                  <div key={i} style={{
                    padding: '6px 0', fontSize: 13,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <span style={{
                      color: d.type === 'add' ? '#1A7F1A' : '#D4A72C',
                      fontWeight: 600, fontFamily: 'var(--font-mono)',
                    }}>
                      {d.type === 'add' ? '+' : '~'}
                    </span>
                    <span>{d.desc}</span>
                  </div>
                ))}
              </div>
            ),
          }]}
        />
      </div>
    </div>
  )
}

export default DiffComparePage
