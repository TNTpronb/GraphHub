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
    id: 'pr-001',
    title: '新增节点',
    description: '红黑树 #knowledge-point #code-implementation',
    status: 'approved',
    createdAt: '2 小时前',
  },
  {
    id: 'pr-002',
    title: '修改关系',
    description: '添加栈←队列的 PREREQUISITE 关系',
    status: 'pending',
    createdAt: '昨天',
  },
  {
    id: 'pr-003',
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

// ── 审核工作台 Mock 数据 ──

export interface PRItem {
  id: string
  submitter: string
  courseName: string
  changeType: string       // 'note_add' | 'note_edit' | 'edge_add' | 'edge_edit' 等
  changeSummary: string     // 人类可读的变更摘要
  status: 'pending' | 'approved' | 'rejected'
  aiScore: number | null    // 0-100，提交时自动评分，仅作参考
  aiReport: {
    duplicateCheck: { score: number; similarNodes: string[] }
    contentQuality: { score: number; issues: string[] }
    suggestions: string[]
    riskLevel: 'low' | 'medium' | 'high'
  } | null
  diffPreview: string
  reviewComment?: string    // 审核意见
  reviewedBy?: string       // 审核人
  createdAt: string
}

export const mockPRItems: PRItem[] = [
  {
    id: 'pr-001', submitter: '张三', courseName: '数据结构',
    changeType: 'note_add', changeSummary: '新增节点 "红黑树" #knowledge-point',
    status: 'pending', aiScore: 85, aiReport: {
      duplicateCheck: { score: 92, similarNodes: [] },
      contentQuality: { score: 85, issues: ['缺少时间复杂度分析'] },
      suggestions: ['建议补充 O(log n) 的推理过程'],
      riskLevel: 'low',
    },
    diffPreview: '+ 红黑树节点（含定义、性质、旋转操作）',
    createdAt: '10 分钟前',
  },
  {
    id: 'pr-002', submitter: '李四', courseName: '数据结构',
    changeType: 'edge_add', changeSummary: '新增 PREREQUISITE: 二叉搜索树 → 红黑树',
    status: 'pending', aiScore: 90, aiReport: {
      duplicateCheck: { score: 95, similarNodes: [] },
      contentQuality: { score: 90, issues: [] },
      suggestions: [],
      riskLevel: 'low',
    },
    diffPreview: '+ PREREQUISITE 关系：红黑树依赖二叉搜索树',
    createdAt: '30 分钟前',
  },
  {
    id: 'pr-003', submitter: '王五', courseName: '操作系统',
    changeType: 'note_edit', changeSummary: '修改节点 "进程调度" — 补充多级反馈队列',
    status: 'pending', aiScore: 72, aiReport: {
      duplicateCheck: { score: 88, similarNodes: [] },
      contentQuality: { score: 72, issues: ['部分描述与已有节点重复'] },
      suggestions: [],
      riskLevel: 'medium',
    },
    diffPreview: '~ 进程调度：新增多级反馈队列算法描述',
    createdAt: '1 小时前',
  },
  {
    id: 'pr-004', submitter: '赵六', courseName: '数据结构',
    changeType: 'error_point_add', changeSummary: '新增易错点 "栈溢出原因分析"',
    status: 'pending', aiScore: 62, aiReport: {
      duplicateCheck: { score: 70, similarNodes: ['栈的基本概念'] },
      contentQuality: { score: 62, issues: ['内容与已有节点高度重叠', '缺少代码示例'] },
      suggestions: ['考虑补充到已有节点而非新建', '添加具体的栈溢出代码案例'],
      riskLevel: 'high',
    },
    diffPreview: '+ 易错点：栈溢出原因分析（含 3 种场景）',
    createdAt: '2 小时前',
  },
  {
    id: 'pr-005', submitter: '孙七', courseName: '计算机网络',
    changeType: 'material_add', changeSummary: '挂载资料 "TCP 三次握手详解.pdf" 到节点 TCP',
    status: 'approved', aiScore: 95, aiReport: {
      duplicateCheck: { score: 100, similarNodes: [] },
      contentQuality: { score: 95, issues: [] },
      suggestions: [],
      riskLevel: 'low',
    },
    diffPreview: '+ 挂载资料：TCP 三次握手详解.pdf → TCP 节点',
    createdAt: '昨天',
  },
]

// ── 加入申请 Mock 数据 ──

export interface EnrollmentRequestItem {
  id: string
  studentName: string
  studentId: string
  courseId: string
  courseName: string
  message: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export const mockEnrollmentRequests: EnrollmentRequestItem[] = [
  { id: 'er-1', studentName: '李明', studentId: '20241501', courseId: 'course-1',
    courseName: '数据结构', message: '我对数据结构非常感兴趣，希望能在张老师的课程中深入学习。',
    status: 'pending', createdAt: '20 分钟前' },
  { id: 'er-2', studentName: '王芳', studentId: '20241502', courseId: 'course-1',
    courseName: '数据结构', message: '我是转专业学生，需要补修这门课。',
    status: 'pending', createdAt: '1 小时前' },
  { id: 'er-3', studentName: '赵强', studentId: '20241503', courseId: 'course-1',
    courseName: '数据结构', message: '',
    status: 'approved', createdAt: '昨天' },
]

// ── 邀请码 Mock 数据 ──

export interface InviteCodeItem {
  id: string
  code: string
  courseId: string
  maxUses: number | null
  usedCount: number
  expiresAt: string | null
  isActive: boolean
  createdAt: string
}

export const mockInviteCodes: InviteCodeItem[] = [
  { id: 'ic-1', code: 'DSK2025', courseId: 'course-1', maxUses: 50, usedCount: 42,
    expiresAt: '2026-09-01', isActive: true, createdAt: '2026-07-01' },
  { id: 'ic-2', code: 'DSKOPEN', courseId: 'course-1', maxUses: null, usedCount: 12,
    expiresAt: null, isActive: true, createdAt: '2026-07-10' },
]

// ── 现有成员 Mock 数据 ──

export interface MemberItem {
  id: string
  studentName: string
  studentId: string
  role: 'student' | 'reviewer'
  joinedAt: string
  joinedBy: 'invite_code' | 'teacher_approval' | 'class_auto'
}

export const mockMembers: MemberItem[] = [
  { id: 'm1', studentName: '张三', studentId: '2024001', role: 'student',  joinedAt: '2026-07-01', joinedBy: 'class_auto' },
  { id: 'm2', studentName: '李四', studentId: '2024002', role: 'reviewer', joinedAt: '2026-07-01', joinedBy: 'class_auto' },
  { id: 'm3', studentName: '王五', studentId: '2024003', role: 'student',  joinedAt: '2026-07-05', joinedBy: 'invite_code' },
  { id: 'm4', studentName: '赵六', studentId: '2024004', role: 'student',  joinedAt: '2026-07-10', joinedBy: 'teacher_approval' },
  { id: 'm5', studentName: '孙七', studentId: '2024005', role: 'student',  joinedAt: '2026-07-12', joinedBy: 'invite_code' },
]