# KG-Class 完整会话快照

> **用途**：新会话开局读取此文件，即可完整继承项目上下文。
> **更新规则**：每次重大功能迭代后更新本文。
> **最后更新**：2026-07-24

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
│   │   ├── exercises/     ← ★ 习题库管理
│   │   │   ├── index.tsx      ← 习题库列表（新建含重做次数+AI判题开关）
│   │   │   ├── detail.tsx     ← 习题库详情（题目CRUD + AI录入/生题 + 做题情况入口）
│   │   │   └── review/        ← ★ 做题情况审查页（学生提交状态 + 批改入口）
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
│       ├── exercises/     ← ★ 学生习题
│       │   ├── index.tsx      ← 习题库浏览（只读）
│       │   └── detail.tsx     ← ★ 做题界面（判题 + 重做限制 + 空题提示Modal）
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
│   ├── graphStore.ts      ← ★ 图谱节点/边数据 + selectedNodeId + addExerciseBank(title, description, retryLimit?, aiGradingEnabled?)
│   ├── workspaceStore.ts  ← ★ 工作区标签页（tabs/open/close/activeKey）
│   └── authStore.ts       ← [空]
├── styles/                ← CSS变量 + reset
│   ├── reset.css
│   └── variables.css      ← 主题CSS变量（--color-success, --color-danger等）
├── theme/                 ← Ant Design 主题（主色#956BF5）
│   ├── ThemeProvider.tsx
│   └── tokens.ts
└── types/index.ts         ← [空]
```

---

## 三、Zustand Store 结构（核心）

### graphStore.ts
```ts
{
  selectedNodeId: string | null
  setSelectedNodeId: (id) => void
  graphNodes: GraphNode[]              // 全部节点（初始从mock导入，运行时可变）
  graphEdges: GraphEdge[]              // 全部边（初始从mock导入，运行时可变）
  addExerciseBank: (title, description, retryLimit?, aiGradingEnabled?) => void
  // 新建习题库节点+CONTAINS边到根，retryLimit默认0（不限），aiGradingEnabled默认true
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
  /courses/:courseId/exercises/:bankId/review → TeacherExercisesReview  ← 新增
  /courses/:courseId/exercises/:bankId → TeacherExercisesDetail  ← 必须在 exercises 之前
  /courses/:courseId/exercises       → TeacherExercises
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
  /courses/:courseId/exercises/:bankId → StudentExercisesDetail  ← 必须在 exercises 之前
  /courses/:courseId/exercises       → StudentExercises
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
├─ Toolbar ┬─ FileTree(可拖拽) ─┬─── 工作区(Outlet) ──────┤
│  图谱    │  📁 数据结构        │  [图谱] [栈] [×]        │
│  资料    │    📁 线性表        │  ┌──────────────────┐   │
│  习题库  │    📁 栈与队列      │  │  GraphCanvas     │   │
│  历史    │      📄 栈.md       │  │  (Canvas 2D)     │   │
│  审核    │      📄 队列.md     │  └──────────────────┘   │
│  做题情况│      📋 栈基础练习   │  ┌──────────────────┐   │
│  成员    │    📁 树与二叉树    │  │  NoteDetailPanel │   │
│  Issue   │    ...              │  │  (320px)         │   │
│  信息    │                    │  └──────────────────┘   │
│          │                    │                          │
│ 48px     │  280px(拖拽200-480) │                          │
└──────────┴─────────────────────┴──────────────────────────┘
```

- **Toolbar**：`isCoursePage` 为 true 时显示。课程子路径以白名单 + 前缀匹配判定（支持 `exercises/:bankId` 和 `exercises/:bankId/review`）
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

## 八、习题库系统（完整实现）

### 数据流

```
graphStore.graphNodes (源)
  → 筛选 tags.includes('#exercise-bank')
  → exercises/index.tsx 展开表格行
  → 新建时调用 graphStore.addExerciseBank(title, description, retryLimit, aiGradingEnabled)
  → 自动生成节点(ex+时间戳) + CONTAINS边(n1 → 新节点)
  → 节点 data 中持久化 retryLimit 和 aiGradingEnabled
  → 文件树、图谱、习题列表三处同步更新
```

### 教师端（`pages/teacher/exercises/`）
- **index.tsx**：表格展示习题库（名称/题型/难度/题目数/挂载节点/状态/重做次数/AI判题）
  - 双击行 → `navigate(/exercises/:bankId)`
  - 「新建习题库」→ Modal（名称+说明+重做次数下拉+AI判题开关）→ `addExerciseBank()` → 立即出现在列表和文件树
- **detail.tsx**：习题库详情（头部信息 + 题目表格 + 添加/编辑/删除题目 + AI录入/生题）
  - 顶部「做题情况」按钮 → 跳转到 review 页
- **review/index.tsx**：★ 做题情况审查页
  - 统计卡片：未作答 / 待批改 / 已批改 人数
  - 表格：学生姓名、状态、得分、提交时间、批改时间
  - 操作列：
    - **未作答**：灰色文字，无法操作
    - **待批改**：「批改」按钮，点击进入批改界面（占位）
    - **已批改**：「查看」按钮，点击查看批改结果（占位）

### 学生端（`pages/student/exercises/`）
- **index.tsx**：只读浏览（无创建/删除/弹窗），双击跳转到做题页
- **detail.tsx**：★ 做题界面（完整判题逻辑）
  - **提交前**：只显示题面和选项/输入框，不显示答案、不显示解析
  - **统一提交**：顶部「提交答案」按钮，点击后校验是否有未做题
    - 有未做题 → 弹出 Modal，列出题号按钮，点击平滑滚动到对应题目；Modal 提供「强制提交」选项
    - 全部完成 → 进入判题状态
  - **判题结果**：
    - 每题右侧显示 `CheckOutlined`（绿）/ `CloseOutlined`（红）
    - 选择题：正确答案绿色高亮，错误选择红色高亮
    - 下方展示解析
  - **重做机制**：
    - 提交后顶部「提交答案」按钮替换为「重新作答」按钮
    - 按钮下方小字提示剩余次数：「不限次数」「还可作答 N 次」「已达上限」
    - 达到上限后按钮禁用
    - 点击「重新作答」清空答案并允许重新答题，累计重做次数
  - **开放题**（算法/代码题）：提交后显示参考答案和解析，学生自评
  - **顶部汇总**：提交后显示统计卡片（已完成/正确/正确率）

### 判题分流逻辑
- **自动判题**（系统直接录入成绩）：
  - 习题库启用 AI 判题（`aiGradingEnabled: true`）
  - 或习题库全部为选择题（无主观题）
- **人工批改**（学生提交后进入「待批改」状态，推送到教师端做题情况审查表）：
  - 存在主观题且未启用 AI 判题

### 导航规则
- **图谱 Canvas 双击**习题库节点 → `navigate` 到 `exercises/:bankId`（不再打开 workspace tab）
- **文件树双击**习题库节点 → 同上
- 路径根据当前 URL 前缀 (`/teacher/` / `/student/`) 自动判断角色
- 非习题库节点双击保持不变（打开 editor tab）

### 工具栏
- 教师端 CourseToolbar 新增「做题情况」按钮（`AuditOutlined`），位于「习题库」和「学情分析」之间
- 学生端 CourseToolbar 不变
- 高亮匹配使用**最长前缀匹配**算法

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
2. **习题库是图谱节点**：不是独立实体。`addExerciseBank` 同时写入 `graphNodes` + `graphEdges`，并将 `retryLimit` 和 `aiGradingEnabled` 持久化到节点 `data`。
3. **MD_LINK 关系**：Markdown `[[链接]]` 自动生成边，不手写 `EXERCISE_FOR`。
4. **最长前缀匹配**（CourseToolbar 高亮）：`graph/versions` 不会被 `graph` 误匹配。
5. **路由顺序**：`exercises/:bankId` 必须在 `exercises` 之前，否则后者优先匹配。
6. **isContentPage**：控制工具栏显示，需同时支持 `exercises` 和 `exercises/xxx`。
7. **学生端 Diff 只读**：共用 `DiffContent`，通过回调决定是否展示解决按钮。
8. **无后端**：全部 Mock 数据，0 个 API 调用。
9. **d3-force 边变异**：读取 source/target 需兼容 string 和 object 两种类型。
10. **`private-graph/index.tsx`** 已废弃，新入口是 `my-graphs-editor`。
11. **Ant Design 6.x**：`MenuItemType` 从 `antd/es/menu/interface` 导入；`Form.getFieldsValue()` 不接受泛型参数。
12. **学生做题答案隔离**：`ExerciseQuestion` 接口不含 `answer`/`explanation` 字段，答案存储在独立的 `answerKeys` 对象中，确保答题前答案内容不可能被渲染。
13. **重做次数限制**：`retryLimit: 0` 表示不限次数；正整数表示最多允许重做次数。学生端提交后显示剩余次数提示。
14. **AI 判题开关**：`aiGradingEnabled: true` 时系统自动判分；`false` 且存在主观题时，学生提交进入「待批改」状态，推送到教师端做题情况审查表。

---

## 十一、当前进度

### 已完成
- 登录体系（密码/短信/邮箱）
- 教师/学生布局壳 + Drawer 菜单 + CourseToolbar
- 自研图谱引擎（d3-force + Canvas 2D，~530行）
- 文件资源管理器（树状图 + 图标 + 搜索 + 拖拽 + 右键菜单 + 双击导航）
- 图谱设置面板（标签/附件/箭头/节点大小/力度参数调节）
- ★ 习题库系统（教师端管理 + 学生端做题 + 判题逻辑）
- ★ 学生端做题判题（统一提交 + 空题提示Modal + 对错图标 + 解析展示 + 重做限制）
- ★ 教师端习题库创建（重做次数下拉 + AI判题开关）
- ★ 做题情况审查页（学生提交状态 + 批改/查看入口）
- ★ 图谱与习题库双向同步（graphStore 统一数据源，节点data持久化retryLimit/aiGradingEnabled）
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
| 教师端批改界面 | 高 | review 页「批改」按钮的详细批改页面 |
| 学生端重做次数后端校验 | 中 | 当前仅前端校验，需后端限制 |

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
9. **学生端重做次数**：当前仅前端 `retryCount` 状态控制，未持久化。刷新页面后重做次数重置为 0，需后端支持或 localStorage 持久化。
10. **answerKeys 硬编码**：学生端 `answerKeys` 对象硬编码在 detail.tsx 中，实际项目应来自后端 API。

---

## 十三、开发工作流

- 启动：`cd frontend && npm run dev`
- 构建（会报警告/错误，均为预存）：`npm run build`
- 教师端：`/teacher/courses/course-1/graph`
- 学生端：`/student/courses/course-1/graph`
- 教师习题库：`/teacher/courses/course-1/exercises`
- 学生做题：`/student/courses/course-1/exercises`
- 教师做题情况：`/teacher/courses/course-1/exercises/:bankId/review`
- 新增页面流程：创建 pages/xxx/index.tsx → router 注册 → layout 添加 isContentPage 白名单 → CourseToolbar 添加按钮

---

## 十四、下一步

1. **教师端批改界面**：实现 review 页「批改」按钮的详细批改页面，支持逐题打分、评语
2. **学生端重做限制后端化**：将 retryCount 持久化到后端，防止前端绕过
3. **后端 API 迁移**：开始搭建 FastAPI + MySQL + Neo4j + Milvus，逐步替换 mock 数据
4. **MD 编辑器（ByteMD）**：替换 workspace editor tab 占位文字
5. **图谱内新建节点**：TreeNodeList 右键菜单"新建节点"功能
6. **answerKeys 后端化**：学生端答案和解析从后端 API 获取，不再硬编码
