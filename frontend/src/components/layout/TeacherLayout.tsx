// 教师端布局壳
// 导航通过汉堡菜单侧滑 Drawer（320px），侧边栏空间留给页面内容（树状列表等）

import { useState, useRef, useCallback, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Select, Badge, Avatar, Dropdown, Drawer } from 'antd'
import TreeNodeList from '../graph/TreeNodeList'
import CourseToolbar from './CourseToolbar'
import {
  MenuOutlined,
  PlusOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import type { MenuItemType } from 'antd/es/menu/interface'
import {
  teacherCourseMenuItems,
  teacherGlobalMenuItems,
} from './sidebarConfig'

const { Header, Content } = Layout

const TeacherLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [currentCourseId, setCurrentCourseId] = useState<string | undefined>()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [dragging, setDragging] = useState(false)

  const pathParts = location.pathname.split('/')
  // URL: /teacher/courses/course-1/graph → ['', 'teacher', 'courses', 'course-1', 'graph']
  const urlCourseId = (pathParts[2] === 'courses' && pathParts[3] !== 'new')
    ? pathParts[3]
    : undefined
  const urlSubPath = urlCourseId ? pathParts[4] : undefined

  const selectedKey = urlCourseId
    ? (urlSubPath || 'graph')
    : (pathParts[2] !== 'courses' ? pathParts[2] : undefined) || 'dashboard'

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    setDrawerOpen(false)
    if (urlCourseId && ['graph', 'graph/versions', 'materials', 'exercises', 'analytics', 'enrollments', 'review', 'issues', 'info', 'contributions'].includes(key)) {
      navigate(`/teacher/courses/${urlCourseId}/${key}`)
      return
    }
    if (key === 'dashboard') navigate('/teacher/dashboard')
    if (key === 'review')    navigate('/teacher/review')
    if (key === 'settings')  navigate('/teacher/settings')
  }

  const handleMouseDown = useCallback(() => setDragging(true), [])

  useEffect(() => {
    if (!dragging) return
    const mm = (e: MouseEvent) => setSidebarWidth(Math.max(200, Math.min(480, e.clientX)))
    const mu = () => setDragging(false)
    document.addEventListener('mousemove', mm)
    document.addEventListener('mouseup', mu)
    return () => { document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu) }
  }, [dragging])

  const mockCourses = [
    { id: 'course-1', name: '数据结构', pendingCount: 3 },
    { id: 'course-2', name: '操作系统', pendingCount: 1 },
  ]

  // URL relative sub-path after courses/courseId/
  const courseSubPath = urlCourseId ? location.pathname.split(`/courses/${urlCourseId}/`)[1] || 'graph' : undefined
  const coursePaths = ['graph', 'graph/versions', 'materials', 'exercises', 'analytics', 'enrollments', 'review', 'issues', 'info', 'diff', 'contributions']
  const isCoursePage = !!urlCourseId && (
    coursePaths.includes(courseSubPath) ||
    courseSubPath?.startsWith('exercises/')
  )
  const isGraphPage = courseSubPath === 'graph'

  // 每个图标按钮共享的圆角方框样式
  const iconBtnStyle: React.CSSProperties = {
    width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: '#FAFAFA', border: '0.5px solid var(--color-border)', borderRadius: 6, cursor: 'pointer',
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* ── Header 64px ── */}
      <Header style={{
        height: 64, background: '#f9f7fb', borderBottom: '0.5px solid var(--color-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px',
      }}>
        {/* 左侧：汉堡菜单 + Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={iconBtnStyle} onClick={() => setDrawerOpen(true)}>
            <MenuOutlined style={{ fontSize: 16, color: 'var(--color-text)' }} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, cursor: 'pointer' }} onClick={() => navigate('/teacher/dashboard')}>
            KG-Class
          </span>
          {urlCourseId && (
            <Select value={currentCourseId}
              onChange={(val) => { setCurrentCourseId(val); navigate(`/teacher/courses/${val}/graph`) }}
              placeholder="选择课程" style={{ width: 180 }} size="small"
              options={mockCourses.map(c => ({ value: c.id, label: c.pendingCount > 0 ? `${c.name} (${c.pendingCount})` : c.name }))}
              variant="borderless" />
          )}
        </div>

        {/* 右侧：每个按钮独立圆角方框 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={iconBtnStyle} onClick={() => navigate('/teacher/courses/new')}>
            <PlusOutlined style={{ fontSize: 16, color: 'var(--color-text)' }} />
          </div>
          <Badge count={5} size="small" offset={[-4, 4]}>
            <div style={iconBtnStyle}>
              <BellOutlined style={{ fontSize: 16, color: 'var(--color-text)' }} />
            </div>
          </Badge>
          <Dropdown menu={{
            items: [
              { key: 'settings', icon: <SettingOutlined />, label: '个人设置' },
              { type: 'divider' },
              { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
            ],
            onClick: ({ key }) => {
              if (key === 'settings') navigate('/teacher/settings')
              if (key === 'logout') navigate('/login')
            },
          }}>
            <Avatar size={22} icon={<UserOutlined />}
              style={{ cursor: 'pointer', backgroundColor: 'var(--color-primary)', marginLeft: 2 }} />
          </Dropdown>
        </div>
      </Header>

      {/* ── 侧滑 Drawer（从左边滑出） ── */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}
        width={320} placement="left" closable={false}
        styles={{ wrapper: { borderRadius: '0 12px 12px 0', overflow: 'hidden' }, body: { padding: 0 } }}>
        <div style={{ padding: '12px 0' }}>
          <div style={{ padding: '8px 20px 16px', fontSize: 18, fontWeight: 700 }}>KG-Class</div>
          <Menu mode="inline" selectedKeys={[selectedKey]} onClick={onMenuClick}
            items={teacherCourseMenuItems}
            style={{ background: 'transparent', borderInlineEnd: 'none', padding: '0 8px' }} />
          <div style={{ height: 1, background: 'var(--color-border)', margin: '8px 16px' }} />
          <Menu mode="inline" selectedKeys={[selectedKey]} onClick={onMenuClick}
            items={(teacherGlobalMenuItems as MenuItemType[]).map(item => ({
              ...item,
              label: item.key === 'review' ? (
                <span>审核工作台<span style={{
                  display: 'inline-block', background: 'var(--color-danger)',
                  color: '#fff', fontSize: 11, borderRadius: 10, padding: '0 6px',
                  marginLeft: 8, lineHeight: '18px',
                }}>5</span></span>
              ) : item.label,
            }))}
            style={{ background: 'transparent', borderInlineEnd: 'none', padding: '0 8px' }} />
        </div>
      </Drawer>

      {/* ── 内容区 ── */}
      <Layout>
        <Content style={{ display: 'flex', background: 'var(--color-bg)' }}>
          {isCoursePage && <CourseToolbar role="teacher" courseId={urlCourseId} />}
          {isGraphPage && (
            <div style={{
              width: sidebarWidth, flexShrink: 0, background: '#fff',
              borderRight: '0.5px solid var(--color-border)',
              overflow: 'auto',
              transition: dragging ? 'none' : 'width 0.1s',
            }}>
              <TreeNodeList />
            </div>
          )}
          {isGraphPage && (
            <div onMouseDown={handleMouseDown} style={{
              width: 4, cursor: 'col-resize', flexShrink: 0,
              background: dragging ? 'var(--color-primary)' : 'transparent', transition: 'background 0.15s',
            }} onMouseEnter={e => { if (!dragging) e.currentTarget.style.background = 'var(--color-primary)' }}
              onMouseLeave={e => { if (!dragging) e.currentTarget.style.background = 'transparent' }} />
          )}
          <div style={{ flex: 1, overflow: 'auto', padding: isGraphPage ? 0 : 24 }}>
            {isGraphPage ? (
              <Outlet />
            ) : (
              <div style={{ maxWidth: 1280, margin: '0 auto' }}>
                <Outlet />
              </div>
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default TeacherLayout
