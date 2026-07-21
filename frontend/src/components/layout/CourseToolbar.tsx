// 课程工具栏 — Obsidian 风格左侧窄图标栏（仅课程页显示）

import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Tooltip } from 'antd'
import {
  ApartmentOutlined, AuditOutlined, TeamOutlined,
  InfoCircleOutlined, BugOutlined, TrophyOutlined,
  ForkOutlined, HistoryOutlined, FolderOpenOutlined,
} from '@ant-design/icons'

interface ToolbarButton {
  key: string
  icon: React.ReactNode
  label: string
  path: string
}

const teacherButtons: ToolbarButton[] = [
  { key: 'graph',    icon: <ApartmentOutlined />, label: '图谱',    path: 'graph' },
  { key: 'history',  icon: <HistoryOutlined />,    label: '历史',    path: 'graph/versions' },
  { key: 'materials',icon: <FolderOpenOutlined />, label: '资料',    path: 'materials' },
  { key: 'review',   icon: <AuditOutlined />,    label: '审核',    path: 'review' },
  { key: 'members',  icon: <TeamOutlined />,     label: '成员',    path: 'enrollments' },
  { key: 'issues',   icon: <BugOutlined />,      label: 'Issue',   path: 'issues' },
  { key: 'info',     icon: <InfoCircleOutlined />, label: '信息',   path: 'info' },
]

const studentButtons: ToolbarButton[] = [
  { key: 'graph',         icon: <ApartmentOutlined />,  label: '图谱',      path: 'graph' },
  { key: 'history',       icon: <HistoryOutlined />,    label: '历史',      path: 'graph/versions' },
  { key: 'materials',     icon: <FolderOpenOutlined />, label: '资料',      path: 'materials' },
  { key: 'my-graphs',     icon: <ForkOutlined />,       label: '我的图谱',  path: 'my-graphs' },
  { key: 'my-pr',         icon: <AuditOutlined />,      label: '我的提交',   path: 'my-pr' },
  { key: 'issues',        icon: <BugOutlined />,        label: 'Issue',     path: 'issues' },
  { key: 'contributions', icon: <TrophyOutlined />,     label: '我的贡献',   path: 'contributions' },
  { key: 'info',          icon: <InfoCircleOutlined />,  label: '信息',      path: 'info' },
]

interface CourseToolbarProps {
  role: 'teacher' | 'student'
  courseId?: string
}

const CourseToolbar: React.FC<CourseToolbarProps> = ({ role, courseId }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const buttons = role === 'teacher' ? teacherButtons : studentButtons

  const activeKey = buttons.find((b) =>
    location.pathname.split('/').slice(-b.path.split('/').length).join('/') === b.path
  )?.key || 'graph'

  return (
    <div style={{
      width: 48, flexShrink: 0,
      background: '#FAFAFA',
      borderRight: '0.5px solid var(--color-border)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '8px 0', gap: 2,
    }}>
      {buttons.map((btn) => {
        const isActive = activeKey === btn.key
        return (
          <Tooltip key={btn.key} title={btn.label} placement="right">
            <div
              onClick={() => navigate(`/${role}/courses/${courseId}/${btn.path}`)}
              style={{
                width: 36, height: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 18,
                color: isActive ? '#956BF5' : '#6B6B6B',
                background: isActive ? '#F4F0FF' : 'transparent',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = '#F0F0F0'
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent'
              }}
            >
              {btn.icon}
            </div>
          </Tooltip>
        )
      })}
    </div>
  )
}

export default CourseToolbar
