// src/api/mock/dashboard.ts
// 仪表盘页面的模拟数据
// 后续替换为 axios.get('/api/teacher/dashboard') 的返回值

export interface PendingReviewByCourse {
  courseId: string
  courseName: string
  pendingCount: number
}

export interface CourseCardData {
  id: string
  name: string
  className: string
  semester: string
  nodeCount: number
  lastUpdated: string
}

// 模拟待审核数据
export const mockPendingReviews: PendingReviewByCourse[] = [
  {
    courseId: 'course-1',
    courseName: '数据结构',
    pendingCount: 5,
  },
  {
    courseId: 'course-2',
    courseName: '操作系统',
    pendingCount: 2,
  },
  {
    courseId: 'course-3',
    courseName: '计算机网络',
    pendingCount: 0,
  },
]

// 模拟课程数据
export const mockCourses: CourseCardData[] = [
  {
    id: 'course-1',
    name: '数据结构',
    className: '计科 2101 班',
    semester: '2025-2026 第一学期',
    nodeCount: 186,
    lastUpdated: '10 分钟前',
  },
  {
    id: 'course-2',
    name: '操作系统',
    className: '计科 2101 班',
    semester: '2025-2026 第一学期',
    nodeCount: 124,
    lastUpdated: '2 小时前',
  },
  {
    id: 'course-3',
    name: '计算机网络',
    className: '计科 2102 班',
    semester: '2025-2026 第一学期',
    nodeCount: 98,
    lastUpdated: '昨天',
  },
]

// ── 学生端 Mock 数据 ──

export interface StudentCourseCard {
  id: string
  name: string
  teacherName: string
  nodeCount: number
  pendingPRCount: number
}

export interface StudentPRItem {
  id: string
  title: string
  description: string
  status: 'approved' | 'pending' | 'rejected' | 'draft'
  createdAt: string
}

export const mockStudentCourses: StudentCourseCard[] = [
  {
    id: 'course-1',
    name: '数据结构',
    teacherName: '张老师',
    nodeCount: 186,
    pendingPRCount: 2,
  },
  {
    id: 'course-2',
    name: '操作系统',
    teacherName: '李老师',
    nodeCount: 124,
    pendingPRCount: 0,
  },
  {
    id: 'course-3',
    name: '计算机网络',
    teacherName: '王老师',
    nodeCount: 98,
    pendingPRCount: 1,
  },
]

export const mockStudentPRs: StudentPRItem[] = [
  {
    id: 'pr-12',
    title: '新增节点',
    description: '红黑树 #knowledge-point #code-implementation',
    status: 'approved',
    createdAt: '2 小时前',
  },
  {
    id: 'pr-11',
    title: '修改关系',
    description: '添加栈←队列的 PREREQUISITE 关系',
    status: 'pending',
    createdAt: '昨天',
  },
  {
    id: 'pr-10',
    title: '补充易错点',
    description: '链表空指针异常 #error-point',
    status: 'rejected',
    createdAt: '3 天前',
  },
]

export const mockStudentStats = {
  totalPoints: 285,
  weeklyPoints: 45,
  rank: 3,
  totalStudents: 42,
  streakDays: 7,
}