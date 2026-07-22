# KG-Class 完整会话快照

> **用途**：新会话开局读取此文件，即可完整继承项目上下文。
> **更新规则**：每次重大功能迭代后更新本文。
> **最后更新**：2026-07-22

---

## 一、项目概述

**KG-Class**（班级共建式知识图谱教学系统）— 面向计算机专业的图谱协作平台。

Github 式协作流程（Fork → PR → 审核 → Merge），师生共建持续生长的知识图谱。

### 技术栈

| 层 | 选型 |
|---|------|
| 框架 | React 19 + TypeScript |
| 构建 | Vite 8 |
| UI | Ant Design 6.x (`antd@6.5.1`) |
| 状态管理 | Zustand 5 |
| 路由 | React Router v7 |
| 图谱渲染 | **自研**：d3-force + Canvas 2D（放弃 AntV G6） |

### 弃用 G6 的原因（重要）

G6 v5.1.1 的 `hover-activate` 与 `drag-element-force` 共享 pointer 事件管线，互斥导致"节点粘鼠标"bug。改用自研 Canvas 2D 渲染引擎。

---

## 二、完整目录结构（frontend/src/）

```
src/
├── api/mock/
│   ├── dashboard.ts       ← 仪表盘/审核/PR Mock
│   └── graph.ts           ← 图谱 Mock（32节点+7种关系+MD_LINK自动生成）
├── components/
│   ├── common/            ← [空]
│   ├── graph/
│   │   ├── GraphCanvas.tsx    ← ★ 自研图谱引擎（d3-force + Canvas 2D, ~530行）
│   │   ├── NoteDetailPanel.tsx← 节点详情面板
│   │   └── TreeNodeList.tsx   ← ★ 文件资源管理器（树状图, ~265行）
│   ├── layout/
│   │   ├── CourseToolbar.tsx   ← ★ Obsidian风格窄工具栏（48px）
│   │   ├── sidebarConfig.ts   ← 菜单项配置
│   │   ├── StudentLayout.tsx  ← 学生布局壳
│   │   └── TeacherLayout.tsx  ← 教师布局壳
│   ├── markdown/          ← [空]
│   └── pr/
│       ├── ConflictPanel.tsx  ← 冲突解决面板
│       └── DiffContent.tsx    ← Git风格Diff视图
├── contexts/
│   └── SidebarContext.tsx  ← [未使用]
├── pages/
│   ├── login/             ← 登录（三种模式）
│   ├── register/          ← 注册
│   ├── forgot-password/   ← 忘记密码
│   ├── teacher/
│   │   ├── dashboard/     ← [占位] 教师首页
│   │   ├── create-course/ ← [占位] 新建课程
│   │   ├── graph/         ← ★ 图谱管理页（工作区Tab + GraphCanvas + NoteDetailPanel）
│   │   │   └── versions/  ← [占位] 提交历史
│   │   ├── exercises/     ← ★ 习题库管理（index.tsx 列表 + detail.tsx 题目详情）
│   │   ├── materials/     ← [占位] 课程资料
│   │   ├── review/        ← [占位] 审核工作台
│   │   ├── enrollments/   ← [占位] 学生管理
│   │   ├── issues/        ← [占位] Issue
│   │   ├── info/          ← [占位] 课程信息
│   │   ├── diff/          ← [占位] PR Diff
│   │   └── analytics/     ← [空]
│   └── student/
│       ├── dashboard/     ← [占位] 学生首页
│       ├── graph/         ← [占位] 图谱浏览
│       ├── exercises/     ← ★ 学生习题（index.tsx 浏览 + detail.tsx 做题）
│       ├── issues/        ← [占位]
│       ├── info/          ← [占位]
│       ├── diff/          ← [占位]
│       ├── my-graphs/     ← [占位] 我的图谱
│       ├── my-graphs-editor/ ← [占位]
│       ├── my-pr/         ← [占位] 我的提交
│       ├── pr/            ← [占位] PR
│       ├── contributions/ ← [占位] 我的贡献
│       └── private-graph/ ← [占位] 旧私人图谱（待移除）
├── router/index.tsx       ← ★ 全部路由（createBrowserRouter）
├── stores/
│   ├── graphStore.ts      ← ★ 图谱节点/边数据 + selectedNodeId + addExerciseBank
│   ├── workspaceStore.ts  ← ★ 工作区标签页（tabs/open/close/activeKey）
│   └── authStore.ts       ← [空]
├── styles/                ← CSS变量 + reset
├── theme/                 ← Ant Design 主题（主色#956BF5）
└── types/index.ts         ← [空]
```

---

## 三、Zustand Store 结构（核心）

### graphStore.ts
```ts
{
  selectedNodeId: string | null        // 当前选中的节点
  setSelectedNodeId: (id) => void
  graphNodes: GraphNode[]              // 全部节点（初始从mock导入，运行时可变）
  graphEdges: GraphEdge[]              // 全部边（初始从mock导入，运行时可变）
  addExerciseBank: (title, description) => void  // 新建习题库节点+CONTAINS边到根
}
```

### workspaceStore.ts
```ts
{
  tabs: WorkspaceTab[]                 // [{ key, label, type: 'graph'|'editor'|'exercise', nodeId? }]
  activeKey: string
  openTab: (tab) => void               // 打开或切换到指定tab
  closeTab: (key) => void              // 关闭tab并自动切换到相邻tab
  setActiveKey: (key) => void
}
```

---

## 四、路由表

```
/                                    → LoginPage
/login                               → LoginPage
/register                            → RegisterPage
/forgot-password                     → ForgotPasswordPage

/teacher (TeacherLayout)
  /dashboard                         → TeacherDashboard
  /courses/new                       → TeacherCreateCourse
  /courses/:courseId/graph           → TeacherGraph
  /courses/:courseId/graph/versions  → TeacherHistory
  /courses/:courseId/materials       → TeacherMaterials
  /courses/:courseId/exercises       → TeacherExercises
  /courses/:courseId/exercises/:bankId → TeacherExercisesDetail  ← 必须在 exercises 之前
  /courses/:courseId/review          → TeacherReview
  /courses/:courseId/enrollments     → TeacherEnrollments
  /courses/:courseId/issues          → TeacherIssues
  /courses/:courseId/info            → TeacherInfo
  /courses/:courseId/diff/:prId      → TeacherDiff
  /courses/:courseId/analytics       → TeacherDashboard
  /review                            → TeacherReview

/student (StudentLayout)
  /dashboard                         → StudentDashboard
  /courses/:courseId/graph           → StudentGraph
  /courses/:courseId/graph/versions  → TeacherHistory (复用)
  /courses/:courseId/materials       → TeacherMaterials (复用)
  /courses/:courseId/exercises       → StudentExercises
  /courses/:courseId/exercises/:bankId → StudentExercisesDetail  ← 必须在 exercises 之前
  /courses/:courseId/my-graphs/:versionKey → StudentGraphEditor
  /courses/:courseId/my-graphs       → StudentMyGraphs
  /courses/:courseId/my-pr           → StudentMyPR
  /courses/:courseId/pr/:prId        → StudentPR
  /courses/:courseId/issues          → StudentIssues
  /courses/:courseId/contributions   → StudentContributions
  /courses/:courseId/info            → StudentInfo
  /courses/:courseId/diff/:prId      → StudentDiff
  /private-graph/:graphId            → StudentPrivateGraph
  /pr/:prId                          → StudentPR
```

---

## 五、布局体系

```
┌─ Header (64px) ──────────────────────────────────────────┐
│ ☰ KG-Class [课程下拉]    [+] [🔔] [头像]                  │
├─ Toolbar ─┬─ FileTree(可拖拽) ─┬─── 工作区(Outlet) ──────┤
│  图谱      │  📁 数据结构        │  [图谱] [栈] [×]        │
│  资料      │    📁 线性表        │  ┌──────────────────┐   │
│  习题库    │    📁 栈与队列      │  │  GraphCanvas     │   │
│  历史      │      📄 栈.md       │  │  (Canvas 2D)     │   │
│  审核      │      📄 队列.md     │  └──────────────────┘   │
│  成员      │      📋 栈基础练习   │  ┌──────────────────┐   │
│  Issue     │    📁 树与二叉树    │  │  NoteDetailPanel │   │
│  信息      │    ...              │  │  (320px)         │   │
│           │                    │  └──────────────────┘   │
│ 48px      │  280px(拖拽200-480)  │                        │
└───────────┴─────────────────────┴────────────────────────┘
```

- **Toolbar**：`isCoursePage` 为 true 时显示。课程子路径以白名单 + 前缀匹配判定（支持 `exercises/:bankId`）
- **FileTree**：仅 `isGraphPage` (courseSubPath === 'graph') 时显示，含可拖拽分隔线
- **isGraphPage** 时内容区 padding: 0；否则 padding: 24, maxWidth: 1280 居中

### 关键布尔值
```ts
// TeacherLayout.tsx
const coursePaths = ['graph', 'graph/versions', 'materials', 'exercises', 'analytics', 'enrollments', 'review', 'issues', 'info', 'diff']
const isCoursePage = !!urlCourseId && (
  coursePaths.includes(courseSubPath) ||
  courseSubPath?.startsWith('exercises/')
)
const isGraphPage = courseSubPath === 'graph'

// StudentLayout.tsx（同理）
```

---

## 六、图谱引擎（自研 d3-force + Canvas 2D）

### 物理层
```ts
forceSimulation(nodes)
  .force('link', forceLink().distance(80).strength(0.5))
  .force('charge', forceManyBody().strength(-120))
  .force('center', forceCenter(cw/2, ch/2).strength(0.8))
  .force('collide', forceCollide(r+4).strength(0.8))
```

### SimNode 结构
```ts
{ id, x, y, vx, vy, title, degree, size, fill, isTag }
```

### 节点视觉规则
- 大小：`6 + (degree/maxDegree) * 12`
- 灰度：`rgb(g,g,g)`, g = `220 - ratio * 140`
- Hover：选中节点+邻居变紫色(#956BF5)并显示label，非邻居 opacity 0.25
- 选中：紫色填充+边框+label

### d3-force 边变异问题（重要）
`forceLink` 会原地修改边数组，将 `source`/`target` 从字符串变成节点对象。读取边数据需兼容两种类型。

### 数据来源（重要变更）
~~旧：GraphCanvas / TreeNodeList / NoteDetailPanel 直接 `import { mockGraphNodes, mockGraphEdges } from '../../api/mock/graph'`~~
**新：三个组件均从 `useGraphStore(s => s.graphNodes / s.graphEdges)` 读取数据。**
`degreeMap` 和 `maxDegree` 从模块级常量改为组件内 `useMemo`（依赖 graphNodes + graphEdges）。

---

## 七、Mock 数据（`api/mock/graph.ts`）

### 节点体系（32+ 节点）
| 标签 | 用途 | 示例 |
|------|------|------|
| `#subject` | 学科根 | 数据结构(n1) |
| `#chapter` | 章节 | 线性表(n2), 栈与队列(n3), ... |
| `#knowledge-point` | 知识点 | 数组(n7), 链表(n8), 栈(n9), ... |
| `#code-implementation` | 代码实现 | 链表实现栈(n18), ... |
| `#experiment` | 实验 | 链表操作实验(n21), ... |
| `#error-point` | 易错点 | 空指针异常(n23), ... |
| `#algorithm-case` | 算法案例 | 二叉搜索树(n12), AVL树(n13), ... |
| `#material` | 资料 | 栈与队列.pptx(m1), 链表操作详解.pdf(m2), ... |
| `#exercise-bank` | 习题库 | 栈基础练习(ex1), 链表算法训练(ex2), AVL树旋转专项(ex3) |

### 关系类型
| 关系 | 说明 | 线色 |
|------|------|------|
| CONTAINS | 树状图层级骨架 | #CECECE solid |
| PREREQUISITE | 前置依赖 | #D4A72C solid |
| CODE_IMPL | 代码实现 | #1A7F1A dashed |
| CONFUSE_WITH | 易混淆 | #CF222E dotted |
| OPTIMIZE_FROM | 优化演进 | #956BF5 dashed |
| HAS_ERROR | 易错点 | #CF222E dotted |
| MD_LINK | Markdown [[链接]] | #539BF5 dashed |

### MD_LINK 自动生成
`extractMarkdownLinkEdges()` 从节点 `data.content` 中解析 `[[习题库名称]]` 语法，自动生成边。目标节点必须存在于 `mockGraphNodes` 中（按 title 索引）。

### 重要变更
`mockGraphNodes` / `mockGraphEdges` 不再被组件直接使用。它们仅在 `graphStore.ts` 初始化时被拷贝一份。运行时修改通过 store 的 `addExerciseBank()` 方法。

---

## 八、习题库系统（已完成）

### 数据流

```
graphStore.graphNodes (源)
  → 筛选 tags.includes('#exercise-bank')
  → exercises/index.tsx 展开表格行
  → 新建时调用 graphStore.addExerciseBank(title, description)
  → 自动生成节点(ex+时间戳) + CONTAINS边(n1 → 新节点)
  → 文件树、图谱、习题列表三处同步更新
```

### 富数据合并
习题库的题型(type)、难度(difficulty)、题目(questions)、状态(status)等字段存储在 `mockExerciseBanks` 数组中（按 key 索引）。新建习题库无富数据，默认显示「通用 / 中等 / 草稿 / 0题」。两个习题页在 `useMemo` 中查询 `graphStore.graphNodes`，再按 ID 查找 `mockExerciseBanks` 获取富数据。

### 教师端（`pages/teacher/exercises/`）
- **index.tsx**：表格展示习题库（名称/题型/难度/题目数/挂载节点/状态）
  - 双击行 → `navigate(/exercises/:bankId)`
  - 单击行无操作（已移除弹窗编辑）
  - 「新建习题库」→ Modal（仅名称+说明）→ `addExerciseBank()` → 立即出现在列表和文件树
- **detail.tsx**：习题库详情（头部信息 + 题目表格 + 添加题目按钮占位）

### 学生端（`pages/student/exercises/`）
- **index.tsx**：只读浏览（无创建/删除/弹窗），双击跳转到做题页
- **detail.tsx**：做题界面
  - 选择题（栈基础练习）：`Card` + `Radio.Group`
  - 算法/代码题（链表/AVL）：表格展开行 + `Input.TextArea`
  - 「提交答案」→ 统计已答题数，提交后禁用输入

### 导航规则
- **图谱 Canvas 双击**习题库节点 → `navigate` 到 `exercises/:bankId`（不再打开 workspace tab）
- **文件树双击**习题库节点 → 同上
- 路径根据当前 URL 前缀 (`/teacher/` / `/student/`) 自动判断角色
- 非习题库节点双击保持不变（打开 editor tab）

### 工具栏
- 教师端和学生端 CourseToolbar 均含「习题库」按钮（`FormOutlined`），位于「资料」和「历史」之间
- 高亮匹配使用**最长前缀匹配**算法，确保 `exercises/ex1` 正确高亮习题库按钮，同时 `graph/versions` 不被 `graph` 抢匹配

---

## 九、TreeNodeList（文件树）细节

### 图标体系
统一使用 `@ant-design/icons`，按 `tagIconMap` 映射：

| 标签 | 图标 | 颜色 |
|------|------|------|
| `#subject` | FolderOpenOutlined | #956BF5 |
| `#chapter` | FolderOutlined | #7B52E0 |
| `#knowledge-point` | FileTextOutlined | #2C2C2C |
| `#code-implementation` | CodeOutlined | #1A7F1A |
| `#experiment` | ExperimentOutlined | #D4A72C |
| `#error-point` | BugOutlined | #CF222E |
| `#algorithm-case` | BulbOutlined | #D4A72C |
| `#material` | BookOutlined | #B8591A |
| `#exercise-bank` | FormOutlined | #3B82F6 |

### 图标渲染（重要）
Ant Design 6.x Tree 的 `icon` 属性在 `title` 为 ReactNode 时可能不渲染。当前方案是将图标放入 `renderTreeTitle` 返回的 `<div>` 内，同时 `renderNodes` 剥离 `icon` 属性避免 Tree 组件重复渲染。

### 布局
- 外层 div：`display: flex; width: 100%`
- 文字 span：`flex: 1; minWidth: 0; overflow: hidden; textOverflow: ellipsis`
- `...` 按钮：`flexShrink: 0`，靠右对齐（被文字 span 的 flex:1 推到右端）

---

## 十、关键设计决策与注意事项

1. **graphStore 是图谱数据的唯一真实来源**：所有组件通过 store 读取，不再直接 import 静态 mock。
2. **习题库是图谱节点**：不是独立实体。`addExerciseBank` 同时写入 `graphNodes` + `graphEdges`。
3. **MD_LINK 关系**：Markdown `[[链接]]` 自动生成边，不手写 `EXERCISE_FOR`。
4. **最长前缀匹配**（CourseToolbar 高亮）：`graph/versions` 不会被 `graph` 误匹配。
5. **路由顺序**：`exercises/:bankId` 必须在 `exercises` 之前，否则后者优先匹配。
6. **isContentPage**：控制工具栏显示，需同时支持 `exercises` 和 `exercises/xxx`。
7. **学生端 Diff 只读**：共用 `DiffContent`，通过回调决定是否展示解决按钮。
8. **无后端**：全部 Mock 数据，0 个 API 调用。
9. **d3-force 边变异**：读取 source/target 需兼容 string 和 object 两种类型。
10. **`private-graph/index.tsx`** 已废弃，新入口是 `my-graphs-editor`。
11. **Ant Design 6.x**：`MenuItemType` 从 `antd/es/menu/interface` 导入；`Form.getFieldsValue()` 不接受泛型参数。

---

## 十一、当前进度

### 已完成
- 登录体系（密码/短信/邮箱）
- 教师/学生布局壳 + Drawer 菜单 + CourseToolbar
- 自研图谱引擎（d3-force + Canvas 2D，~530行）
- 文件资源管理器（树状图 + 图标 + 搜索 + 拖拽 + 右键菜单 + 双击导航）
- 图谱设置面板（标签/附件/箭头/节点大小/力度参数调节）
- ★ 习题库系统（教师端管理 + 学生端做题）
- ★ 图谱与习题库双向同步（graphStore 统一数据源）
- ★ 工具栏前缀匹配高亮（支持 exercies/:bankId 子路由）
- ★ 节点图标体系（9种标签对应 @ant-design/icons）
- 审核工作台、成员管理、Diff对比、提交历史、新建课程等（占位）

### 待开发
| 模块 | 优先级 | 说明 |
|------|--------|------|
| MD 编辑器（ByteMD） | 高 | 替换 workspace editor tab 占位文字 |
| 图谱内新建节点 | 高 | TreeNodeList 右键菜单"新建节点"占位 |
| 课程广场 | 中 | student/courses-browse/ 空目录 |
| 学情分析 | 低 | teacher/analytics/ 空目录 |
| 后端搭建 | 高 | FastAPI + MySQL + Neo4j + Milvus |
| Mock → API 迁移 | 高 | 逐步替换 mock 为真实接口 |

---

## 十二、已知坑点

1. **`npm run build` 有 20+ 预存 TS 错误**：大部分是 `TS6133`（未使用变量），少量 `TS2345`（类型不匹配）。均来自既有代码，非当前工作引入。
2. **`private-graph/index.tsx`** 是旧版，已废弃。清理时注意路由。
3. **`SidebarContext.tsx`** 未使用，可删除。
4. **`authStore.ts`** 空文件但已被其他文件 import——不要删除。
5. **`showTags` 开关**：关闭时从 allNodesRef 重新过滤节点并重启模拟。
6. **Ant Design 6 Tree**：`icon` 属性在 `title` 为 ReactNode 时可能不渲染，当前已改为在 title div 内渲染。
7. **CourseToolbar 高亮**：使用 `useMemo` + `startsWith` 前缀匹配，但有个坑——当 `courseId` 变化时需重新计算。当前 deps 为 `[buttons, courseId, location.pathname]`。
8. **TreeNodeList nodeMap 未使用**：已被 `buildTreeData` 内部的 nodeMap 取代，已清理。

---

## 十三、开发工作流

- 启动：`cd frontend && npm run dev`
- 构建（会报警告/错误，均为预存）：`npm run build`
- 教师端：`/teacher/courses/course-1/graph`
- 学生端：`/student/courses/course-1/graph`
- 教师习题库：`/teacher/courses/course-1/exercises`
- 学生做题：`/student/courses/course-1/exercises`
- 新增页面流程：创建 pages/xxx/index.tsx → router 注册 → layout 添加 isContentPage 白名单 → CourseToolbar 添加按钮

---

## 十四、下一步

1. **教师端习题库详情页**添加真实题目编辑功能（增删改题面/选项/答案）
2. **学生端做题页**接入判题逻辑（目前仅占位提交）
3. 实现 MD 编辑器（ByteMD）替换 workspace editor tab
4. 图谱内右键"新建节点"功能
5. 考虑将 mockExerciseBanks 富数据也纳入 graphStore，实现完全统一的数据管理
