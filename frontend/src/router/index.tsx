// src/router/index.tsx
// 路由表定义
// React Router v6 的 createBrowserRouter 语法

import { createBrowserRouter } from 'react-router-dom'

// ── 布局壳 ──
import TeacherLayout from '../components/layout/TeacherLayout'
import StudentLayout from '../components/layout/StudentLayout'

// ── 页面 ──
import LoginPage            from '../pages/login'
import RegisterPage         from '../pages/register'
import ForgotPasswordPage   from '../pages/forgot-password'
import TeacherDashboard     from '../pages/teacher/dashboard'
import TeacherGraph         from '../pages/teacher/graph'
import TeacherReview        from '../pages/teacher/review'
import TeacherCreateCourse  from '../pages/teacher/create-course'
import TeacherIssues        from '../pages/teacher/issues'
import TeacherInfo          from '../pages/teacher/info'
import TeacherEnrollments   from '../pages/teacher/enrollments'
import TeacherDiff         from '../pages/teacher/diff'
import TeacherHistory      from '../pages/teacher/graph/versions'
import StudentDashboard     from '../pages/student/dashboard'
import StudentGraph         from '../pages/student/graph'
import StudentPR            from '../pages/student/pr'
import StudentPrivateGraph  from '../pages/student/private-graph'
import StudentIssues        from '../pages/student/issues'
import StudentInfo          from '../pages/student/info'
import StudentMyPR          from '../pages/student/my-pr'
import StudentContributions from '../pages/student/contributions'
import StudentDiff         from '../pages/student/diff'
import StudentMyGraphs     from '../pages/student/my-graphs'
import StudentGraphEditor  from '../pages/student/my-graphs-editor'

const router = createBrowserRouter([
  // ── 登录/注册/忘记密码（独立路由，无布局壳） ──
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
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
      { path: 'courses/:courseId/graph/versions', element: <TeacherHistory /> },
      { path: 'courses/:courseId/review', element: <TeacherReview /> },
      { path: 'courses/:courseId/enrollments', element: <TeacherEnrollments /> },
      { path: 'courses/:courseId/issues', element: <TeacherIssues /> },
      { path: 'courses/:courseId/info', element: <TeacherInfo /> },
      { path: 'courses/:courseId/diff/:prId', element: <TeacherDiff /> },
      { path: 'courses/:courseId/materials', element: <TeacherDashboard /> },
      { path: 'courses/:courseId/exercises', element: <TeacherDashboard /> },
      { path: 'courses/:courseId/analytics', element: <TeacherDashboard /> },
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
      { path: 'courses/:courseId/graph/versions', element: <TeacherHistory /> },
      { path: 'courses/:courseId/my-graphs/:versionKey', element: <StudentGraphEditor /> },
      { path: 'courses/:courseId/pr/:prId', element: <StudentPR /> },
      { path: 'courses/:courseId/my-graphs', element: <StudentMyGraphs /> },
      { path: 'courses/:courseId/my-pr', element: <StudentMyPR /> },
      { path: 'courses/:courseId/issues', element: <StudentIssues /> },
      { path: 'courses/:courseId/contributions', element: <StudentContributions /> },
      { path: 'courses/:courseId/info', element: <StudentInfo /> },
      { path: 'courses/:courseId/diff/:prId', element: <StudentDiff /> },
      { path: 'courses/:courseId/exercises', element: <StudentDashboard /> },
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