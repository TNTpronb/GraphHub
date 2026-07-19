// 教师端 — 成员管理（现有成员 + 加入申请 + 邀请码）

import { useState } from 'react'
import { Tabs, Button, Table, Tag, message, Tooltip, Modal } from 'antd'
import { CopyOutlined, StopOutlined, PlusOutlined, CheckOutlined, CloseOutlined, DeleteOutlined, CrownOutlined } from '@ant-design/icons'
import { mockEnrollmentRequests, mockInviteCodes, mockMembers } from '../../../api/mock/dashboard'

const EnrollmentsPage = () => {
  const [activeTab, setActiveTab] = useState('members')
  const [requests, setRequests] = useState(mockEnrollmentRequests)
  const [inviteCodes, setInviteCodes] = useState(mockInviteCodes)
  const [members, setMembers] = useState(mockMembers)
  const [selectedReqIds, setSelectedReqIds] = useState<string[]>([])

  const handleApprove = (id: string) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'approved' as const } : r)))
    message.success('已通过申请')
  }
  const handleReject = (id: string) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'rejected' as const } : r)))
    message.info('已拒绝申请')
  }
  const handleBatchApprove = () => {
    setRequests((prev) => prev.map((r) => (selectedReqIds.includes(r.id) ? { ...r, status: 'approved' as const } : r)))
    message.success(`已批量通过 ${selectedReqIds.length} 个申请`)
    setSelectedReqIds([])
  }
  const handleCreateCode = () => {
    const newCode = {
      id: `ic-${Date.now()}`, code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      courseId: 'course-1', maxUses: 50, usedCount: 0, expiresAt: null,
      isActive: true, createdAt: '刚刚',
    }
    setInviteCodes((prev) => [newCode, ...prev])
    message.success('邀请码已生成')
  }
  const handleCopyCode = (code: string) => { navigator.clipboard.writeText(code); message.success('已复制') }
  const handleDeactivateCode = (id: string) => {
    setInviteCodes((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: false } : c)))
    message.info('已停用')
  }
  const handleRemoveMember = (id: string, name: string) => {
    Modal.confirm({
      title: '确认移除',
      content: `确定要将「${name}」从本课程移除吗？`,
      okText: '移除', cancelText: '取消',
      okButtonProps: { danger: true },
      onOk: () => { setMembers((prev) => prev.filter((m) => m.id !== id)); message.success(`已移除 ${name}`) },
    })
  }

  const handleToggleReviewer = (id: string, name: string, current: string) => {
    const isReviewer = current === 'reviewer'
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, role: isReviewer ? 'student' as const : 'reviewer' as const } : m))
    message.success(`已将「${name}」${isReviewer ? '取消审核员' : '设为审核员'}`)
  }

  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>成员管理</h3>
      <Tabs activeKey={activeTab} onChange={setActiveTab}
        items={[
          {
            key: 'members', label: `成员 (${members.length})`,
            children: (
              <Table dataSource={members} rowKey="id" size="middle"
                style={{ background: '#fff', borderRadius: 8 }}
                columns={[
                  { title: '姓名', dataIndex: 'studentName' },
                  { title: '学号', dataIndex: 'studentId' },
                  { title: '角色', dataIndex: 'role', render: (r: string) => (
                    <Tag color={r === 'reviewer' ? 'purple' : 'default'}>
                      {r === 'reviewer' ? '审核员' : '学生'}
                    </Tag>
                  )},
                  { title: '加入方式', dataIndex: 'joinedBy', render: (b: string) => (
                    <Tag>{b === 'invite_code' ? '邀请码' : b === 'teacher_approval' ? '教师审批' : '班级分配'}</Tag>
                  )},
                  { title: '加入时间', dataIndex: 'joinedAt' },
                  { title: '操作', render: (_: any, r: any) => (
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Button size="small"
                        type={r.role === 'reviewer' ? 'default' : 'primary'}
                        icon={<CrownOutlined />}
                        onClick={() => handleToggleReviewer(r.id, r.studentName, r.role)}>
                        {r.role === 'reviewer' ? '取消审核' : '设为审核'}
                      </Button>
                      <Button size="small" danger icon={<DeleteOutlined />}
                        onClick={() => handleRemoveMember(r.id, r.studentName)}>移除</Button>
                    </div>
                  )},
                ]}
              />
            ),
          },
          {
            key: 'requests', label: `加入申请 (${requests.filter((r) => r.status === 'pending').length})`,
            children: (
              <div>
                {selectedReqIds.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <Button type="primary" onClick={handleBatchApprove}>批量通过 ({selectedReqIds.length})</Button>
                  </div>
                )}
                <Table dataSource={requests} rowKey="id" size="middle"
                  rowSelection={{
                    selectedRowKeys: selectedReqIds,
                    onChange: (keys) => setSelectedReqIds(keys as string[]),
                    getCheckboxProps: (r: any) => ({ disabled: r.status !== 'pending' }),
                  }}
                  style={{ background: '#fff', borderRadius: 8 }}
                  columns={[
                    { title: '学生', dataIndex: 'studentName', render: (n: string, r: any) => <span>{n} <span style={{ color: '#999', fontSize: 12 }}>{r.studentId}</span></span> },
                    { title: '留言', dataIndex: 'message', ellipsis: true, render: (m: string) => m || <span style={{ color: '#999' }}>（无留言）</span> },
                    { title: '时间', dataIndex: 'createdAt', width: 120 },
                    { title: '状态', dataIndex: 'status', width: 80, render: (s: string) => <Tag color={s === 'approved' ? 'green' : s === 'rejected' ? 'red' : 'gold'}>{s === 'approved' ? '已通过' : s === 'rejected' ? '已拒绝' : '待处理'}</Tag> },
                    { title: '操作', width: 140, render: (_: any, r: any) => r.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: 4 }}>
                        <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => handleApprove(r.id)}>通过</Button>
                        <Button size="small" danger icon={<CloseOutlined />} onClick={() => handleReject(r.id)}>拒绝</Button>
                      </div>
                    ) : null },
                  ]}
                />
              </div>
            ),
          },
          {
            key: 'codes', label: '邀请码',
            children: (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateCode}>生成新邀请码</Button>
                </div>
                <Table dataSource={inviteCodes} rowKey="id" size="middle"
                  style={{ background: '#fff', borderRadius: 8 }}
                  columns={[
                    { title: '邀请码', dataIndex: 'code', render: (c: string) => (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 16, letterSpacing: 2 }}>{c}</span>
                        <Tooltip title="复制"><Button size="small" type="text" icon={<CopyOutlined />} onClick={() => handleCopyCode(c)} /></Tooltip>
                      </div>
                    )},
                    { title: '已用/上限', render: (_: any, r: any) => <span>{r.usedCount} / {r.maxUses ?? '∞'}</span> },
                    { title: '过期', dataIndex: 'expiresAt', render: (d: string | null) => d || '永久有效' },
                    { title: '状态', dataIndex: 'isActive', render: (a: boolean) => <Tag color={a ? 'green' : 'default'}>{a ? '有效' : '已停用'}</Tag> },
                    { title: '操作', render: (_: any, r: any) => r.isActive ? <Button size="small" icon={<StopOutlined />} onClick={() => handleDeactivateCode(r.id)}>停用</Button> : null },
                  ]}
                />
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}

export default EnrollmentsPage
