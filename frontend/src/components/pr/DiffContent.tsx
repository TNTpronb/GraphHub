// Diff 对比核心组件 — 文件列表 + Hunk 渲染 + 图谱摘要
// 被教师端和学生端复用

import { useState } from 'react'
import { Tag, Collapse } from 'antd'
import {
  FileAddOutlined, FileTextOutlined, ApartmentOutlined,
  PlusCircleOutlined, EditOutlined, WarningOutlined,
} from '@ant-design/icons'

interface DiffFile {
  name: string; type: 'modified' | 'added' | 'deleted'
  additions: number; deletions: number; hasConflict: boolean
  hunks: { header: string; lines: { type: 'add' | 'del' | 'ctx'; content: string }[] }[]
  conflicts?: { title: string; ours: string[]; theirs: string[] }[]
}

export interface GraphChange {
  type: 'add' | 'modify'
  desc: string
}

export const mockDiffFiles: DiffFile[] = [
  { name: '红黑树.md', type: 'added', additions: 28, deletions: 0, hasConflict: false, hunks: [{ header: '@@ -0,0 +1,18 @@', lines: [ '# 红黑树','','## 定义','红黑树是一种自平衡二叉搜索树...','','## 性质','1. 每个节点是红色或黑色','2. 根节点是黑色','3. 所有叶子节点（NIL）是黑色','4. 红色节点的两个子节点必须是黑色','5. 从任意节点到叶子节点的路径上黑色节点数量相同','','## 时间复杂度','- 查找：O(log n)','- 插入：O(log n)','- 删除：O(log n)','','## 旋转操作','红黑树通过左旋和右旋来维持平衡...' ].map(c => ({ type: 'add' as const, content: c })) }] },
  { name: '快速排序.md', type: 'modified', additions: 5, deletions: 2, hasConflict: false, hunks: [{ header: '@@ -3,7 +3,10 @@', lines: [{ type: 'ctx', content: '## 核心思想' },{ type: 'ctx', content: '分治法：选取基准值...' },{ type: 'ctx', content: '' },{ type: 'del', content: '## 时间复杂度' },{ type: 'del', content: '- 平均：O(n log n)' },{ type: 'add', content: '## 时间复杂度与空间复杂度' },{ type: 'add', content: '- 平均：O(n log n)' },{ type: 'ctx', content: '- 最坏：O(n²)' },{ type: 'add', content: '- 最好：Ω(n log n)' },{ type: 'add', content: '- 空间复杂度：O(log n)' },{ type: 'ctx', content: '' },{ type: 'ctx', content: '## 代码实现' }] }] },
  { name: '栈与队列.md', type: 'modified', additions: 3, deletions: 1, hasConflict: true, conflicts: [{ title: '「栈的应用场景」章节', ours: ['## 常见应用','','- 括号匹配','- 浏览器前进后退'], theirs: ['## 应用场景','','- 函数调用栈','- 表达式求值（中缀转后缀）','- 括号匹配','- 浏览器前进后退'] }], hunks: [{ header: '@@ -12,4 +12,6 @@', lines: [{ type: 'ctx', content: '栈是一种后进先出（LIFO）的数据结构。' },{ type: 'ctx', content: '' },{ type: 'del', content: '## 常见应用' },{ type: 'add', content: '## 应用场景' },{ type: 'add', content: '- 函数调用栈' },{ type: 'add', content: '- 表达式求值' },{ type: 'ctx', content: '- 括号匹配' },{ type: 'ctx', content: '- 浏览器前进后退' }] }] },
]

export const graphChanges = {
  nodesAdded: 1, nodesModified: 2, edgesAdded: 2, edgesModified: 0,
  details: [
    { type: 'add' as const, desc: '新增节点：「红黑树」' },
    { type: 'add' as const, desc: 'MD 链接：[[红黑树]] ← [[树与二叉树]]' },
    { type: 'add' as const, desc: 'MD 链接：[[红黑树]] ← [[二叉搜索树]]' },
    { type: 'modify' as const, desc: '修改节点：「快速排序」— 补充空间复杂度' },
    { type: 'modify' as const, desc: '修改节点：「栈与队列」— 补充应用场景' },
  ],
}

const lineStyle = (type: string): React.CSSProperties => ({
  fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: '20px', padding: '1px 8px', whiteSpace: 'pre',
  background: type === 'add' ? '#E6FFEC' : type === 'del' ? '#FFEBE9' : 'transparent',
  color: type === 'add' ? '#1A7F1A' : type === 'del' ? '#CF222E' : '#2C2C2C',
})

interface DiffContentProps {
  files?: DiffFile[]
  header?: React.ReactNode
  footer?: React.ReactNode
  conflictFooter?: (file: DiffFile) => React.ReactNode
}

const DiffContent: React.FC<DiffContentProps> = ({ files = mockDiffFiles, header, footer, conflictFooter }) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(files[0]?.name ?? null)
  const currentFile = files.find((f) => f.name === selectedFile) || files[0]

  return (
    <div>
      {header}

      <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 48px - 120px)' }}>
        {/* 文件列表 */}
        <div style={{ width: 220, flexShrink: 0, background: '#fff', border: '0.5px solid var(--color-border)', borderRadius: 8, overflow: 'auto' }}>
          <div style={{ padding: '10px 14px', fontSize: 13, fontWeight: 600, borderBottom: '0.5px solid var(--color-border)' }}>变更文件 ({files.length})</div>
          {files.map((f) => (
            <div key={f.name} onClick={() => setSelectedFile(f.name)} style={{
              padding: '8px 14px', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
              background: selectedFile === f.name ? '#F4F0FF' : 'transparent',
              borderLeft: selectedFile === f.name ? '3px solid #956BF5' : '3px solid transparent',
            }}>
              {f.type === 'added' ? <FileAddOutlined style={{ color: '#1A7F1A' }} />
                : f.type === 'deleted' ? <FileTextOutlined style={{ color: '#CF222E' }} />
                : f.hasConflict ? <WarningOutlined style={{ color: '#CF222E' }} />
                : <FileTextOutlined style={{ color: '#D4A72C' }} />}
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
              <span style={{ fontSize: 11, display: 'flex', gap: 4, flexShrink: 0 }}>
                {f.additions > 0 && <span style={{ color: '#1A7F1A' }}>+{f.additions}</span>}
                {f.deletions > 0 && <span style={{ color: '#CF222E' }}>-{f.deletions}</span>}
              </span>
            </div>
          ))}
        </div>

        {/* Diff 内容 */}
        <div style={{ flex: 1, overflow: 'auto', background: '#fff', border: '0.5px solid var(--color-border)', borderRadius: 8 }}>
          {currentFile ? (
            <>
              <div style={{ padding: '10px 16px', fontWeight: 600, fontSize: 13, borderBottom: '0.5px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                {currentFile.type === 'added' ? <FileAddOutlined style={{ color: '#1A7F1A' }} /> : <FileTextOutlined style={{ color: '#D4A72C' }} />}
                {currentFile.name}
                <Tag color={currentFile.type === 'added' ? 'green' : currentFile.type === 'deleted' ? 'red' : 'gold'} style={{ fontSize: 11, marginLeft: 8 }}>{currentFile.type === 'added' ? '新增' : currentFile.type === 'deleted' ? '删除' : '修改'}</Tag>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: '#1A7F1A' }}>+{currentFile.additions}</span>
                <span style={{ fontSize: 12, color: '#CF222E', marginLeft: 8 }}>-{currentFile.deletions}</span>
              </div>
              {currentFile.hunks.map((hunk, hi) => (
                <div key={hi}>
                  <div style={{ padding: '4px 16px', fontSize: 12, fontFamily: 'var(--font-mono)', color: '#999', background: '#F0F0FF' }}>{hunk.header}</div>
                  {hunk.lines.map((line, li) => (
                    <div key={li} style={{ display: 'flex' }}>
                      <span style={{ width: 24, textAlign: 'center', fontSize: 12, fontFamily: 'var(--font-mono)', padding: '1px 0', flexShrink: 0, lineHeight: '20px', color: line.type === 'add' ? '#1A7F1A' : line.type === 'del' ? '#CF222E' : '#999' }}>{line.type === 'add' ? '+' : line.type === 'del' ? '-' : ' '}</span>
                      <span style={lineStyle(line.type)}>{line.content}</span>
                    </div>
                  ))}
                </div>
              ))}
              {conflictFooter?.(currentFile)}
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#999', padding: 48 }}>选择左侧文件查看 Diff</div>
          )}
        </div>
      </div>

      {/* 图谱变更摘要 */}
      <div style={{ marginTop: 16 }}>
        <Collapse items={[{
          key: 'graph', label: <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><ApartmentOutlined style={{ color: '#956BF5' }} /><span>图谱变更摘要</span><Tag color="green" style={{ fontSize: 11 }}>+{graphChanges.nodesAdded + graphChanges.edgesAdded}</Tag><Tag color="gold" style={{ fontSize: 11 }}>~{graphChanges.nodesModified + graphChanges.edgesModified}</Tag></span>,
          children: (
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', gap: 24, marginBottom: 12, fontSize: 13 }}>
                <span><PlusCircleOutlined style={{ color: '#1A7F1A' }} /> 节点 +{graphChanges.nodesAdded}</span>
                <span><EditOutlined style={{ color: '#D4A72C' }} /> 节点 ~{graphChanges.nodesModified}</span>
                <span><PlusCircleOutlined style={{ color: '#1A7F1A' }} /> 链接 +{graphChanges.edgesAdded}</span>
              </div>
              {graphChanges.details.map((d, i) => (
                <div key={i} style={{ padding: '6px 0', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: d.type === 'add' ? '#1A7F1A' : '#D4A72C', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{d.type === 'add' ? '+' : '~'}</span>
                  <span>{d.desc}</span>
                </div>
              ))}
            </div>
          ),
        }]} />
      </div>

      {footer}
    </div>
  )
}

export default DiffContent
