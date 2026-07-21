// 学生端 Diff 查看页（只读）

import { useParams, useNavigate } from 'react-router-dom'
import { Button } from 'antd'
import { ArrowLeftOutlined, WarningOutlined } from '@ant-design/icons'
import DiffContent, { mockDiffFiles } from '../../../components/pr/DiffContent'

const StudentDiffPage = () => {
  const { prId } = useParams()
  const navigate = useNavigate()

  return (
    <DiffContent
      header={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>PR #{prId} · 变更对比</h3>
          </div>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
        </div>
      }
      footer={null}
      conflictFooter={(currentFile) => {
        if (!currentFile.hasConflict || !currentFile.conflicts) return null
        return (
          <div style={{ padding: 16, borderTop: '1px solid var(--color-warning)' }}>
            <div style={{ padding: '8px 12px', background: '#FFF8E1', borderRadius: 6, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
              <WarningOutlined style={{ color: '#D4A72C', fontSize: 16 }} />
              <span>此文件存在 <strong>{currentFile.conflicts.length}</strong> 个合并冲突，教师审核时将处理。</span>
            </div>
            {currentFile.conflicts.map((conflict, ci) => (
              <div key={ci} style={{ marginBottom: 12, border: '0.5px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
                <div style={{ padding: '8px 14px', fontWeight: 600, fontSize: 13, background: '#FAFAFA' }}>冲突 {ci + 1}：{conflict.title}</div>
                <div style={{ display: 'flex' }}>
                  <div style={{ flex: 1, borderRight: '0.5px solid var(--color-border)' }}>
                    <div style={{ padding: '4px 12px', fontSize: 12, color: '#999', background: '#FAFAFA' }}>公共图谱</div>
                    {conflict.ours.map((line, li) => <div key={li} style={{ padding: '2px 12px', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{line}</div>)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ padding: '4px 12px', fontSize: 12, color: '#999', background: '#FAFAFA' }}>你的提交</div>
                    {conflict.theirs.map((line, li) => <div key={li} style={{ padding: '2px 12px', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{line}</div>)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      }}
    />
  )
}

export default StudentDiffPage
