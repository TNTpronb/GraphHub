// 冲突解决面板（在私人图谱 Rebase 弹窗和 PR 新建页中复用）

import { Button, Tag } from 'antd'

interface Conflict {
  id: string
  noteTitle: string
  type: 'content' | 'tags' | 'relation' | 'delete-modify'
  mineVersion: string
  theirsVersion: string
  resolved: boolean
  resolution?: 'mine' | 'theirs' | 'manual'
}

interface ConflictPanelProps {
  conflicts: Conflict[]
  onResolve: (conflictId: string, resolution: 'mine' | 'theirs' | 'manual') => void
  onResolveAll: (resolution: 'mine' | 'theirs') => void
}

const conflictTypeLabels: Record<string, string> = {
  content: '内容冲突',
  tags: '标签冲突',
  relation: '关系冲突',
  'delete-modify': '删除-修改冲突',
}

const ConflictPanel: React.FC<ConflictPanelProps> = ({ conflicts, onResolve, onResolveAll }) => {
  const unresolvedCount = conflicts.filter((c) => !c.resolved).length

  if (conflicts.length === 0) return null

  return (
    <div style={{
      padding: 16, background: '#FFF8E1', borderRadius: 8,
      border: '0.5px solid var(--color-warning)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <span style={{ fontWeight: 600, color: 'var(--color-warning)' }}>⚠ 检测到 {conflicts.length} 个冲突</span>
          {unresolvedCount > 0 && (
            <span style={{ color: 'var(--color-danger)', marginLeft: 8, fontSize: 13 }}>
              {unresolvedCount} 个未解决
            </span>
          )}
        </div>
        {unresolvedCount > 0 && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="small" onClick={() => onResolveAll('mine')}>全部保留我的</Button>
            <Button size="small" onClick={() => onResolveAll('theirs')}>全部采用对方</Button>
          </div>
        )}
      </div>

      {conflicts.map((conflict) => (
        <div key={conflict.id} style={{
          padding: 12, background: '#fff', borderRadius: 6, marginBottom: 8,
          border: conflict.resolved ? '0.5px solid var(--color-success)' : '0.5px solid var(--color-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Tag color="warning">{conflictTypeLabels[conflict.type]}</Tag>
            <span style={{ fontWeight: 500 }}>{conflict.noteTitle}</span>
            {conflict.resolved && (
              <Tag color="success">
                {conflict.resolution === 'mine' ? '已保留我的' : conflict.resolution === 'theirs' ? '已采用对方' : '已手动合并'}
              </Tag>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1, padding: 8, background: '#E8F5E9', borderRadius: 4, fontSize: 12, fontFamily: 'var(--font-mono)' }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>我的版本</div>
              <div>{conflict.mineVersion}</div>
            </div>
            <div style={{ flex: 1, padding: 8, background: '#FFF3E0', borderRadius: 4, fontSize: 12, fontFamily: 'var(--font-mono)' }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>公有图谱当前版本</div>
              <div>{conflict.theirsVersion}</div>
            </div>
          </div>

          {!conflict.resolved && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Button size="small" onClick={() => onResolve(conflict.id, 'mine')}>保留我的</Button>
              <Button size="small" onClick={() => onResolve(conflict.id, 'theirs')}>采用对方的</Button>
              <Button size="small" onClick={() => onResolve(conflict.id, 'manual')}>手动合并</Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default ConflictPanel
