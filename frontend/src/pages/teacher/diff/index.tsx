// 教师端 Diff 对比页

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Tag, Space } from 'antd'
import { ArrowLeftOutlined, CheckOutlined, WarningOutlined } from '@ant-design/icons'
import DiffContent, { mockDiffFiles } from '../../../components/pr/DiffContent'

const TeacherDiffPage = () => {
  const { prId } = useParams()
  const navigate = useNavigate()
  const [resolvedConflicts, setResolvedConflicts] = useState<Record<string, 'ours' | 'theirs'>>({})

  const allConflicts = mockDiffFiles.filter((f) => f.hasConflict)
  const unresolvedCount = allConflicts.reduce((sum, f) => sum + (f.conflicts?.filter((_, i) => !resolvedConflicts[`${f.name}:${i}`]).length || 0), 0)
  const allResolved = unresolvedCount === 0

  return (
    <DiffContent
      header={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>PR #{prId} · 变更对比</h3>
          </div>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
            <Button type="primary" icon={<CheckOutlined />} disabled={!allResolved}>
              {allResolved ? '通过此 PR' : `请先解决 ${unresolvedCount} 个冲突`}
            </Button>
          </Space>
        </div>
      }
      footer={null}
      conflictFooter={(currentFile) => {
        if (!currentFile.hasConflict || !currentFile.conflicts) return null
        return (
          <div style={{ padding: 16, borderTop: '2px solid var(--color-danger)' }}>
            <div style={{ padding: '8px 12px', background: '#FFF8E1', borderRadius: 6, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <WarningOutlined style={{ color: '#CF222E', fontSize: 16 }} />
              <span>此文件存在 <strong>{currentFile.conflicts.length}</strong> 个合并冲突，需手动解决后才能通过。</span>
            </div>
            {currentFile.conflicts.map((conflict, ci) => {
              const key = `${currentFile.name}:${ci}`
              const resolved = resolvedConflicts[key]
              return (
                <div key={ci} style={{ marginBottom: 16, border: resolved ? '0.5px solid var(--color-success)' : '0.5px solid var(--color-danger)', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ padding: '8px 14px', fontWeight: 600, fontSize: 13, background: resolved ? '#E8F5E9' : '#FFEBE9', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>冲突 {ci + 1}：{conflict.title}</span>
                    {resolved && <Tag color="success" style={{ marginLeft: 'auto' }}>{resolved === 'ours' ? '已保留公共图谱' : '已采用提交版本'}</Tag>}
                  </div>
                  <div style={{ display: 'flex' }}>
                    <div style={{ flex: 1, borderRight: '0.5px solid var(--color-border)' }}>
                      <div style={{ padding: '4px 12px', fontSize: 12, color: '#999', background: '#FAFAFA' }}>公共图谱</div>
                      {conflict.ours.map((line, li) => <div key={li} style={{ padding: '2px 12px', fontSize: 12, fontFamily: 'var(--font-mono)', background: resolved === 'ours' ? '#E8F5E9' : 'transparent' }}>{line}</div>)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ padding: '4px 12px', fontSize: 12, color: '#999', background: '#FAFAFA' }}>提交版本</div>
                      {conflict.theirs.map((line, li) => <div key={li} style={{ padding: '2px 12px', fontSize: 12, fontFamily: 'var(--font-mono)', background: resolved === 'theirs' ? '#E8F5E9' : 'transparent' }}>{line}</div>)}
                    </div>
                  </div>
                  {!resolved && (
                    <div style={{ padding: '8px 14px', borderTop: '0.5px solid var(--color-border)', display: 'flex', gap: 8 }}>
                      <Button size="small" onClick={() => setResolvedConflicts((prev) => ({ ...prev, [key]: 'ours' }))}>保留公共图谱</Button>
                      <Button size="small" type="primary" onClick={() => setResolvedConflicts((prev) => ({ ...prev, [key]: 'theirs' }))}>采用提交版本</Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      }}
    />
  )
}

export default TeacherDiffPage
