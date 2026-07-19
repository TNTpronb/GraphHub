// 学生端布局壳

import { useState, useRef, useCallback, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Badge, Avatar, Dropdown, Drawer } from 'antd'
import TreeNodeList from '../graph/TreeNodeList'
import CourseToolbar from './CourseToolbar'
import {
  MenuOutlined, BellOutlined, UserOutlined,
  SettingOutlined, LogoutOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { studentMenuItems } from './sidebarConfig'

const { Header, Content } = Layout

const StudentLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [dragging, setDragging] = useState(false)

  const pathParts = location.pathname.split('/')
  // URL: /student/courses/course-1/graph → ['', 'student', 'courses', 'course-1', 'graph']
  const inCourse = pathParts[2] === 'courses'
  const menuKeyToPath: Record<string, string> = {
    dashboard: '/student/dashboard',
    browse:    '/student/courses/browse',
    graph:     inCourse ? `/student/courses/${pathParts[3]}/graph` : '/student/courses-browse',
    exercises: inCourse ? `/student/courses/${pathParts[3]}/exercises` : '/student/courses-browse',
    contributions: '/student/contributions',
    settings:  '/student/settings',
  }
  const urlSubPath = inCourse ? (pathParts[4] || 'graph') : (pathParts[2] || 'dashboard')
  const urlCourseId = inCourse ? pathParts[3] : undefined

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    setDrawerOpen(false)
    navigate(menuKeyToPath[key] || '/student/dashboard')
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

  const isContentPage = ['graph', 'exercises', 'my-pr', 'issues', 'contributions', 'info'].includes(urlSubPath)
  const isGraphPage = urlSubPath === 'graph'

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={iconBtnStyle} onClick={() => setDrawerOpen(true)}>
            <MenuOutlined style={{ fontSize: 16, color: 'var(--color-text)' }} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, cursor: 'pointer' }} onClick={() => navigate('/student/dashboard')}>
            KG-Class
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Badge count={3} size="small" offset={[-4, 4]}>
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
              if (key === 'settings') navigate('/student/settings')
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
          <Menu mode="inline" selectedKeys={[urlSubPath]} onClick={onMenuClick}
            items={studentMenuItems}
            style={{ background: 'transparent', borderInlineEnd: 'none', padding: '0 8px' }} />
        </div>
      </Drawer>

      <Layout>
        <Content style={{ display: 'flex', background: 'var(--color-bg)' }}>
          {isContentPage && <CourseToolbar role="student" courseId={urlCourseId} />}
          {isGraphPage && (
            <div style={{
              width: sidebarWidth, flexShrink: 0, background: '#fff',
              borderRight: '0.5px solid var(--color-border)',
              overflow: 'auto',
              transition: dragging ? 'none' : 'width 0.1s',
            }}>
              <TreeNodeList readOnly />
            </div>
          )}
          {isContentPage && (
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

export default StudentLayout
