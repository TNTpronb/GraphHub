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
| 状态管理 | Zustand |
| 路由 | React Router v7 (`react-router-dom@7.x`) |
| 图谱渲染 | **自研**：d3-force + Canvas 2D（放弃 AntV G6） |
| 力学模拟 | `d3-force` |

### 弃用 G6 的原因（重要）

G6 v5.1.1 的 `hover-activate` behavior 与 `drag-element-force` behavior 共享内部 pointer 事件管线，两者互斥导致"节点粘鼠标"bug。官方文档从未将两者放在同一示例中。尝试过暂停/恢复 behavior、手动事件管理等方案均不稳定，最终改为自研 Canvas 2D 渲染引擎。

---

## 二、完整目录结构

```
frontend/src/
├── api/mock/              ← Mock 数据（前后端分离前使用）
│   ├── dashboard.ts       ← 仪表盘/审核/PR/课程/申请/邀请码/浏览课程 Mock
│   └── graph.ts           ← 图谱节点+边 Mock 数据（32节点，7种关系）
│
├── components/
│   ├── common/            ← [空] 通用小组件预留
│   ├── graph/
│   │   ├── GraphCanvas.tsx    ← ★ 核心自研图谱引擎（d3-force + Canvas 2D）
│   │   ├── NoteDetailPanel.tsx← 节点详情面板（标题/标签/关系/MD占位）
│   │   └── TreeNodeList.tsx   ← ★ 文件资源管理器（树状图）
│   ├── layout/
│   │   ├── CourseToolbar.tsx   ← ★ Obsidian风格窄工具栏（48px）
│   │   ├── sidebarConfig.ts   ← 教师/学生端菜单项配置
│   │   ├── StudentLayout.tsx  ← 学生布局壳（汉堡Drawer + 工具栏 + 侧边栏 + Outlet）
│   │   └── TeacherLayout.tsx  ← 教师布局壳（同上）
│   ├── markdown/          ← [空] MD编辑器预留（计划 ByteMD）
│   └── pr/
│       ├── ConflictPanel.tsx  ← 冲突解决面板（Reuse在Rebase/PR提交中）
│       └── DiffContent.tsx    ← ★ Git风格Diff视图核心组件（文件列表+hunk+图谱摘要）
│
├── contexts/
│   └── SidebarContext.tsx  ← [未使用] 侧边栏内容上下文（可能被废弃）
│
├── pages/
│   ├── login/index.tsx          ← 三种登录模式（密码/短信/邮箱）+ 角色下拉
│   ├── register/index.tsx       ← 注册页（手机号必填+邮箱可选）
│   ├── forgot-password/index.tsx← 忘记密码两步流程
│   │
│   ├── teacher/
│   │   ├── analytics/       ← [空] 学情分析（V2.0）
│   │   ├── create-course/index.tsx  ← 新建课程三步向导
│   │   ├── dashboard/index.tsx      ← 教师首页（待审核卡片+课程列表）
│   │   ├── diff/index.tsx           ← 教师端Diff对比页（含冲突解决+通过按钮）
│   │   ├── enrollments/index.tsx    ← 成员管理（现有成员/加入申请/邀请码）
│   │   ├── exercises/       ← [空] 习题库
│   │   ├── graph/
│   │   │   ├── index.tsx    ← 图谱管理页（工作区Tab）
│   │   │   └── versions/index.tsx ← ★ 提交历史页（时间轴+Diff+教师回滚）
│   │   ├── history/         ← [空] 
│   │   ├── info/index.tsx   ← 课程信息统计卡片
│   │   ├── issues/index.tsx ← Issue列表（类型筛选）
│   │   ├── materials/index.tsx ← ★ 资料管理页（紧凑列表+筛选+双击跳图谱）
│   │   ├── review/
│   │   │   ├── index.tsx    ← 全局审核工作台（简化Git风）
│   │   │   └── course-review.tsx ← 课程内审核（仅显示本课程PR）
│   │   └── settings/        ← [空]
│   │
│   └── student/
│       ├── contributions/index.tsx     ← 贡献页（积分+热力图+记录列表）
│       ├── courses-browse/    ← [空] 课程广场
│       ├── dashboard/index.tsx         ← 学生首页（课程+PR+贡献+邀请码）
│       ├── diff/index.tsx             ← 学生端Diff对比页（只读）
│       ├── exercises/         ← [空]
│       ├── graph/index.tsx            ← 学生图谱浏览（工作区Tab+Fork按钮）
│       ├── info/index.tsx             ← 学生端课程信息
│       ├── issues/index.tsx           ← 学生端Issue
│       ├── my-graphs/index.tsx        ← ★ 我的图谱版本管理列表
│       ├── my-graphs-editor/index.tsx ← ★ 私人图谱编辑页（Pull+冲突+保存+AI审查+提交PR）
│       ├── my-pr/index.tsx            ← 我的提交列表（对比入口）
│       ├── pr/index.tsx               ← ★ 学生PR详情页（查看已有/新建PR双变体+DiffContent）
│       ├── private-graph/index.tsx    ← 旧私人图谱编辑器（待移除）
│       └── settings/         ← [空]
│
├── router/index.tsx         ← ★ 全部路由定义（createBrowserRouter）
├── stores/
│   ├── authStore.ts         ← [空] 认证状态预留
│   ├── graphStore.ts        ← 图谱选中节点（selectedNodeId + setSelectedNodeId）
│   └── workspaceStore.ts    ← ★ 工作区标签页管理（tabs/open/close/activeKey）
├── styles/
│   ├── variables.css        ← CSS变量（颜色/字体/间距体系）
│   └── reset.css            ← 浏览器默认样式重置
├── theme/
│   ├── tokens.ts            ← AntD 6 Design Token覆盖（主色#956BF5, 链接#539BF5）
│   └── ThemeProvider.tsx    ← ConfigProvider包裹器
├── types/index.ts           ← [空]
├── App.tsx                  ← 根组件（ThemeProvider → SidebarProvider → RouterProvider）
└── main.tsx                 ← 入口（引入variables.css + reset.css + render App）
```

---

## 三、核心技术架构

### 3.1 布局体系

```
┌─ Header (60px) ──────────────────────────────────────────┐
│ ☰ KG-Class [课程下拉]    [🔍+📤...按钮] [通知] [头像]    │
├─ Toolbar ─┬─ FileTree(Sidebar) ─┬─── 工作区(Outlet) ────┤
│  图谱      │                    │  [图谱] [栈.md] [×]     │
│  历史      │  📁 数据结构        │  ┌──────────────────┐  │
│  资料      │    📁 线性表        │  │  GraphCanvas     │  │
│  审核      │    📁 栈与队列      │  │  (Canvas 2D)     │  │
│  成员      │    📁 树与二叉树    │  └──────────────────┘  │
│  Issue     │    📁 图            │                        │
│  信息      │    📁 排序算法      │                       │
│           │    📄 栈与队列.pptx  │                       │
│ 48px      │  280px(可拖拽)       │                        │
└───────────┴─────────────────────┴────────────────────────┘
```

- **工具栏**：所有课程页面显示，非课程页不显示
- **文件管理器侧边栏**：仅图谱编辑页面显示（`isGraphPage` 判断）
- **工作区标签页**：图谱页默认一个"图谱"标签，双击节点/资料打开编辑器标签

### 3.2 核心组件关系

```
DiffContent (共享) ──→ TeacherDiff, StudentDiff, StudentPR(查看已有PR), GraphHistory
GraphCanvas (共享) ──→ TeacherGraph, StudentGraph, PrivateGraphEditor, MyGraphsEditor
TreeNodeList (共享) ──→ TeacherLayout, StudentLayout 内嵌
CourseToolbar (共享) ──→ TeacherLayout, StudentLayout 内嵌
ConflictPanel (共享) ──→ PrivateGraphEditor(Rebase), StudentPR(新建PR)
```

### 3.3 Zustand Store 结构

```ts
// graphStore — 图谱节点选中（双向联动树⇄图）
{ selectedNodeId: string | null, setSelectedNodeId }

// workspaceStore — 工作区标签页
{
  tabs: [{ key, label, type: 'graph'|'editor'|'exercise', nodeId? }],
  activeKey: string,
  openTab(tab), closeTab(key), setActiveKey(key)
}
```

---

## 四、图谱引擎核心原理（自研）

### 4.1 物理层

```ts
forceSimulation(nodes)
  .force('link', forceLink().distance(80).strength(0.5))
  .force('charge', forceManyBody().strength(-120))    // 斥力
  .force('center', forceCenter(cw/2, ch/2).strength(0.8)) // 向心力
  .force('collide', forceCollide(r+4).strength(0.8))
  .alpha(0.5).alphaMin(0.001).alphaDecay(0.02)
```

### 4.2 节点视觉规则

- **大小**：`6 + (degree/maxDegree) * 12`（度数越大节点越大）
- **灰度**：默认无边框、无label；颜色 `rgb(g,g,g)`，g = `220 - ratio * 140`（度数越大越深）
- **Hover**：节点+邻居变紫色(#956BF5)并显示label，非邻居 opacity 0.25 变暗（75%可见）
- **选中**：紫色填充+边框+label

### 4.3 交互实现

| 功能 | 实现方式 |
|------|---------|
| 缩放平移 | `pointerdown/move/up` + `wheel` 事件手动处理 |
| 节点拖拽 | `pointerdown` 命中节点 → 设置 draggingRef → pointermove 同步位移 → sim.alpha(0.3).restart() |
| Hover 激活 | `pointermove` → hitTest → 更新 hoveredRef → render() 重绘 |
| 点击选中 | pointerup 且位移<3px → 视为 click → 更新 selectedRef + graphStore |
| 渐变动画 | requestAnimationFrame 插值 dimOpacityRef + highlightAlphaRef |

### 4.4 d3-force 边变异问题（重要）

`forceLink` 会**原地修改**边数组，将 `source`/`target` 从字符串变成节点对象。所有读取边数据处都要兼容：`typeof e.source === 'string' ? e.source : e.source.id`

---

## 五、图谱设置面板参数

| 维度 | 参数 | 范围 | 默认 |
|------|------|------|------|
| 筛选 | 标签(showTags) | 开关 | ON |
| | 附件(showAttachments) | 开关 | ON |
| 外观 | 箭头(showArrows) | 开关 | OFF |
| | 节点大小(nodeSizeMult) | 30-200% | 100% |
| | 连线粗细(edgeWidth) | 20-200% | 100% |
| 力度 | 向心力(centerForce) | 0-10 | 0.5 |
| | 排斥力(repulsionForce) | 0-100 | 40 |
| | 吸引力(attractionForce) | 0-100 | 50 |
| | 连线长度(linkDistance) | 20-300px | 80 |

力度变化触发 `restartSim()` 重建力模拟。showTags 变化触发完整节点过滤 + 力模拟重启（从 `allNodesRef` 原始列表重新过滤）。

---

## 六、Mock 数据要点

### 6.1 图谱数据（`api/mock/graph.ts`）

- 32 个节点（n1-n26 + m1-m6），7 种标签（#subject #chapter #knowledge-point #code-implementation #experiment #error-point #algorithm-case #material）
- 6 种关系类型：CONTAINS PREREQUISITE CODE_IMPL CONFUSE_WITH OPTIMIZE_FROM HAS_ERROR
- CONTAINS 是树状图的层级骨架
- 资料节点(m1-m6)挂载在学科根(n1)下，与章节同级

### 6.2 仪表盘数据（`api/mock/dashboard.ts`）

- mockPendingReviews, mockCourses, mockStudentCourses, mockStudentPRs, mockStudentStats
- mockPRItems, mockEnrollmentRequests, mockInviteCodes, mockMembers
- mockBrowseCourses

---

## 七、关键设计决策与注意事项

1. **审核流程简化**：AI 在学生提交时自动评分（作为参考信息展示），教师一次审核通过/打回。无小组长二审。
2. **关系是 Markdown [[链接]]**：不单独存为实体，修改关系 = 修改 MD 内容 = content 冲突。
3. **无分支功能**：Fork → 编辑 → Pull → PR → 审核，线性协作覆盖所有场景。
4. **AntD 6 兼容**：`MenuItemType` 从 `antd/es/menu/interface` 导入（顶层不再导出）。
5. **React Router v7**：`createBrowserRouter` 路由按声明顺序匹配，`my-graphs/:versionKey` 必须在 `my-graphs` 前面。
6. **WorkplaceStore**：图谱页和私人图谱编辑页共享全局 tabs 状态。新页面挂载时需 `useWorkspaceStore.setState()` 重置。
7. **`isContentPage` 是布局的关键布尔值**：控制工具栏、文件管理器侧边栏、内容区内边距三者的显示逻辑。
8. **`isGraphPage`**：控制文件管理器侧边栏 + 0 padding 布局。
9. **学生端 Diff 只读**：`StudentDiff` 和教师端共用 `DiffContent` 组件，通过 `conflictFooter` 回调决定是否展示解决按钮。
10. **路由中的教师信息页曾404**：原因是路由器漏写了 `courses/:courseId/info` 路由。

---

## 八、当前进度

### ✅ 已完成

- 登录体系（密码/短信/邮箱）
- 教师/学生布局壳 + 汉堡菜单 Drawer + 工具栏
- 自研图谱引擎（d3-force + Canvas 2D）
- 图谱页（教师/学生+私人）+ 设置面板
- 文件资源管理器（树状图 + 搜索 + 拖拽）
- 审核工作台（全局/课程级）+ AI评分展示
- 成员管理（现有成员/申请/邀请码）
- 对比页（DiffContent共用）
- 提交历史（时间轴+Diff+教师回滚）
- 新建课程向导（三步）
- 私人图谱（版本管理+编辑+Pull+AI审查+提交PR）
- 学生PR详情页（查看/新建+冲突只读）
- 贡献页（热力图+积分+记录）
- 资料管理页（列表+筛选+双击跳图谱）
- 课程信息页、Issue页

### ❌ 未完成 / 待开发

| 模块 | 优先级 | 说明 |
|------|--------|------|
| MD 编辑器（ByteMD） | 高 | `components/markdown/` 空目录 |
| 习题库 | 高 | `teacher/exercises/` 空目录，计划"习题库"作为图谱节点 |
| 课程广场 | 中 | `student/courses-browse/` 空目录 |
| 学情分析 | 低 | `teacher/analytics/` 空目录 |
| 设置页 | 低 | 多个空目录 |
| authStore | 中 | 空文件 |
| 后端对接 | 高 | 全量 mock 数据，0 个 API 调用 |

---

## 十一、当前正在进行的工作

**上次对话最后在做的事**：用户想将习题库以节点形式加入图谱（一个习题库 = 一个图谱节点，内含多道同类题），正在测试代码可行性。代码片段见 `docs/dev-guide.md` 第17步。

**待确认**：习题库管理页是否需要接入工具栏、路由、图谱 mock 数据。用户原话是"不要思考，不要改代码，直接返回收到"——说明还在测试阶段，尚未决定。

## 十二、已知 Bug / 坑点

1. **`private-graph/index.tsx`** 是旧版私人图谱编辑器，已废弃。新入口是 `my-graphs`（管理列表）+ `my-graphs-editor`（编辑页）。两个页面功能有重叠，清理时注意路由。
2. **`SidebarContext.tsx`** 未使用，可考虑删除。
3. **`authStore.ts`** 空文件，但已被 `graphStore.ts` 和 `workspaceStore.ts` 引用——不要删除，否则 import 报错。
4. **学生端工具栏神秘消失问题**：出现过一次，加了 `|| true` 临时补丁后发现是缓存问题，已还原。如果再次出现，Ctrl+Shift+R 硬刷新。
5. **图谱的 `showTags` 开关**：关闭时从 `allNodesRef` 重新过滤并重启模拟，切换回时也可能触发布局重算。此逻辑在 `GraphCanvas.tsx` 最后的 `useEffect` 中。
6. **`DiffContent` 高度问题**：默认 `calc(100vh - 48px - 120px)`，嵌入学生 PR 页时需要外层 `div` 控制高度，否则会把页面撑爆。

## 十三、包依赖版本

```json
{
  "react": "^19.2.7",
  "react-dom": "^19.2.7",
  "react-router-dom": "^7.18.1",
  "antd": "^6.5.1",
  "@ant-design/icons": "^6.3.2",
  "zustand": "^5.0.14",
  "d3-force": "^3.x",
  "axios": "^1.18.1",
  "@tanstack/react-query": "^5.101.2"
}
```

**注意**：AntD 6.x 变化较大，`MenuItemType` 从 `antd/es/menu/interface` 导入，`Tree` 组件 API 可能有变化。

## 十四、教程文档 vs 实际代码

`docs/dev-guide.md` 是早期编写，包含 25 步教程。实际代码已大幅偏离：

| 差异点 | 教程 | 实际 |
|--------|------|------|
| 布局 | 240px 固定侧边栏 | 汉堡菜单 Drawer + 工具栏 + 文件管理器 |
| 图谱 | AntV G6 | 自研 d3-force + Canvas 2D |
| 审核 | 三级审核 | 一次人工审核 |
| 登录 | 单页面 | 三种模式+注册+忘密 |
| 节点类型 | 6 种独立标签 | 统一 Note + tags 分类 |

**不要参考教程写代码**，教程仅用于理解原始设计思路。实际实现以 `session-snapshot.md` 为准。

## 十五、最复杂的文件（改动时需格外小心）

| 文件 | 行数 | 原因 |
|------|------|------|
| `GraphCanvas.tsx` | ~520 | 自研引擎全量逻辑（物理+渲染+交互+动画+设置面板） |
| `TreeNodeList.tsx` | ~350 | 树构建+搜索+拖拽+右键菜单+资料集成 |
| `TeacherLayout.tsx` | ~200 | 布局状态机（isCoursePage/isGraphPage/selectedKey） |
| `StudentLayout.tsx` | ~150 | 同上 |
| `DiffContent.tsx` | ~150 | 共享 Diff 组件（被4个页面复用） |
| `router/index.tsx` | ~100 | 全部路由定义 |

## 十六、开发工作流速查

- 启动：`cd frontend && npm run dev`
- 访问教师端：`/teacher/courses/course-1/graph`
- 访问学生端：`/student/courses/course-1/graph`
- Mock 数据在 `api/mock/`，0 个 API 调用
- 新页面流程：创建 `pages/xxx/index.tsx` → `router/index.tsx` 注册 → `TeacherLayout/StudentLayout` 添加路径白名单 → 添加到工具栏按钮数组

1. **接入 MD 编辑器（ByteMD）**：替换所有 editor 类型标签页中的占位文字
2. **实现习题库**：按用户想法，习题库作为图谱节点（`#exercise-bank` 标签），内含多道同类题
3. **课程广场**：浏览+申请加入课程流程
4. **后端开始搭建**：FastAPI + MySQL + Neo4j + Milvus
5. **Mock → API 迁移**：逐步替换 api/mock 为真实接口调用

---

## 十、文档索引

| 文档 | 路径 | 说明 |
|------|------|------|
| 项目设计书 | `documents/班级共建式知识图谱教学系统 项目设计书.docx` | 原始需求 |
| SRS | `documents/班级共建式知识图谱教学系统 软件需求规格说明书.docx` | 需求规格 |
| ER 图 | `docs/er-diagram.md` | 数据库设计（MySQL + Neo4j） |
| 前端路由与组件树 | `docs/frontend-routes-components.md` | 路由 + 组件设计 |
| Figma 原型清单 | `docs/figma-page-checklist.md` | 19 个页面清单 |
| 开发指南 | `docs/dev-guide.md` | 新手教程（25步） |
| 会话快照 | `docs/session-snapshot.md` | 本文 |
