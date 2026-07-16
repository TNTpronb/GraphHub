// src/router/index.tsx
// 路由表定义
// React Router v6 的 createBrowserRouter 语法

import { createBrowserRouter } from 'react-router-dom'

// ── 布局壳 ──
import TeacherLayout from '../components/layout/TeacherLayout'
import StudentLayout from '../components/layout/StudentLayout'

// ── 页面（目前都是占位组件） ──
import LoginPage            from '../pages/login'
import TeacherDashboard     from '../pages/teacher/dashboard'
import TeacherGraph         from '../pages/teacher/graph'
import TeacherReview        from '../pages/teacher/review'
import TeacherCreateCourse  from '../pages/teacher/create-course'
import StudentDashboard     from '../pages/student/dashboard'
import StudentGraph         from '../pages/student/graph'
import StudentPR            from '../pages/student/pr'
import StudentPrivateGraph  from '../pages/student/private-graph'

const router = createBrowserRouter([
  // ── 登录页（独立路由，无布局壳） ──
  {
    path: '/login',
    element: <LoginPage />,
  },

  // ── 教师端 ──
  {
    path: '/teacher',
    element: <TeacherLayout />,      // 布局壳：Header + Sidebar
    children: [
      { index: true, element: <TeacherDashboard /> },  // index → 默认子路由
      { path: 'dashboard', element: <TeacherDashboard /> },
      { path: 'courses/new', element: <TeacherCreateCourse /> },
      { path: 'courses/:courseId/graph', element: <TeacherGraph /> },
      { path: 'review', element: <TeacherReview /> },
    ],
  },

  // ── 学生端 ──
  {
    path: '/student',
    element: <StudentLayout />,
    children: [
      { index: true, element: <StudentDashboard /> },
      { path: 'dashboard', element: <StudentDashboard /> },
      { path: 'courses/:courseId/graph', element: <StudentGraph /> },
      { path: 'private-graph/:graphId', element: <StudentPrivateGraph /> },
      { path: 'pr/:prId', element: <StudentPR /> },
    ],
  },

  // ── 根路径重定向到登录页 ──
  {
    path: '/',
    element: <LoginPage />,
  },
])

export default router