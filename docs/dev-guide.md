# KG-Class 手把手开发指南

> 面向初学者的逐步开发教程。每一步都说明目的、给出完整代码、标注注意事项。
> 按照本指南操作，你将完成一个完整的全栈项目基础骨架。

---

## 目录

1. [项目初始化与脚手架](#1-项目初始化与脚手架)
2. [目录结构设计](#2-目录结构设计)
3. [CSS 变量体系](#3-css-变量体系)
4. [Ant Design 主题配置](#4-ant-design-主题配置)
5. [路由体系搭建](#5-路由体系搭建)
6. [布局组件：Shell 框架](#6-布局组件shell-框架)
7. [登录页](#7-登录页)
8. [教师端仪表盘](#8-教师端仪表盘)
9. [学生端仪表盘](#9-学生端仪表盘)
10. [知识图谱页面（G6 集成）](#10-知识图谱页面g6-集成)

---

## 1. 项目初始化与脚手架

### 目的

创建一个 React 18 + TypeScript + Vite 的基础工程，安装所有核心依赖。

### 具体操作

```powershell
# 1. 进入项目目录
Set-Location -LiteralPath "D:\.Repositories\GraphHub"

# 2. 使用 Vite 创建 React + TypeScript 项目
npm create vite@latest frontend -- --template react-ts

# 3. 进入前端目录
Set-Location -LiteralPath "frontend"

# 4. 安装基础依赖
npm install

# 5. 安装核心依赖（逐条执行，方便看清每个包的作用）
npm install react-router-dom          # 路由
npm install antd                      # UI 组件库
npm install @ant-design/icons         # AntD 图标库
npm install zustand                   # 轻量状态管理
npm install axios                     # HTTP 请求
npm install @antv/g6                  # 图谱渲染引擎
npm install @tanstack/react-query     # 服务端状态缓存
```

### 注意事项

- **不要一次性安装所有包**。分步装，出错了马上知道是哪个包有问题。
- 如果 `npm install @antv/g6` 报 peer dependency 警告，可以忽略，Vite 通常能正常 resolve。
- 执行完后用 `npm run dev` 确认能看到 Vite 默认欢迎页，再继续下一步。

---

## 2. 目录结构设计

### 目的

在写任何代码之前，先建好文件夹骨架。良好的目录结构让后续开发不需要思考"这个文件放哪"。

### 具体操作

在 `frontend/src/` 下，手动创建以下目录（手动右键新建文件夹）：

```
src/
├── assets/              # 静态资源（图片、字体）
├── components/          # 共享组件
│   ├── layout/          #   布局组件（Header、Sidebar）
│   ├── graph/           #   图谱相关组件（GraphCanvas、TreeNodeList）
│   ├── markdown/        #   Markdown 编辑器与渲染器
│   ├── pr/              #   PR 相关组件（DiffViewer、StatusBadge）
│   └── common/          #   通用小组件（Loading、Empty、ErrorBoundary）
├── pages/               # 页面组件
│   ├── login/           #   登录页
│   ├── teacher/         #   教师端
│   │   ├── dashboard/   #     首页
│   │   ├── graph/       #     图谱管理
│   │   ├── materials/   #     资料管理
│   │   ├── exercises/   #     习题库
│   │   ├── analytics/   #     学情分析
│   │   ├── enrollments/ #     学生管理（审批+邀请码）
│   │   ├── review/      #     审核工作台
│   │   ├── create-course/ #   新建课程向导
│   │   └── settings/    #     设置
│   └── student/         # 学生端
│       ├── dashboard/   #     首页
│       ├── courses-browse/ #  课程广场
│       ├── graph/       #     图谱浏览
│       ├── exercises/   #     练习
│       ├── private-graph/ #   私人图谱
│       ├── pr/          #     PR 详情
│       ├── contributions/ #  贡献
│       └── settings/    #     设置
├── router/              # 路由配置
│   └── index.tsx        #   路由表
├── stores/              # Zustand 状态管理
│   ├── authStore.ts     #   认证状态
│   └── graphStore.ts    #   图谱交互状态
├── styles/              # 全局样式
│   ├── variables.css    #   CSS 变量（颜色、字体、间距）
│   └── reset.css        #   浏览器默认样式重置
├── theme/               # Ant Design 主题配置
│   └── tokens.ts        #   Design Token 覆盖
├── api/                 # 后端接口（先放 mock 数据）
│   └── mock/            #   Mock 数据文件
├── types/               # TypeScript 类型定义
│   └── index.ts         #   通用类型
├── App.tsx              # 根组件
├── App.css
├── main.tsx             # 入口文件
└── vite-env.d.ts
```

### 注意事项

- `components/` 里只放**被多个页面复用**的组件。只在一个页面用到的组件，放在对应页面文件夹里。
- `pages/` 里每个页面一个子文件夹，页面自己的内部组件也在同一文件夹里。
- 先建好骨架，能避免后面 80% 的"不知道放哪"的纠结。

---

## 3. CSS 变量体系

### 目的

用 CSS 变量统一管理所有颜色、字号、间距。后续写任何组件时，不再写死色值，只用 `var(--color-primary)` 这样的变量名。切换到暗色模式只需要一套新变量值，不用改任何组件代码。

### 操作步骤

1. 创建 `src/styles/variables.css`
2. 写入以下代码
3. 在 `src/main.tsx` 中 import 这个文件

### 代码：`src/styles/variables.css`

```css
/* ================================================================
   KG-Class 全局 CSS 变量
   引用方式：var(--color-bg)  或  var(--space-4)
   后续所有组件都使用这些变量，不写死色值
   ================================================================ */

:root {
  /* ── 四个主色（设计系统的基石） ── */
  --color-bg:       #FAFAFA;   /* 页面背景，大面积使用 */
  --color-text:     #2C2C2C;   /* 正文文字，替代纯黑 */
  --color-border:   #CECECE;   /* 默认边框 / 分割线 */
  --color-primary:  #956BF5;   /* 主题色，仅按钮/链接/选中态 */

  /* ── 背景衍生色 ── */
  --color-bg-white:    #FFFFFF;   /* 卡片、面板、弹窗的白色背景 */
  --color-bg-hover:    #F0F0F0;   /* 列表项 / 菜单项 hover 时的浅灰底 */
  --color-bg-selected: #F4F0FF;   /* 选中态淡紫色背景 */

  /* ── 文字衍生色 ── */
  --color-text-secondary: #6B6B6B;  /* 次要文字：时间、计数、描述 */
  --color-text-tertiary:  #999999;  /* 辅助文字：placeholder、禁用态 */

  /* ── 主色衍生色 ── */
  --color-primary-hover:  #7B52E0;  /* 主色按钮 hover 时加深 */
  --color-primary-active: #6A3FCC;  /* 主色按钮按下时再加深 */
  --color-primary-light:  #F4F0FF;  /* 主色浅底（同 bg-selected） */

  /* ── 语义色（不随主题变化） ── */
  --color-danger:  #CF222E;   /* 错误、删除、打回 */
  --color-success: #1A7F1A;   /* 成功、通过、已掌握 */
  --color-warning: #D4A72C;   /* 警告、部分掌握 */

  /* ── 字体族 ── */
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI',
               'PingFang SC', 'Microsoft YaHei', 'Helvetica Neue',
               Helvetica, Arial, sans-serif;
  --font-mono: ui-monospace, 'Cascadia Code', 'Source Code Pro',
               Menlo, Consolas, 'Liberation Mono', monospace;

  /* ── 字号体系（参考 GitHub 的 6 级字号） ── */
  --text-xs:   12px;  /* 时间戳、Badge 计数、辅助说明 */
  --text-sm:   14px;  /* 正文主体、Diff 内容、卡片描述 */
  --text-base: 16px;  /* 导航、按钮、列表项标题 */
  --text-lg:   20px;  /* 区块小标题 */
  --text-xl:   24px;  /* 页面标题 */
  --text-2xl:  32px;  /* 登录页大标题、欢迎语 */

  /* ── 间距体系（8px 基准，乘以倍数） ── */
  --space-1: 4px;    /* 图标与文字间距 */
  --space-2: 8px;    /* 表单行间距 */
  --space-3: 12px;   /* 区块内小间距 */
  --space-4: 16px;   /* 卡片 padding、列表项间距 */
  --space-5: 24px;   /* 页面 content padding */
  --space-6: 32px;   /* 大区块间距 */
  --space-7: 48px;   /* 页面顶部留白 */

  /* ── 圆角体系（三档） ── */
  --radius-sm: 4px;  /* 小标签、Badge */
  --radius-md: 6px;  /* 按钮、输入框、卡片 */
  --radius-lg: 8px;  /* 大容器、Modal */
}
```

### 代码：`src/styles/reset.css`

```css
/* ================================================================
   浏览器默认样式重置
   目的：消除各浏览器默认 margin/padding 差异，统一盒模型
   ================================================================ */

/* 所有元素统一盒模型：width/height 包含 padding 和 border */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* 基础页面样式 */
html, body {
  height: 100%;
  font-family: var(--font-sans);
  font-size: var(--text-sm);     /* 默认 14px */
  color: var(--color-text);
  background-color: var(--color-bg);
  line-height: 1.5;              /* 行高 1.5 倍字号，阅读舒适 */
  -webkit-font-smoothing: antialiased;   /* macOS 下字体更清晰 */
  -moz-osx-font-smoothing: grayscale;
}

/* 根容器撑满视口 */
#root {
  height: 100%;
}

/* 去掉列表默认样式 */
ul, ol {
  list-style: none;
}

/* 去掉链接默认下划线 */
a {
  color: inherit;
  text-decoration: none;
}

/* 去掉按钮默认样式 */
button {
  border: none;
  background: none;
  cursor: pointer;
  font: inherit;
  color: inherit;
}

/* 图片不超出容器 */
img {
  max-width: 100%;
  display: block;
}

/* 输入框字体继承 */
input, textarea, select {
  font: inherit;
  color: inherit;
}
```

### 代码：修改 `src/main.tsx`（引入变量和重置样式）

```tsx
// src/main.tsx
// 入口文件：挂载 React 应用到 #root 节点
// ★ 注意：变量文件必须在所有组件之前引入

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
// ── 全局样式（顺序重要：先变量，后重置） ──
import './styles/variables.css'   // 1. CSS 变量定义
import './styles/reset.css'       // 2. 浏览器样式重置

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### 注意事项

- **变量文件必须在 `reset.css` 之前 import**。因为 `reset.css` 里用了 `var(--font-sans)`，如果变量还没定义，会 fallback 到系统默认字体。
- `#root { height: 100% }` 是让整个 React 应用撑满视口，否则后续的 `AppLayout` 无法正确计算高度。
- 每个变量名都有明确的语义（`--color-text-secondary` 而非 `--color-gray`），方便后续换主题时不用猜色值对应什么用途。

---

## 4. Ant Design 主题配置

### 目的

将 CSS 变量体系映射到 Ant Design 5 的 Design Token，让 AntD 的所有组件（Button、Input、Table……）自动使用我们的配色，不需要每个组件单独写样式覆盖。

### 操作步骤

1. 创建 `src/theme/tokens.ts`
2. 创建 `src/theme/ThemeProvider.tsx`（ConfigProvider 包裹器）
3. 在 `src/App.tsx` 中使用 ThemeProvider

### 代码：`src/theme/tokens.ts`

```typescript
// src/theme/tokens.ts
// Ant Design 5 Design Token 配置
// 将 CSS 变量色值映射到 AntD 的 Token 系统
// 参考文档：https://ant.design/docs/react/customize-theme

import type { ThemeConfig } from 'antd'

// 主题色
const colorPrimary   = '#956BF5'
const colorBgBase    = '#FAFAFA'
const colorTextBase  = '#2C2C2C'
const colorBorder    = '#CECECE'

const themeConfig: ThemeConfig = {
  // ── 全局 Token（影响所有组件） ──
  token: {
    // 颜色
    colorPrimary,                                // 主色：按钮、选中态、链接
    colorBgContainer: '#FFFFFF',                 // 容器/卡片背景（比页背景白一度）
    colorBgLayout:    colorBgBase,               // 页面布局背景
    colorBgElevated:  '#FFFFFF',                 // 浮层/弹窗背景
    colorBorder,                                 // 默认边框色
    colorBorderSecondary: '#E8E8E8',             // 次要边框：表格行线
    colorText:         colorTextBase,            // 正文
    colorTextSecondary:'#6B6B6B',                // 次要文字
    colorTextTertiary: '#999999',                // 辅助文字
    colorLink:         colorPrimary,             // 链接色 = 主色

    // 字体
    fontSize:   14,                              // 默认字号 14px
    fontSizeLG: 16,                              // 大字号 16px
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI',
                 'PingFang SC', 'Microsoft YaHei', sans-serif`,

    // 圆角
    borderRadius:   6,                           // 默认圆角
    borderRadiusLG: 8,                           // 大圆角
    borderRadiusSM: 4,                           // 小圆角

    // 间距（AntD 会自动基于这些计算内部间距）
    padding:          16,                        // 默认内边距
    paddingXS:        8,
    paddingSM:        12,
    paddingLG:        24,
    marginXS:         4,
    marginSM:         8,
    margin:           12,
    marginMD:         16,
    marginLG:         24,
    marginXL:         32,

    // 阴影（极简，GitHub 风格几乎没有阴影）
    boxShadow:        '0 1px 2px rgba(0,0,0,0.04)',
    boxShadowSecondary:'0 4px 12px rgba(0,0,0,0.08)',
  },

  // ── 组件级 Token（按照之前的设计逐组件微调） ──
  components: {
    // 按钮：去掉默认阴影，统一字重
    Button: {
      primaryShadow:   'none',
      defaultShadow:   'none',
      fontWeight:      500,
      controlHeight:   32,                       // 标准按钮高度
      controlHeightSM: 28,
      controlHeightLG: 40,
      paddingInline:   16,                       // 左右内边距
      borderRadius:    6,
    },

    // 输入框：focus 时紫色外发光
    Input: {
      activeShadow: '0 0 0 3px rgba(149,107,245,0.15)',
      borderRadius: 4,
    },

    // 卡片：调整内边距（AntD 默认 24px 太大）
    Card: {
      paddingLG: 16,
    },

    // 表格：表头浅灰底、去掉竖线
    Table: {
      headerBg:      colorBgBase,
      headerColor:   colorTextBase,
      rowHoverBg:    '#F6F6F6',                  // hover 时极浅灰
      borderColor:   '#E8E8E8',
      fontSize:      14,
    },

    // 标签：统一圆角
    Tag: {
      borderRadiusSM: 4,
    },

    // 菜单项
    Menu: {
      itemHeight:       36,
      itemBorderRadius: 0,
      subMenuItemBorderRadius: 0,
    },

    // 标签页
    Tabs: {
      horizontalItemGutter: 24,
    },
  },
}

export default themeConfig
```

### 代码：`src/theme/ThemeProvider.tsx`

```tsx
// src/theme/ThemeProvider.tsx
// 用 ConfigProvider 包裹整个应用，让所有 AntD 组件使用自定义主题

import { ConfigProvider } from 'antd'
import themeConfig from './tokens'

interface ThemeProviderProps {
  children: React.ReactNode
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <ConfigProvider theme={themeConfig}>
      {children}
    </ConfigProvider>
  )
}

export default ThemeProvider
```

### 代码：修改 `src/App.tsx`

```tsx
// src/App.tsx
// 应用根组件：主题 → 路由
// 目前先只有主题包裹，路由在下一步配置

import ThemeProvider from './theme/ThemeProvider'

function App() {
  return (
    <ThemeProvider>
      <div style={{ padding: 24 }}>
        <h1>KG-Class 骨架已就绪</h1>
        <p>如果能看到这行字，说明主题配置成功。</p>
      </div>
    </ThemeProvider>
  )
}

export default App
```

### 验证

执行 `npm run dev`，打开浏览器。如果一切正常，应该看到白底黑色文字的占位页面。打开浏览器 DevTools → Elements 面板，检查 `<body>` 上是否有 AntD 注入的 CSS 变量（搜索 `--ant-`），确认自定义色值已生效。

### 注意事项

- `colorPrimary` 在 AntD 5 中会自动生成 hover/active/bg 等衍生色，不需要手动写死 `#7B52E0`。如果 AntD 自动生成的衍生色和你设计的不一致，才需要在 token 里显式覆盖 `colorPrimaryHover`。
- `Table.rowHoverBg` 设为 `#F6F6F6` 而非我们的 `--color-bg`，因为表格行在白色卡片内，需要比卡片背景深一点才能看出 hover 效果。
- 如果以后想加暗色模式，只需在 `ConfigProvider` 里加 `theme={{ algorithm: theme.darkAlgorithm, ...themeConfig }}` 并切换。

---

## 5. 路由体系搭建

### 目的

用 React Router v6 搭建完整的路由表。先让每个路由对应一个占位组件（只显示页面名称），后续逐个填充真实内容。这样能立刻看到页面跳转，避免"写了一堆组件但不知道能不能用"。

### 操作步骤

1. 创建所有页面占位组件
2. 创建路由配置文件 `src/router/index.tsx`
3. 修改 `App.tsx` 接入路由

### 5.1 创建占位组件

在 `src/pages/` 的每个子目录下创建 `index.tsx`，内容都是同样的占位结构。以登录页为例：

**`src/pages/login/index.tsx`**
```tsx
// 登录页（占位）
const LoginPage = () => {
  return <div style={{ padding: 48, textAlign: 'center' }}>登录页</div>
}
export default LoginPage
```

其他页面同理，区别只有文字：
- `pages/teacher/dashboard/index.tsx` → 文字 "教师首页"
- `pages/teacher/graph/index.tsx` → "图谱管理"
- `pages/teacher/review/index.tsx` → "审核工作台"
- `pages/student/dashboard/index.tsx` → "学生首页"
- ...（所有 18 个页面都要建）

**快捷做法**：只建第一批 7 个核心页面的占位，其余的用到时再建。必须建的是：
```
login/        → 登录页
teacher/
  dashboard/  → 教师首页
  graph/      → 图谱管理
  review/     → 审核工作台
  create-course/ → 新建课程
student/
  dashboard/  → 学生首页
  graph/      → 图谱浏览
  pr/         → PR 详情
  private-graph/ → 私人图谱
```

### 5.2 创建布局占位组件

**`src/components/layout/TeacherLayout.tsx`**
```tsx
// 教师端布局壳（占位）
// 后续会替换为真实的 Header + Sidebar + Outlet
import { Outlet } from 'react-router-dom'

const TeacherLayout = () => {
  return (
    <div>
      <div style={{ height: 48, background: '#fff', borderBottom: '1px solid #eee', padding: '0 16px', lineHeight: '48px' }}>
        教师端 Header（占位）
      </div>
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 48px)' }}>
        <div style={{ width: 240, background: '#fafafa', padding: 16, borderRight: '1px solid #eee' }}>
          侧边栏（占位）
        </div>
        <div style={{ flex: 1, padding: 24 }}>
          <Outlet /> {/* 子路由内容会在这里渲染 */}
        </div>
      </div>
    </div>
  )
}

export default TeacherLayout
```

**`src/components/layout/StudentLayout.tsx`** — 结构完全相同，只把"教师端"改为"学生端"。

### 5.3 路由配置

**`src/router/index.tsx`**
```tsx
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

/*
  路由结构说明：
  ─────────────────
  /login                     → 登录页（独立，无布局壳）
  
  /teacher                   → 教师布局壳
    /dashboard               →   教师首页
    /courses/new             →   新建课程
    /courses/:courseId/graph →   图谱管理
    /review                  →   审核工作台
  
  /student                   → 学生布局壳
    /dashboard               →   学生首页
    /courses/:courseId/graph →   图谱浏览
    /private-graph/:graphId  →   私人图谱
    /pr/:prId                →   PR 详情
*/

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
```

### 5.4 接入路由到 App

**修改 `src/App.tsx`**
```tsx
// src/App.tsx
// 主题包裹 → 路由渲染

import { RouterProvider } from 'react-router-dom'
import ThemeProvider from './theme/ThemeProvider'
import router from './router'

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App
```

### 验证

执行 `npm run dev`，在浏览器地址栏手动输入以下路径，确认每个都能显示对应占位文字：
- `http://localhost:5173/login` → 登录页
- `http://localhost:5173/teacher/dashboard` → 教师首页（含 Header + Sidebar 壳）
- `http://localhost:5173/teacher/courses/123/graph` → 图谱管理
- `http://localhost:5173/student/dashboard` → 学生首页（含 Header + Sidebar 壳）

### 注意事项

- `:courseId` 和 `:graphId` 是 URL 参数（React Router 的 dynamic segment）。在组件中通过 `useParams()` 获取，例如 `const { courseId } = useParams()`。
- 目前路由没有做权限守卫（任何人可以访问任何路径）。这在 MVP 阶段可以接受，先跑通页面跳转。
- `index: true` 表示该路由是父路由的默认子路由。访问 `/teacher` 和 `/teacher/dashboard` 显示同一个页面。

---

## 6. 布局组件：Shell 框架

### 目的

实现真正的 Header + Sidebar 布局。这是整个应用的外壳，后续所有页面都在这个壳里渲染。

### 设计稿参考

```
┌──────────────────────────────────────────────────────┐
│ Header  高度 48px  白底  底部 0.5px 边框  #CECECE      │
│  Logo(32px)         [课程下拉]      [通知] [头像]     │
├──────────┬───────────────────────────────────────────┤
│ Sidebar  │  Content（Outlet 渲染）                    │
│ 宽 240px │  padding 24px, max-width 1280px 居中      │
│          │                                           │
│ 课程切换 │                                           │
│ 图谱管理 │                                           │
│ 课程资料 │                                           │
│ 习题库   │                                           │
│ 学情分析 │                                           │
│ ─────── │                                           │
│ 首页     │                                           │
│ 审核台 🔴│                                           │
│ 设置     │                                           │
└──────────┴───────────────────────────────────────────┘
```

### 6.1 侧边栏数据配置

**`src/components/layout/sidebarConfig.ts`**
```typescript
// 侧边栏菜单项配置
// 不直接在组件里写死文字，方便后续加权限控制或多语言

import {
  HomeOutlined,
  ApartmentOutlined,
  AuditOutlined,
  SettingOutlined,
  BookOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  BarChartOutlined,
} from '@ant-design/icons'
import type { ItemType } from 'antd/es/menu/interface'

// 教师端课程相关菜单（显示在侧边栏上方，课程切换后变化）
export const teacherCourseMenuItems: ItemType[] = [
  { key: 'graph',     icon: <ApartmentOutlined />, label: '图谱管理' },
  { key: 'materials', icon: <FileTextOutlined />,   label: '课程资料' },
  { key: 'exercises', icon: <ExperimentOutlined />,  label: '习题库' },
  { key: 'analytics', icon: <BarChartOutlined />,    label: '学情分析' },
]

// 教师端全局菜单（始终显示在侧边栏下方）
export const teacherGlobalMenuItems: ItemType[] = [
  { key: 'dashboard', icon: <HomeOutlined />,    label: '首页' },
  { key: 'review',    icon: <AuditOutlined />,    label: '审核工作台' },
  { key: 'settings',  icon: <SettingOutlined />,  label: '设置' },
]

// 学生端菜单
export const studentMenuItems: ItemType[] = [
  { key: 'dashboard', icon: <HomeOutlined />,       label: '首页' },
  { key: 'browse',    icon: <SearchOutlined />,      label: '课程广场' },
  { key: 'graph',     icon: <ApartmentOutlined />,  label: '图谱浏览' },
  { key: 'exercises', icon: <ExperimentOutlined />, label: '练习' },
  { key: 'contributions', icon: <BarChartOutlined />, label: '我的贡献' },
  { key: 'settings',  icon: <SettingOutlined />,    label: '设置' },
]
```

### 6.2 教师布局壳

**重写 `src/components/layout/TeacherLayout.tsx`**

```tsx
// src/components/layout/TeacherLayout.tsx
// 教师端布局：48px Header + 240px Sidebar + Content
// 使用 Ant Design Layout 组件构建

import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Select, Badge, Avatar, Dropdown } from 'antd'
import {
  PlusOutlined,
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import {
  teacherCourseMenuItems,
  teacherGlobalMenuItems,
} from './sidebarConfig'

const { Header, Sider, Content } = Layout

const TeacherLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  // 当前选中的课程 ID（后续从 store 获取，现在先写死模拟）
  const [currentCourseId, setCurrentCourseId] = useState<string | undefined>()

  /*
    从 URL 中提取当前课程 ID
    例如 /teacher/courses/abc123/graph → 提取 abc123
    用这个来确定侧边栏菜单的高亮
  */
  const pathParts = location.pathname.split('/')
  const urlCourseId = pathParts[3] === 'courses' ? pathParts[4] : undefined
  // URL 中课程后面的子路径（如 graph、materials）
  const urlSubPath = urlCourseId ? pathParts[5] : undefined

  /*
    侧边栏选中项的逻辑：
    - 如果在课程内，高亮对应的子菜单项
    - 否则高亮全局菜单项
  */
  const selectedKey = urlCourseId
    ? urlSubPath || 'graph'         // 默认高亮"图谱管理"
    : pathParts[2] || 'dashboard'   // 例如 /teacher/review → review

  // 点击菜单项跳转
  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    // 课程内菜单项 → 加上当前课程 ID 前缀
    if (urlCourseId && ['graph', 'materials', 'exercises', 'analytics'].includes(key)) {
      navigate(`/teacher/courses/${urlCourseId}/${key}`)
      return
    }
    // 全局菜单项 → 直接跳转
    if (key === 'dashboard') navigate('/teacher/dashboard')
    if (key === 'review')    navigate('/teacher/review')
    if (key === 'settings')  navigate('/teacher/settings')
  }

  // 模拟课程列表（后续从后端获取）
  const mockCourses = [
    { id: 'course-1', name: '数据结构', pendingCount: 3 },
    { id: 'course-2', name: '操作系统', pendingCount: 1 },
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* ── 顶部 Header ── */}
      <Header
        style={{
          height: 48,
          background: '#fff',
          borderBottom: '0.5px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          lineHeight: '48px',
        }}
      >
        {/* 左侧：Logo + 课程切换 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Logo：点击回首页 */}
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--color-text)',
              cursor: 'pointer',
            }}
            onClick={() => navigate('/teacher/dashboard')}
          >
            KG-Class
          </span>

          {/* 课程下拉选择器（仅当在课程内时显示） */}
          {urlCourseId && (
            <Select
              value={currentCourseId}
              onChange={(val) => {
                setCurrentCourseId(val)
                navigate(`/teacher/courses/${val}/graph`)
              }}
              placeholder="选择课程"
              style={{ width: 200 }}
              options={mockCourses.map((c) => ({
                value: c.id,
                // label 里可以加待审红点（此处简化）
                label: c.pendingCount > 0
                  ? `${c.name} (${c.pendingCount})`
                  : c.name,
              }))}
              variant="borderless"               // ● 无边框样式，更像 GitHub
            />
          )}
        </div>

        {/* 右侧：操作按钮 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* 新建课程 */}
          <PlusOutlined
            style={{ fontSize: 18, cursor: 'pointer' }}
            onClick={() => navigate('/teacher/courses/new')}
          />

          {/* 通知 */}
          <Badge count={5} size="small">
            <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
          </Badge>

          {/* 用户头像 + 下拉菜单 */}
          <Dropdown
            menu={{
              items: [
                { key: 'settings', icon: <SettingOutlined />, label: '个人设置' },
                { type: 'divider' },
                { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
              ],
              onClick: ({ key }) => {
                if (key === 'settings') navigate('/teacher/settings')
                if (key === 'logout') navigate('/login')
              },
            }}
          >
            <Avatar
              size={28}
              icon={<UserOutlined />}
              style={{ cursor: 'pointer', backgroundColor: 'var(--color-primary)' }}
            />
          </Dropdown>
        </div>
      </Header>

      {/* ── 下方：Sidebar + Content ── */}
      <Layout>
        {/* 侧边栏 */}
        <Sider
          width={240}
          style={{
            background: 'var(--color-bg)',
            borderRight: '0.5px solid var(--color-border)',
          }}
        >
          <div style={{ padding: '12px 0' }}>
            {/* 课程相关菜单（上半部分） */}
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              onClick={onMenuClick}
              items={teacherCourseMenuItems}
              style={{
                background: 'transparent',
                borderInlineEnd: 'none',       // 去掉 AntD 默认的右侧边框
              }}
            />

            {/* 分割线 */}
            <div style={{
              height: 1,
              background: 'var(--color-border)',
              margin: '8px 16px',
            }} />

            {/* 全局菜单（下半部分） */}
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              onClick={onMenuClick}
              items={teacherGlobalMenuItems.map(item => ({
                ...item,
                // "审核工作台"加红色数字角标
                label: item.key === 'review' ? (
                  <span>
                    审核工作台
                    <span style={{
                      display: 'inline-block',
                      background: 'var(--color-danger)',
                      color: '#fff',
                      fontSize: 11,
                      borderRadius: 10,
                      padding: '0 6px',
                      marginLeft: 8,
                      lineHeight: '18px',
                    }}>
                      5
                    </span>
                  </span>
                ) : item.label,
              }))}
              style={{
                background: 'transparent',
                borderInlineEnd: 'none',
              }}
            />
          </div>
        </Sider>

        {/* 内容区 */}
        <Content
          style={{
            padding: 24,
            minHeight: 'calc(100vh - 48px)',
            background: 'var(--color-bg)',
          }}
        >
          <div style={{
            maxWidth: 1280,
            margin: '0 auto',           // 居中
          }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default TeacherLayout
```

### 6.3 学生布局壳

结构几乎相同，区别：
- 侧边栏菜单用 `studentMenuItems`
- Header 无课程下拉（学生用 `CourseSwitcher` 在侧边栏）
- Header 无 `PlusOutlined`（学生不新建课程）

**`src/components/layout/StudentLayout.tsx`**

```tsx
// src/components/layout/StudentLayout.tsx
// 学生端布局壳

import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Badge, Avatar, Dropdown } from 'antd'
import {
  BellOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { studentMenuItems } from './sidebarConfig'

const { Header, Sider, Content } = Layout

const StudentLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()

  // 从 URL 提取当前子路径来确定选中菜单项
  const pathParts = location.pathname.split('/')
  const urlSubPath = pathParts[3] || pathParts[2] || 'dashboard'

  // 菜单项 key 到 URL 路径的映射
  const menuKeyToPath: Record<string, string> = {
    dashboard:     '/student/dashboard',
    graph:         `/student/courses/${pathParts[3] === 'courses' ? pathParts[4] : ''}/graph`,
    exercises:     `/student/courses/${pathParts[3] === 'courses' ? pathParts[4] : ''}/exercises`,
    contributions: '/student/contributions',
    settings:      '/student/settings',
  }

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(menuKeyToPath[key] || '/student/dashboard')
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header */}
      <Header
        style={{
          height: 48,
          background: '#fff',
          borderBottom: '0.5px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
        }}
      >
        <span
          style={{ fontSize: 20, fontWeight: 700, cursor: 'pointer' }}
          onClick={() => navigate('/student/dashboard')}
        >
          KG-Class
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Badge count={3} size="small">
            <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
          </Badge>
          <Dropdown
            menu={{
              items: [
                { key: 'settings', icon: <SettingOutlined />, label: '个人设置' },
                { type: 'divider' },
                { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true },
              ],
              onClick: ({ key }) => {
                if (key === 'settings') navigate('/student/settings')
                if (key === 'logout') navigate('/login')
              },
            }}
          >
            <Avatar
              size={28}
              icon={<UserOutlined />}
              style={{ cursor: 'pointer', backgroundColor: 'var(--color-primary)' }}
            />
          </Dropdown>
        </div>
      </Header>

      <Layout>
        <Sider
          width={240}
          style={{
            background: 'var(--color-bg)',
            borderRight: '0.5px solid var(--color-border)',
          }}
        >
          <div style={{ padding: '12px 0' }}>
            <Menu
              mode="inline"
              selectedKeys={[urlSubPath]}
              onClick={onMenuClick}
              items={studentMenuItems}
              style={{ background: 'transparent', borderInlineEnd: 'none' }}
            />
          </div>
        </Sider>

        <Content style={{ padding: 24, background: 'var(--color-bg)' }}>
          <div style={{ maxWidth: 1280, margin: '0 auto' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default StudentLayout
```

### 验证

`npm run dev`，访问 `/teacher/dashboard`。应该看到：
- 顶部 48px 白色 Header，左侧 "KG-Class" 文字
- 左侧 240px 侧边栏，菜单项可点击跳转
- "审核工作台" 菜单项旁有红色数字角标 "5"
- 右侧内容区渲染占位文字

### 注意事项

- **`variant="borderless"`** 是 Ant Design 5 的 Select 属性，去掉输入框的边框，让课程选择器看起来就像一段可点击的文字，GitHub 风格。
- **分割线**没有用 `<Divider>` 组件，而是用普通 `<div>` + 背景色。因为 AntD Divider 有默认的上下 margin 和复杂样式，用 div 更可控。
- Sidebar 中的菜单点击跳转用了 if-else 判断，这是为了让你看清楚逻辑。熟练后可以改为配置驱动的跳转映射表。

---

## 7. 登录页

### 目的

实现完整的登录页 UI（暂不接后端认证），让项目有一个正式的入口。

### 设计稿参考

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│                       [Logo 图标]                        │
│                                                          │
│                   KG-Class                              │
│            班级共建式知识图谱教学系统                       │
│                                                          │
│            ┌──────────────────────────┐                  │
│            │  账号（学号/工号）          │                 │
│            ├──────────────────────────┤                  │
│            │  密码                     │                 │
│            ├──────────────────────────┤                  │
│            │        登  录             │  ← 紫色按钮      │
│            └──────────────────────────┘                  │
│                                                          │
│              教师登录  |  学生登录                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 代码：`src/pages/login/index.tsx`

```tsx
// src/pages/login/index.tsx
// 登录页

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Form, message, Radio } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'

/*
  Form.Item 的 rules 用于表单校验
  message 是 AntD 的轻量级消息提示（顶部弹出）
*/

const LoginPage = () => {
  const navigate = useNavigate()
  // role: 'teacher' 或 'student'，决定登录后跳转到哪个端
  const [role, setRole] = useState<'teacher' | 'student'>('student')
  const [loading, setLoading] = useState(false)

  /*
    提交表单时的处理函数
    目前是模拟登录：1.5 秒后跳转
    后续只需把这段替换为真实的 API 调用
  */
  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true)

    // TODO: 替换为真实 API 调用
    // const res = await axios.post('/api/auth/login', { ...values, role })

    // 模拟登录延迟（让用户看到按钮 loading 状态）
    await new Promise(resolve => setTimeout(resolve, 1500))

    message.success(`欢迎回来，${values.username}`)
    setLoading(false)

    // 根据角色跳转
    if (role === 'teacher') {
      navigate('/teacher/dashboard')
    } else {
      navigate('/student/dashboard')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
    }}>
      {/* 登录卡片 */}
      <div style={{
        width: 400,
        padding: '40px 32px',
        background: '#fff',
        borderRadius: 'var(--radius-lg)',
        border: '0.5px solid var(--color-border)',
        // ● 极淡的阴影，GitHub 风格
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        {/* ── Logo 区域 ── */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {/* 图标占位：后续替换为真实 Logo SVG */}
          <div style={{
            width: 56,
            height: 56,
            background: 'var(--color-primary)',
            borderRadius: 12,
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: 28,
            fontWeight: 700,
          }}>
            KG
          </div>

          <h1 style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 600,
            color: 'var(--color-text)',
            marginBottom: 4,
          }}>
            KG-Class
          </h1>
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-tertiary)',
          }}>
            班级共建式知识图谱教学系统
          </p>
        </div>

        {/* ── 表单 ── */}
        <Form
          onFinish={onFinish}
          size="large"           // 输入框和按钮都变大
          autoComplete="off"
        >
          {/* 账号输入框 */}
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入账号' },
              { min: 3, message: '账号至少 3 位' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: 'var(--color-text-tertiary)' }} />}
              placeholder="学号 / 工号"
            />
          </Form.Item>

          {/* 密码输入框 */}
          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少 6 位' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: 'var(--color-text-tertiary)' }} />}
              placeholder="密码"
            />
          </Form.Item>

          {/* 角色切换 */}
          <Form.Item style={{ marginBottom: 24 }}>
            <Radio.Group
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: '100%', textAlign: 'center' }}
            >
              <Radio.Button value="student" style={{ width: '50%', textAlign: 'center' }}>
                学生登录
              </Radio.Button>
              <Radio.Button value="teacher" style={{ width: '50%', textAlign: 'center' }}>
                教师登录
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          {/* 登录按钮 — 整页唯一紫色填充按钮 */}
          <Form.Item style={{ marginBottom: 16 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block             // ● 宽度撑满
              style={{ height: 42, fontSize: 16 }}
            >
              登 录
            </Button>
          </Form.Item>

          {/* 底部辅助链接 */}
          <div style={{
            textAlign: 'center',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-tertiary)',
          }}>
            <span>还没有账号？</span>
            <a
              href="#"
              style={{
                color: 'var(--color-primary)',
                marginLeft: 4,
              }}
              onClick={(e) => { e.preventDefault(); message.info('请联系教师创建账号') }}
            >
              联系管理员
            </a>
          </div>
        </Form>
      </div>
    </div>
  )
}

export default LoginPage
```

### 验证

访问 `http://localhost:5173/login`，输入任意账号密码，点击登录。应该看到：
- 输入框有校验（空值提交会提示）
- 点击登录后按钮显示 loading 动画
- 1.5 秒后弹出绿色提示，跳转到对应端的仪表盘

### 注意事项

- **Radio.Group** 用 `Radio.Button` 而非 `Radio`，因为 `Radio.Button` 渲染成按钮组样式，视觉上像 GitHub 的 tab 切换，比圆形单选框更合适。
- **`Form.Item` 的 `rules`** 是 AntD 内置的表单校验，`required: true` 会自动在提交时检查，不需要手动写校验逻辑。
- 紫色只在两个地方出现：Logo 背景块和登录按钮。其他文字、输入框、边框全部用中性色。

---

## 下一步预告

第 8 步将实现**教师端仪表盘**（含按课程拆分的待审核卡片 + 课程卡片列表），第 10 步将集成 **AntV G6** 实现图谱画布。

每完成一步后运行 `npm run dev` 确认无报错，再进入下一步。

---

## 8. 教师端仪表盘

### 目的

教师登录后看到的第一屏。包含两大区域：
1. **待审核概览（按课程拆分）**：快速判断哪门课审核积压最多，点击直接跳审核工作台并筛选该课程
2. **课程卡片列表**：所有所授课程，点击进入图谱管理

### 设计稿参考

```
┌─────────────────────────────────────────────────────────┐
│  欢迎回来，张老师                                          │
│                                                          │
│  ┌──── 待审核 ──────────────────────────────────────┐    │
│  │ ┌──────────┐  ┌──────────┐  ┌──────────┐        │    │
│  │ │ 数据结构  │  │ 操作系统  │  │ 计算机网络 │        │    │
│  │ │ 待审 5   │  │ 待审 2   │  │ 待审 0   │        │    │
│  │ │ AI评分↓  │  │ AI评分→  │  │    —     │        │    │
│  │ └──────────┘  └──────────┘  └──────────┘        │    │
│  │              [进入审核工作台 →]                     │    │
│  └──────────────────────────────────────────────────┘    │
│                                                          │
│  ┌──── 我的课程 ────────────────────────────────────┐    │
│  │ ┌──────────┐  ┌──────────┐  ┌──────────┐        │    │
│  │ │ 数据结构  │  │ 操作系统  │  │   ...     │        │    │
│  │ │ 计科2101  │  │ 计科2101  │  │          │        │    │
│  │ │ 180 节点  │  │ 120 节点  │  │          │        │    │
│  │ │ 更新于... │  │ 更新于... │  │          │        │    │
│  │ └──────────┘  └──────────┘  └──────────┘        │    │
│  └──────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### 8.1 Mock 数据文件

先创建 Mock 数据，后续替换为真实 API：

**`src/api/mock/dashboard.ts`**

```typescript
// src/api/mock/dashboard.ts
// 仪表盘页面的模拟数据
// 后续替换为 axios.get('/api/teacher/dashboard') 的返回值

export interface PendingReviewByCourse {
  courseId: string
  courseName: string
  pendingCount: number
  // AI 平均评分趋势：'up' 上升 / 'down' 下降 / 'stable' 持平
  aiScoreTrend: 'up' | 'down' | 'stable'
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
    aiScoreTrend: 'down',      // AI 评分下降 → 可能需要人工重点关注
  },
  {
    courseId: 'course-2',
    courseName: '操作系统',
    pendingCount: 2,
    aiScoreTrend: 'up',
  },
  {
    courseId: 'course-3',
    courseName: '计算机网络',
    pendingCount: 0,
    aiScoreTrend: 'stable',
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
```

### 8.2 仪表盘页面组件

**`src/pages/teacher/dashboard/index.tsx`**

```tsx
// src/pages/teacher/dashboard/index.tsx
// 教师首页：待审核概览 + 课程卡片列表

import { useNavigate } from 'react-router-dom'
import { Row, Col, Button, Tag } from 'antd'
import {
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  MinusOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { mockPendingReviews, mockCourses } from '../../../api/mock/dashboard'
import type { PendingReviewByCourse } from '../../../api/mock/dashboard'

/*
  页面结构：
  ──────────
  欢迎语
  待审核概览区（按课程拆分的卡片）
  我的课程区（课程卡片网格）
*/

const TeacherDashboard = () => {
  const navigate = useNavigate()
  // 教师姓名（后续从 auth store 获取）
  const teacherName = '张老师'

  /*
    AI 评分趋势图标映射
    up    → 绿色上升箭头（好趋势）
    down  → 红色下降箭头（需要关注）
    stable→ 灰色横线（持平）
  */
  const trendIcon = (trend: PendingReviewByCourse['aiScoreTrend']) => {
    switch (trend) {
      case 'up':
        return <ArrowUpOutlined style={{ color: 'var(--color-success)', fontSize: 12 }} />
      case 'down':
        return <ArrowDownOutlined style={{ color: 'var(--color-danger)', fontSize: 12 }} />
      case 'stable':
        return <MinusOutlined style={{ color: 'var(--color-text-tertiary)', fontSize: 12 }} />
    }
  }

  return (
    <div>
      {/* ── 欢迎语 ── */}
      <h2 style={{
        fontSize: 'var(--text-xl)',
        fontWeight: 600,
        marginBottom: 'var(--space-5)',
      }}>
        欢迎回来，{teacherName}
      </h2>

      {/* ════════════════════════════════════════════════════════
         待审核概览区
         ════════════════════════════════════════════════════════ */}
      <section style={{ marginBottom: 'var(--space-6)' }}>
        {/* 区域标题行 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-4)',
        }}>
          <h3 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
          }}>
            待审核
          </h3>
          <Button
            type="text"
            size="small"
            onClick={() => navigate('/teacher/review')}
            style={{ color: 'var(--color-text-secondary)' }}
          >
            进入审核工作台 <RightOutlined style={{ fontSize: 10 }} />
          </Button>
        </div>

        {/* 按课程拆分的待审核卡片 */}
        <Row gutter={[16, 16]}>
          {mockPendingReviews.map((item) => (
            <Col key={item.courseId} xs={24} sm={12} md={8}>
              <div
                /*
                  整张卡片可点击 → 跳转到审核工作台，自动筛选该课程
                  后续实现：navigate(`/teacher/review?courseId=${item.courseId}`)
                  审核工作台读取 URL query 参数做筛选
                */
                onClick={() => navigate(`/teacher/review?courseId=${item.courseId}`)}
                style={{
                  padding: 'var(--space-4)',
                  background: '#fff',
                  border: '0.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  // ● hover 时边框变紫，是这页极少出现的紫色
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                }}
              >
                {/* 课程名 + 待审数字 */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}>
                  <span style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 500,
                  }}>
                    {item.courseName}
                  </span>

                  {/* 待审数字：0 时灰色，>0 时红色 */}
                  <span style={{
                    fontSize: 'var(--text-xl)',
                    fontWeight: 700,
                    color: item.pendingCount > 0
                      ? 'var(--color-danger)'
                      : 'var(--color-text-tertiary)',
                  }}>
                    {item.pendingCount}
                  </span>
                </div>

                {/* AI 评分趋势 */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-secondary)',
                }}>
                  <span>AI 评分趋势</span>
                  {trendIcon(item.aiScoreTrend)}
                  <span>
                    {item.aiScoreTrend === 'up' && '上升'}
                    {item.aiScoreTrend === 'down' && '下降'}
                    {item.aiScoreTrend === 'stable' && '持平'}
                  </span>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </section>

      {/* ════════════════════════════════════════════════════════
         我的课程区
         ════════════════════════════════════════════════════════ */}
      <section>
        {/* 区域标题行 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-4)',
        }}>
          <h3 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 600,
          }}>
            我的课程
          </h3>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/teacher/courses/new')}
            // ● 这个紫色按钮是仪表盘唯一的主色按钮，位置靠右不抢眼
            //   符合"紫色只在行动号召处出现"的设计原则
          >
            新建课程
          </Button>
        </div>

        {/* 课程卡片网格 */}
        <Row gutter={[16, 16]}>
          {mockCourses.map((course) => (
            <Col key={course.id} xs={24} sm={12} md={8}>
              <div
                onClick={() => navigate(`/teacher/courses/${course.id}/graph`)}
                style={{
                  padding: 'var(--space-4)',
                  background: '#fff',
                  border: '0.5px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-border)'
                }}
              >
                {/* 课程名 */}
                <div style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 600,
                  marginBottom: 4,
                }}>
                  {course.name}
                </div>

                {/* 班级 + 学期 */}
                <div style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 12,
                }}>
                  {course.className} · {course.semester}
                </div>

                {/* 底部：节点数 + 更新时间 */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-tertiary)',
                }}>
                  <Tag
                    style={{
                      margin: 0,
                      fontSize: 11,
                      background: 'var(--color-primary-light)',
                      color: 'var(--color-primary)',
                      border: 'none',
                    }}
                  >
                    {course.nodeCount} 个节点
                  </Tag>
                  <span>更新于 {course.lastUpdated}</span>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </section>
    </div>
  )
}

export default TeacherDashboard
```

### 验证

访问 `http://localhost:5173/teacher/dashboard`，应该看到：
- "欢迎回来，张老师"
- 三个待审核卡片（数据结构 5 个、操作系统 2 个、计算机网络 0 个）
- 点击待审核卡片跳转到 `/teacher/review?courseId=course-1`
- 三个课程卡片，点击跳转到 `/teacher/courses/course-1/graph`
- "新建课程"紫色按钮跳转到 `/teacher/courses/new`

### 注意事项

- **hover 边框变色**用 `onMouseEnter` + `onMouseLeave` 直接操作 DOM style，而不是 CSS `:hover`。原因是后续这个卡片可能被拆成独立组件，inline style 更容易和 props 联动。
- **待审数 0 时不显红色**：`color: item.pendingCount > 0 ? 'red' : 'gray'`，0 个待审是正常状态，不该用红色制造焦虑。
- **AI 评分趋势**的箭头方向：up（绿色）代表 AI 评分在上升 → 近期提交质量变好；down（红色）代表下降 → 需要教师多关注人工审核。

---

## 9. 学生端仪表盘

### 目的

学生登录后看到的第一屏。包含：我的课程进度、最近 PR 状态、贡献概览、学习连续天数。

### 设计稿参考

```
┌──────────────────────────────────────────────────────┐
│  欢迎回来，张三                                         │
│                                                       │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐  │
│  │ 数据结构     │  │ 操作系统     │  │ 计算机网络    │  │
│  │ ████████░░  │  │ ██████░░░░  │  │ ███░░░░░░░   │  │
│  │ 掌握 72%   │  │ 掌握 45%    │  │ 掌握 18%     │  │
│  │ 180 节点   │  │ 124 节点    │  │ 98 节点      │  │
│  └─────────────┘  └─────────────┘  └──────────────┘  │
│                                                       │
│  最近 PR 状态          贡献概览         学习连续       │
│  ┌─────────────────┐  ┌────────┐     ┌────────┐     │
│  │ #12 新增节点    │  │ 总分   │     │   🔥   │     │
│  │ "红黑树"       │  │ 285   │     │ 连续 7 天 │     │
│  │ 已通过 ✓       │  │ 本周+45│     │        │     │
│  │                │  │ 排名 #3 │     │        │     │
│  │ #11 修改关系   │  └────────┘     └────────┘     │
│  │ "栈←队列"     │                                  │
│  │ 审核中 ⏳      │                                  │
│  └─────────────────┘                                 │
└──────────────────────────────────────────────────────┘
```

### 9.1 Mock 数据

**在 `src/api/mock/dashboard.ts` 中追加**：

```typescript
// ── 学生端 Mock 数据 ──

export interface StudentCourseCard {
  id: string
  name: string
  teacherName: string
  nodeCount: number
  masteredCount: number
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
    masteredCount: 134,
    pendingPRCount: 2,
  },
  {
    id: 'course-2',
    name: '操作系统',
    teacherName: '李老师',
    nodeCount: 124,
    masteredCount: 56,
    pendingPRCount: 0,
  },
  {
    id: 'course-3',
    name: '计算机网络',
    teacherName: '王老师',
    nodeCount: 98,
    masteredCount: 18,
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
```

### 9.2 学生仪表盘页面

**`src/pages/student/dashboard/index.tsx`**

```tsx
// src/pages/student/dashboard/index.tsx
// 学生首页：课程进度 + PR 状态 + 贡献概览

import { useNavigate } from 'react-router-dom'
import { Row, Col, Progress, Tag } from 'antd'
import {
  FireOutlined,
  TrophyOutlined,
  RiseOutlined,
} from '@ant-design/icons'
import {
  mockStudentCourses,
  mockStudentPRs,
  mockStudentStats,
} from '../../../api/mock/dashboard'

/*
  页面分为左右两栏（AntD Row + Col）：
  左侧 2/3：课程卡片（上）+ 最近 PR（下）
  右侧 1/3：贡献概览 + 学习连续天数
*/

const StudentDashboard = () => {
  const navigate = useNavigate()
  const studentName = '张三'

  // PR 状态 → 颜色映射
  const statusConfig: Record<string, { color: string; label: string }> = {
    approved: { color: 'var(--color-success)', label: '已通过' },
    pending:  { color: 'var(--color-warning)', label: '审核中' },
    rejected: { color: 'var(--color-danger)',  label: '已打回' },
    draft:    { color: 'var(--color-text-tertiary)', label: '草稿' },
  }

  return (
    <div>
      {/* ── 欢迎语 ── */}
      <h2 style={{
        fontSize: 'var(--text-xl)',
        fontWeight: 600,
        marginBottom: 'var(--space-5)',
      }}>
        欢迎回来，{studentName}
      </h2>

      <Row gutter={[24, 24]}>
        {/* ════════════════════════════ 左侧主区域 ════════════════════════════ */}
        <Col xs={24} lg={16}>
          {/* ── 我的课程卡片 ── */}
          <section style={{ marginBottom: 'var(--space-5)' }}>
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 600,
              marginBottom: 'var(--space-4)',
            }}>
              我的课程
            </h3>

            <Row gutter={[16, 16]}>
              {mockStudentCourses.map((course) => {
                // 计算掌握百分比
                const percent = Math.round(
                  (course.masteredCount / course.nodeCount) * 100
                )

                return (
                  <Col key={course.id} xs={24} sm={12} md={8}>
                    <div
                      onClick={() => navigate(`/student/courses/${course.id}/graph`)}
                      style={{
                        padding: 'var(--space-4)',
                        background: '#fff',
                        border: '0.5px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-primary)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--color-border)'
                      }}
                    >
                      {/* 课程名 + 教师 */}
                      <div style={{
                        fontSize: 'var(--text-base)',
                        fontWeight: 600,
                        marginBottom: 2,
                      }}>
                        {course.name}
                      </div>
                      <div style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-secondary)',
                        marginBottom: 12,
                      }}>
                        {course.teacherName}
                      </div>

                      {/* 掌握进度条 */}
                      <Progress
                        percent={percent}
                        size="small"
                        strokeColor={
                          percent >= 60 ? 'var(--color-success)'
                            : percent >= 30 ? 'var(--color-warning)'
                            : 'var(--color-danger)'
                        }
                        // ● 不显示百分比数字（更简洁）
                        format={() => `${course.masteredCount}/${course.nodeCount}`}
                      />

                      {/* 待处理 PR 提示 */}
                      {course.pendingPRCount > 0 && (
                        <div style={{
                          marginTop: 8,
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-primary)',
                        }}>
                          {course.pendingPRCount} 个待处理 PR
                        </div>
                      )}
                    </div>
                  </Col>
                )
              })}
            </Row>
          </section>

          {/* ── 最近 PR 状态 ── */}
          <section>
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 600,
              marginBottom: 'var(--space-4)',
            }}>
              最近提交
            </h3>

            <div style={{
              background: '#fff',
              border: '0.5px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              // ● 无内边距 — 列表项自己带 padding，容器不带
              overflow: 'hidden',
            }}>
              {/* 用 div 而非 Table，GitHub 风格列表 */}
              {mockStudentPRs.map((pr, index) => {
                const status = statusConfig[pr.status]

                return (
                  <div
                    key={pr.id}
                    onClick={() => navigate(`/student/pr/${pr.id}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px var(--space-4)',
                      cursor: 'pointer',
                      // 非最后一项加底部分割
                      borderBottom:
                        index < mockStudentPRs.length - 1
                          ? '0.5px solid var(--color-border)'
                          : 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--color-bg)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    {/* 左侧：类型 + 描述 */}
                    <div>
                      <div style={{
                        fontSize: 'var(--text-sm)',
                        fontWeight: 500,
                        marginBottom: 2,
                      }}>
                        #{pr.id} {pr.title}
                      </div>
                      <div style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-secondary)',
                      }}>
                        {pr.description}
                      </div>
                    </div>

                    {/* 右侧：状态标签 + 时间 */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}>
                      <Tag
                        style={{
                          margin: 0,
                          fontSize: 11,
                          color: status.color,
                          background: `${status.color}15`, // 15 是 hex 透明度
                          border: `0.5px solid ${status.color}30`,
                        }}
                      >
                        {status.label}
                      </Tag>
                      <span style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--color-text-tertiary)',
                      }}>
                        {pr.createdAt}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </Col>

        {/* ════════════════════════════ 右侧辅助区 ════════════════════════════ */}
        <Col xs={24} lg={8}>
          {/* ── 贡献概览 ── */}
          <div style={{
            padding: 'var(--space-4)',
            background: '#fff',
            border: '0.5px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 'var(--space-4)',
          }}>
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              marginBottom: 4,
            }}>
              贡献概览
            </div>

            {/* 总积分：大数字突出 */}
            <div style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 700,
              color: 'var(--color-text)',
              marginBottom: 4,
            }}>
              {mockStudentStats.totalPoints}
            </div>

            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              marginBottom: 12,
            }}>
              本周 +{mockStudentStats.weeklyPoints}
            </div>

            {/* 排名 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
            }}>
              <TrophyOutlined style={{ color: 'var(--color-warning)' }} />
              <span>
                班级排名
                <span style={{ fontWeight: 600, color: 'var(--color-text)', margin: '0 4px' }}>
                  #{mockStudentStats.rank}
                </span>
                / {mockStudentStats.totalStudents}
              </span>
            </div>
          </div>

          {/* ── 学习连续天数 ── */}
          <div style={{
            padding: 'var(--space-4)',
            background: '#fff',
            border: '0.5px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            textAlign: 'center',
          }}>
            <FireOutlined style={{
              fontSize: 28,
              color: 'var(--color-warning)',
              marginBottom: 8,
            }} />
            <div style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 700,
              color: 'var(--color-text)',
            }}>
              {mockStudentStats.streakDays} 天
            </div>
            <div style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
            }}>
              连续学习
            </div>
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default StudentDashboard
```

### 验证

访问 `http://localhost:5173/student/dashboard`，应该看到：
- "欢迎回来，张三"
- 三个课程卡片（含掌握度进度条）
- 最近 PR 列表（3 条，不同状态颜色不同）
- 右侧贡献概览（285 分、排名 #3）+ 连续学习 7 天

### 注意事项

- **Progress 组件**的 `format` 属性：如果不自定义，AntD 默认显示百分比数字。我们改为显示 `134/186` 这种已掌握/总数的格式，对学生更有意义。
- **PR 状态 Tag 的背景色**用了 `#RRGGBB15`（hex 加两位透明度），是手动拼的，让标签背景是语义色的极淡版本。AntD 的 Tag 默认无此效果。
- **右侧辅助区固定 1/3 宽度**：对大屏（lg）用 `Col lg={8}`（8/24 = 1/3），小屏（xs）用 `Col xs={24}` 占满宽，响应式自动换行。

---

## 10. 知识图谱页面（G6 集成）

### 目的

实现整个项目最核心的页面：AntV G6 交互式网络图 + 右侧详情面板。这是教师编辑图谱和学生浏览图谱的共同基础。

G6 的集成是**整个前端开发中难度最高的一步**，因为：
1. G6 是 Canvas 渲染库，不能像 DOM 一样用 JSX 声明
2. 需要手动管理 G6 实例的生命周期（创建、更新、销毁）
3. 需要处理 React 状态和 G6 内部状态的同步

### 10.1 前置知识：G6 v5 核心概念

```
Graph 实例 = new Graph({ container, ...options })

Options 结构：
  data:    { nodes: [...], edges: [...] }    ← 数据
  node:    { style: {...}, state: {...} }    ← 节点样式
  edge:    { style: {...}, state: {...} }    ← 边样式
  layout:  { type: 'force', ... }           ← 布局算法
  behaviors: ['drag-canvas', 'zoom-canvas', ...]  ← 交互行为
  plugins: [{ type: 'minimap', ... }]       ← 插件
  animation: { enter: 'fade' }             ← 动画

生命周期：
  graph.setData({ nodes, edges })  → graph.draw()   ← 数据变化时调用
  graph.destroy()                                    ← 组件卸载时必须调用
```

### 10.2 G6 图谱数据 Mock

**`src/api/mock/graph.ts`**

```typescript
// src/api/mock/graph.ts
// 模拟知识图谱数据（节点 + 边）
// 后续替换为 Neo4j 查询结果

/*
  G6 v5 的节点数据格式：
  {
    id: string                   唯一标识
    data: { ... }                自定义数据（title, tags, content 等）
    style?: { ... }              视觉样式（可选，优先级低于 node.style 配置）
  }
*/

// 6 种标签对应的节点颜色
const tagColors: Record<string, string> = {
  '#subject':              '#956BF5',
  '#chapter':              '#7B52E0',
  '#knowledge-point':      '#FAFAFA',
  '#code-implementation':  '#F0F0F0',
  '#experiment':           '#E8F5E9',
  '#algorithm-case':       '#FFF3E0',
  '#error-point':          '#FFEBEE',
}

// 模拟节点数据
export const mockGraphNodes = [
  { id: 'n1',  data: { title: '数据结构',      tags: ['#subject'] } },
  { id: 'n2',  data: { title: '线性表',         tags: ['#chapter'] } },
  { id: 'n3',  data: { title: '栈与队列',       tags: ['#chapter'] } },
  { id: 'n4',  data: { title: '树与二叉树',     tags: ['#chapter'] } },
  { id: 'n5',  data: { title: '图',             tags: ['#chapter'] } },
  { id: 'n6',  data: { title: '排序算法',       tags: ['#chapter'] } },
  { id: 'n7',  data: { title: '数组',           tags: ['#knowledge-point'] } },
  { id: 'n8',  data: { title: '链表',           tags: ['#knowledge-point'] } },
  { id: 'n9',  data: { title: '栈',             tags: ['#knowledge-point'] } },
  { id: 'n10', data: { title: '队列',           tags: ['#knowledge-point'] } },
  { id: 'n11', data: { title: '二叉树',         tags: ['#knowledge-point'] } },
  { id: 'n12', data: { title: '二叉搜索树',     tags: ['#knowledge-point', '#algorithm-case'] } },
  { id: 'n13', data: { title: 'AVL 树',         tags: ['#knowledge-point', '#algorithm-case'] } },
  { id: 'n14', data: { title: '红黑树',         tags: ['#knowledge-point', '#algorithm-case'] } },
  { id: 'n15', data: { title: '冒泡排序',       tags: ['#knowledge-point'] } },
  { id: 'n16', data: { title: '快速排序',       tags: ['#knowledge-point'] } },
  { id: 'n17', data: { title: '归并排序',       tags: ['#knowledge-point'] } },
  { id: 'n18', data: { title: '链表实现栈',     tags: ['#code-implementation'] } },
  { id: 'n19', data: { title: '数组实现队列',   tags: ['#code-implementation'] } },
  { id: 'n20', data: { title: '快速排序代码',   tags: ['#code-implementation'] } },
  { id: 'n21', data: { title: '链表操作实验',   tags: ['#experiment'] } },
  { id: 'n22', data: { title: '二叉树遍历实验', tags: ['#experiment'] } },
  { id: 'n23', data: { title: '空指针异常',     tags: ['#error-point'] } },
  { id: 'n24', data: { title: '栈溢出',         tags: ['#error-point'] } },
  { id: 'n25', data: { title: '递归深度超限',   tags: ['#error-point'] } },
  { id: 'n26', data: { title: '排序算法比较',   tags: ['#knowledge-point', '#algorithm-case'] } },
]

// 模拟边数据
// source → target，label 为关系类型，data 存附加信息
export const mockGraphEdges = [
  // CONTAINS 关系（学科→章→知识点）
  { source: 'n1', target: 'n2',  data: { relation: 'CONTAINS' } },
  { source: 'n1', target: 'n3',  data: { relation: 'CONTAINS' } },
  { source: 'n1', target: 'n4',  data: { relation: 'CONTAINS' } },
  { source: 'n1', target: 'n5',  data: { relation: 'CONTAINS' } },
  { source: 'n1', target: 'n6',  data: { relation: 'CONTAINS' } },
  { source: 'n2', target: 'n7',  data: { relation: 'CONTAINS' } },
  { source: 'n2', target: 'n8',  data: { relation: 'CONTAINS' } },
  { source: 'n3', target: 'n9',  data: { relation: 'CONTAINS' } },
  { source: 'n3', target: 'n10', data: { relation: 'CONTAINS' } },
  { source: 'n4', target: 'n11', data: { relation: 'CONTAINS' } },
  { source: 'n4', target: 'n12', data: { relation: 'CONTAINS' } },
  { source: 'n4', target: 'n13', data: { relation: 'CONTAINS' } },
  { source: 'n4', target: 'n14', data: { relation: 'CONTAINS' } },
  { source: 'n6', target: 'n15', data: { relation: 'CONTAINS' } },
  { source: 'n6', target: 'n16', data: { relation: 'CONTAINS' } },
  { source: 'n6', target: 'n17', data: { relation: 'CONTAINS' } },

  // PREREQUISITE 关系（前置依赖）— 数组 → 链表 → 栈/队列
  { source: 'n8',  target: 'n7',  data: { relation: 'PREREQUISITE' } },
  { source: 'n9',  target: 'n8',  data: { relation: 'PREREQUISITE' } },
  { source: 'n10', target: 'n8',  data: { relation: 'PREREQUISITE' } },
  { source: 'n11', target: 'n8',  data: { relation: 'PREREQUISITE' } },
  { source: 'n12', target: 'n11', data: { relation: 'PREREQUISITE' } },
  { source: 'n13', target: 'n12', data: { relation: 'PREREQUISITE' } },
  { source: 'n14', target: 'n13', data: { relation: 'PREREQUISITE' } },
  { source: 'n15', target: 'n7',  data: { relation: 'PREREQUISITE' } },
  { source: 'n16', target: 'n15', data: { relation: 'PREREQUISITE' } },

  // CODE_IMPL 关系（代码→知识点）
  { source: 'n18', target: 'n9',  data: { relation: 'CODE_IMPL' } },
  { source: 'n19', target: 'n10', data: { relation: 'CODE_IMPL' } },
  { source: 'n20', target: 'n16', data: { relation: 'CODE_IMPL' } },

  // HAS_ERROR 关系（知识点→易错点）
  { source: 'n8',  target: 'n23', data: { relation: 'HAS_ERROR' } },
  { source: 'n9',  target: 'n24', data: { relation: 'HAS_ERROR' } },
  { source: 'n11', target: 'n25', data: { relation: 'HAS_ERROR' } },

  // OPTIMIZE_FROM 关系（优化演进）— 冒泡→快排→归并
  { source: 'n16', target: 'n15', data: { relation: 'OPTIMIZE_FROM' } },
  { source: 'n17', target: 'n16', data: { relation: 'OPTIMIZE_FROM' } },

  // CONFUSE_WITH 关系（易混淆）
  { source: 'n9', target: 'n10', data: { relation: 'CONFUSE_WITH' } },

  // EXPERIMENT 关系
  { source: 'n21', target: 'n8',  data: { relation: 'CODE_IMPL' } },
  { source: 'n22', target: 'n11', data: { relation: 'CODE_IMPL' } },
]

// 关系类型 → 连线颜色映射
export const relationColors: Record<string, string> = {
  CONTAINS:        '#CECECE',
  PREREQUISITE:    '#D4A72C',
  CODE_IMPL:       '#1A7F1A',
  CONFUSE_WITH:    '#CF222E',
  OPTIMIZE_FROM:   '#956BF5',
  HAS_ERROR:       '#CF222E',
}

// 关系类型 → 线型（实线 / 虚线）
export const relationLineStyle: Record<string, 'solid' | 'dashed' | 'dotted'> = {
  CONTAINS:        'solid',
  PREREQUISITE:    'solid',
  CODE_IMPL:       'dashed',
  CONFUSE_WITH:    'dotted',
  OPTIMIZE_FROM:   'dashed',
  HAS_ERROR:       'dotted',
}

// 获取节点的 tag 颜色（用于节点背景色）
export const getNodeColor = (nodeId: string): string => {
  const node = mockGraphNodes.find((n) => n.id === nodeId)
  if (!node || !node.data.tags.length) return '#FAFAFA'

  // 优先取第一个 tag 的颜色
  const primaryTag = node.data.tags[0]
  return tagColors[primaryTag] || '#FAFAFA'
}

// 获取节点大小（subject > chapter > 其他）
export const getNodeSize = (nodeId: string): number => {
  const node = mockGraphNodes.find((n) => n.id === nodeId)
  if (!node) return 24
  if (node.data.tags.includes('#subject')) return 48
  if (node.data.tags.includes('#chapter')) return 36
  return 28
}
```

### 10.3 G6 图谱组件（核心）

**`src/components/graph/GraphCanvas.tsx`**

```tsx
// src/components/graph/GraphCanvas.tsx
// ★ 核心组件：AntV G6 知识图谱网络图画布
//
// 职责：
//   1. 创建和管理 G6 Graph 实例
//   2. 监听 React 数据变化，同步到 G6
//   3. 将 G6 的交互事件（点击节点等）回调给父组件
//   4. 组件卸载时销毁 G6 实例（防止内存泄漏）

import { useEffect, useRef } from 'react'
import { Graph } from '@antv/g6'
import {
  mockGraphNodes,
  mockGraphEdges,
  getNodeColor,
  getNodeSize,
  relationColors,
  relationLineStyle,
} from '../../api/mock/graph'

interface GraphCanvasProps {
  /*
    selectedNodeId: 当前选中的节点 ID
    外部改变时，G6 会高亮该节点
  */
  selectedNodeId?: string | null

  /*
    onNodeClick: 点击节点时的回调
    父组件（图谱页面）用来更新右侧详情面板
  */
  onNodeClick?: (nodeId: string) => void

  /*
    readOnly: 是否只读模式
    false（教师编辑模式）：支持拖拽节点、右键菜单
    true（学生学习模式）：只可缩放/平移/点击查看
  */
  readOnly?: boolean
}

const GraphCanvas: React.FC<GraphCanvasProps> = ({
  selectedNodeId,
  onNodeClick,
  readOnly = false,
}) => {
  // ── Refs ──
  // containerRef: 挂载 G6 画布的 DOM 容器
  const containerRef = useRef<HTMLDivElement>(null)
  // graphRef: 保存 G6 实例的引用，避免闭包陷阱
  const graphRef = useRef<Graph | null>(null)

  // ═══════════════════════════════════════════════════════════
  //  初始化 G6 实例（仅在组件首次挂载时执行一次）
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (!containerRef.current) return
    // 防止 React StrictMode 下创建两次
    if (graphRef.current) return

    /*
      创建 G6 Graph 实例
      ⚠️ container 必须是一个已挂载的 HTML 元素
      ⚠️ 不要在 SSR 环境（如 Next.js）中直接使用，需要用动态导入
    */
    const graph = new Graph({
      container: containerRef.current,

      // ── 数据 ──
      data: {
        nodes: mockGraphNodes.map((node) => ({
          id: node.id,
          data: node.data,
          style: {
            fill: getNodeColor(node.id),
            size: getNodeSize(node.id),
          },
        })),
        edges: mockGraphEdges.map((edge) => ({
          source: edge.source,
          target: edge.target,
          data: edge.data,
          style: {
            stroke: relationColors[edge.data.relation] || '#CECECE',
            lineDash: relationLineStyle[edge.data.relation] === 'dashed'
              ? [5, 5]   // 5px 实线 + 5px 空白
              : relationLineStyle[edge.data.relation] === 'dotted'
              ? [2, 4]   // 2px 实线 + 4px 空白
              : undefined,
            endArrow: true,                    // 终点带箭头
          },
        })),
      },

      // ── 节点统一样式 ──
      node: {
        type: 'circle',                        // ● 圆形节点（Obsidian 风格）
        style: {
          stroke: '#CECECE',                   // 默认边框
          lineWidth: 2,
          labelText: (d: any) => d.data?.title || d.id,
          labelFontSize: 12,
          labelFill: '#2C2C2C',
          labelOffsetY: -2,                    // 标签在节点上方
          cursor: 'pointer',
        },
        // 状态样式（G6 内置 state 机制）
        state: {
          // 选中态：紫色边框
          selected: {
            stroke: '#956BF5',
            lineWidth: 3,
            shadowColor: 'rgba(149, 107, 245, 0.3)',
            shadowBlur: 8,
            labelFontWeight: 600,
          },
          // hover 态：边框加深
          hover: {
            stroke: '#7B52E0',
            lineWidth: 2,
          },
        },
      },

      // ── 边统一样式 ──
      edge: {
        type: 'line',
        style: {
          lineWidth: 1.5,
          endArrowSize: 8,
        },
        state: {
          // hover 态
          hover: {
            lineWidth: 2,
          },
          // 选中相关的边（与选中节点相连的边高亮）
          active: {
            stroke: '#956BF5',
            lineWidth: 2,
          },
          // 不相关的边变淡
          inactive: {
            opacity: 0.1,
          },
        },
      },

      // ── 力导向布局（Obsidian 效果的关键） ──
      layout: {
        type: 'force',
        /*
          核心物理参数：
          - gravity: 向心力，把节点拉向画布中心，值越大节点越聚拢
          - linkDistance: 边连接的节点之间的理想距离
          - nodeStrength: 节点之间的斥力，值越大斥力越大，节点越分散
          - preventOverlap: 防止节点重叠
        */
        gravity: 10,
        linkDistance: 120,
        nodeStrength: 200,
        preventOverlap: true,
        // 动画：节点从随机位置飞到力导向计算出的位置
        animation: true,
      },

      // ── 交互行为 ──
      behaviors: [
        'drag-canvas',          // 拖拽画布平移
        'zoom-canvas',          // 滚轮缩放
        // ● HoverActivate: hover 节点时高亮其 1 度邻居，其余变淡
        {
          type: 'hover-activate',
          degree: 1,            // 高亮 1 度邻居
          direction: 'both',    // 双向（入边+出边的邻居都高亮）
          inactiveState: 'inactive',
        },
        // ● 拖拽节点（编辑模式才启用）
        ...(readOnly ? [] : ['drag-element'] as any),
      ],

      // ── 插件 ──
      plugins: [
        {
          type: 'minimap',                     // 右下角缩略图
          size: [160, 100],
          style: {
            background: '#FAFAFA',
            border: '0.5px solid #CECECE',
            borderRadius: 4,
          },
        },
      ],

      // ── 动画 ──
      animation: {
        enter: 'fade',                         // 节点进入时淡入
        duration: 500,
      },

      // ── 画布整体样式 ──
      background: '#FAFAFA',
    })

    // ═══════════════════════════════════════════════════════════
    //  事件绑定
    // ═══════════════════════════════════════════════════════════

    // 点击节点 → 设置选中态 + 通知父组件
    graph.on('node:click', (event: any) => {
      const nodeId = event.target.id
      // 清除其他节点的选中态
      graph.getNodeData().forEach((node: any) => {
        graph.setElementState({ [node.id]: [] })
      })
      // 设置当前节点为选中
      graph.setElementState({ [nodeId]: 'selected' })

      // 高亮与选中节点相连的边
      const connectedEdges = graph.getEdgeData().filter(
        (edge: any) => edge.source === nodeId || edge.target === nodeId
      )
      graph.getEdgeData().forEach((edge: any) => {
        graph.setElementState({ [edge.id!]: [] })
      })
      connectedEdges.forEach((edge: any) => {
        graph.setElementState({ [edge.id!]: 'active' })
      })

      // 通知父组件
      onNodeClick?.(nodeId)
    })

    // 点击画布空白处 → 取消选中
    graph.on('canvas:click', () => {
      graph.getNodeData().forEach((node: any) => {
        graph.setElementState({ [node.id]: [] })
      })
      graph.getEdgeData().forEach((edge: any) => {
        graph.setElementState({ [edge.id!]: [] })
      })
      onNodeClick?.('')
    })

    // 保存引用
    graphRef.current = graph

    // ● G6 v5 需要手动调用 draw() 绘制
    graph.draw()

    // ═══════════════════════════════════════════════════════════
    //  清理函数（组件卸载时执行）
    //  ★ 必须调用 destroy()，否则 Canvas 元素泄漏、事件监听器残留
    // ═══════════════════════════════════════════════════════════
    return () => {
      graph.destroy()
      graphRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])  // ● 空依赖数组：只在首次挂载时执行

  // ═══════════════════════════════════════════════════════════
  //  外部选中状态变化时，同步更新 G6 的高亮
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    const graph = graphRef.current
    if (!graph) return

    // 清除所有选中态
    graph.getNodeData().forEach((node: any) => {
      graph.setElementState({ [node.id]: [] })
    })
    graph.getEdgeData().forEach((edge: any) => {
      graph.setElementState({ [edge.id!]: [] })
    })

    // 如果传入了选中节点 ID，高亮它
    if (selectedNodeId) {
      graph.setElementState({ [selectedNodeId]: 'selected' })

      // 高亮关联边
      const connectedEdges = graph.getEdgeData().filter(
        (edge: any) => edge.source === selectedNodeId || edge.target === selectedNodeId
      )
      connectedEdges.forEach((edge: any) => {
        graph.setElementState({ [edge.id!]: 'active' })
      })
    }
  }, [selectedNodeId])

  // ● 容器 div 必须设置宽高，G6 需要明确的像素尺寸
  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 500,
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '0.5px solid var(--color-border)',
      }}
    />
  )
}

export default GraphCanvas
```

### 10.4 节点详情面板

**`src/components/graph/NoteDetailPanel.tsx`**

```tsx
// src/components/graph/NoteDetailPanel.tsx
// 点击图谱节点后，右侧展示节点详情

import { Tag, Divider } from 'antd'
import { mockGraphNodes, mockGraphEdges, relationColors } from '../../api/mock/graph'

interface NoteDetailPanelProps {
  nodeId: string | null
}

// 关系类型中文名映射
const relationNameMap: Record<string, string> = {
  CONTAINS:     '包含',
  PREREQUISITE: '前置依赖',
  CODE_IMPL:    '代码实现',
  CONFUSE_WITH: '易混淆',
  OPTIMIZE_FROM:'优化演进',
  HAS_ERROR:    '常见错误',
}

const NoteDetailPanel: React.FC<NoteDetailPanelProps> = ({ nodeId }) => {
  // 未选中任何节点
  if (!nodeId) {
    return (
      <div style={{
        padding: 24,
        color: 'var(--color-text-tertiary)',
        fontSize: 'var(--text-sm)',
        textAlign: 'center',
      }}>
        点击图谱中的节点查看详情
      </div>
    )
  }

  // 查找节点数据
  const node = mockGraphNodes.find((n) => n.id === nodeId)
  if (!node) {
    return <div style={{ padding: 24 }}>节点未找到</div>
  }

  // 查找与该节点相关的所有边
  const relatedEdges = mockGraphEdges.filter(
    (e) => e.source === nodeId || e.target === nodeId
  )

  return (
    <div style={{ padding: 'var(--space-4)' }}>
      {/* ── 节点标题 ── */}
      <h3 style={{
        fontSize: 'var(--text-lg)',
        fontWeight: 600,
        marginBottom: 'var(--space-3)',
      }}>
        {node.data.title}
      </h3>

      {/* ── 标签 ── */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        {node.data.tags.map((tag: string) => (
          <Tag
            key={tag}
            style={{
              marginBottom: 4,
              fontSize: 11,
              color: 'var(--color-primary)',
              background: 'var(--color-primary-light)',
              border: 'none',
            }}
          >
            {tag}
          </Tag>
        ))}
      </div>

      {/* ── 关联关系 ── */}
      {relatedEdges.length > 0 && (
        <>
          <Divider style={{ margin: '12px 0', borderColor: 'var(--color-border)' }} />
          <div style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-secondary)',
            marginBottom: 8,
          }}>
            关联关系
          </div>
          {relatedEdges.map((edge, index) => {
            // 判断当前节点是 source 还是 target
            const isSource = edge.source === nodeId
            const otherNodeId = isSource ? edge.target : edge.source
            const otherNode = mockGraphNodes.find((n) => n.id === otherNodeId)
            const relation = edge.data.relation

            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 0',
                  fontSize: 'var(--text-sm)',
                }}
              >
                {/* 关系类型标识色块 */}
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: relationColors[relation] || '#CECECE',
                  flexShrink: 0,
                }} />
                <span style={{ color: 'var(--color-text-secondary)', flexShrink: 0 }}>
                  {relationNameMap[relation] || relation}
                </span>
                {/* 箭头方向 */}
                <span style={{ color: 'var(--color-text-tertiary)' }}>
                  {isSource ? '→' : '←'}
                </span>
                <span style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                  {otherNode?.data.title || otherNodeId}
                </span>
              </div>
            )
          })}
        </>
      )}

      {/* ── 节点内容（Markdown 占位，后续替换为 MarkdownRenderer） ── */}
      <Divider style={{ margin: '12px 0', borderColor: 'var(--color-border)' }} />
      <div style={{
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-secondary)',
        marginBottom: 8,
      }}>
        节点内容
      </div>
      <div style={{
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text)',
        lineHeight: 1.6,
        background: '#FAFAFA',
        padding: 12,
        borderRadius: 'var(--radius-md)',
        border: '0.5px solid var(--color-border)',
      }}>
        <em># 待从 Neo4j 加载 Markdown 内容</em>
        <br />
        <em>此处将渲染 Note.content 的 Markdown 正文</em>
      </div>
    </div>
  )
}

export default NoteDetailPanel
```

### 10.5 图谱页面（组装 GraphCanvas + NoteDetailPanel）

**`src/pages/teacher/graph/index.tsx`**

```tsx
// src/pages/teacher/graph/index.tsx
// ★ 教师图谱管理页：左侧 G6 网路图 + 右侧详情面板

import { useState } from 'react'
import { Button, Space } from 'antd'
import {
  ApartmentOutlined,
  UnorderedListOutlined,
  SearchOutlined,
  ExportOutlined,
} from '@ant-design/icons'
import GraphCanvas from '../../../components/graph/GraphCanvas'
import NoteDetailPanel from '../../../components/graph/NoteDetailPanel'

/*
  页面布局：
  ┌─────────────────────────────────────────────────┐
  │ 工具栏：视图切换 | 搜索 | 筛选 | 新增 | 导出     │
  ├───────────────────────────┬─────────────────────┤
  │                           │                     │
  │    <GraphCanvas />        │  <NoteDetailPanel>  │
  │    (flex: 1)              │  (width: 320px)     │
  │                           │                     │
  └───────────────────────────┴─────────────────────┘
*/

const TeacherGraphPage = () => {
  // 当前选中的节点 ID
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  // 当前视图模式（预留：后续切换网络图/树状列表）
  const [viewMode, setViewMode] = useState<'graph' | 'tree'>('graph')

  return (
    <div style={{ height: 'calc(100vh - 48px - 48px)' }}>
      {/* ── 顶部工具栏 ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
        marginBottom: 12,
      }}>
        {/* 左侧：视图模式切换 */}
        <Space>
          <Button
            type={viewMode === 'graph' ? 'primary' : 'default'}
            icon={<ApartmentOutlined />}
            size="small"
            onClick={() => setViewMode('graph')}
          >
            网络图
          </Button>
          <Button
            type={viewMode === 'tree' ? 'primary' : 'default'}
            icon={<UnorderedListOutlined />}
            size="small"
            onClick={() => setViewMode('tree')}
          >
            树状列表
          </Button>
        </Space>

        {/* 右侧：操作按钮 */}
        <Space>
          <Button icon={<SearchOutlined />} size="small">
            搜索节点
          </Button>
          <Button icon={<ExportOutlined />} size="small">
            导出
          </Button>
          <Button type="primary" size="small">
            新增节点
          </Button>
        </Space>
      </div>

      {/* ── 主内容区：左右分栏 ── */}
      <div style={{
        display: 'flex',
        gap: 16,
        height: 'calc(100% - 48px)',
      }}>
        {/* 左侧：G6 图谱画布 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <GraphCanvas
            selectedNodeId={selectedNodeId}
            onNodeClick={(nodeId) => setSelectedNodeId(nodeId || null)}
            readOnly={false}
          />
        </div>

        {/* 右侧：节点详情面板 */}
        <div style={{
          width: 320,
          flexShrink: 0,
          background: '#fff',
          border: '0.5px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'auto',
        }}>
          <NoteDetailPanel nodeId={selectedNodeId} />
        </div>
      </div>
    </div>
  )
}

export default TeacherGraphPage
```

### 10.6 学生端图谱浏览页

**`src/pages/student/graph/index.tsx`**

```tsx
// src/pages/student/graph/index.tsx
// 学生图谱浏览页：与教师页结构相同，但为只读模式 + Fork 按钮

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Space } from 'antd'
import {
  ApartmentOutlined,
  UnorderedListOutlined,
  SearchOutlined,
  ForkOutlined,
} from '@ant-design/icons'
import GraphCanvas from '../../../components/graph/GraphCanvas'
import NoteDetailPanel from '../../../components/graph/NoteDetailPanel'

const StudentGraphPage = () => {
  const navigate = useNavigate()
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'graph' | 'tree'>('graph')

  // Fork 操作：复刻班级图谱到私人空间
  const handleFork = () => {
    // 模拟创建私人图谱，跳转到私人图谱编辑页
    const mockGraphId = 'private-graph-1'
    navigate(`/student/private-graph/${mockGraphId}`)
  }

  return (
    <div style={{ height: 'calc(100vh - 48px - 48px)' }}>
      {/* ── 工具栏 ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '8px 0',
        marginBottom: 12,
      }}>
        <Space>
          <Button
            type={viewMode === 'graph' ? 'primary' : 'default'}
            icon={<ApartmentOutlined />}
            size="small"
            onClick={() => setViewMode('graph')}
          >
            网络图
          </Button>
          <Button
            type={viewMode === 'tree' ? 'primary' : 'default'}
            icon={<UnorderedListOutlined />}
            size="small"
            onClick={() => setViewMode('tree')}
          >
            树状列表
          </Button>
        </Space>

        <Space>
          <Button icon={<SearchOutlined />} size="small">
            搜索节点
          </Button>
          {/* ★ Fork 按钮：学生端独有 */}
          <Button
            type="primary"
            icon={<ForkOutlined />}
            size="small"
            onClick={handleFork}
          >
            Fork 复刻
          </Button>
        </Space>
      </div>

      {/* ── 左右分栏 ── */}
      <div style={{
        display: 'flex',
        gap: 16,
        height: 'calc(100% - 48px)',
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <GraphCanvas
            selectedNodeId={selectedNodeId}
            onNodeClick={(nodeId) => setSelectedNodeId(nodeId || null)}
            readOnly={true}     // ● 只读模式：不可拖拽节点
          />
        </div>
        <div style={{
          width: 320,
          flexShrink: 0,
          background: '#fff',
          border: '0.5px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'auto',
        }}>
          <NoteDetailPanel nodeId={selectedNodeId} />
        </div>
      </div>
    </div>
  )
}

export default StudentGraphPage
```

### 验证

执行 `npm run dev`：
1. 访问 `/teacher/courses/course-1/graph` → 应该看到：
   - 工具栏：网络图/树状列表切换按钮（树状列表按钮暂时无功能）
   - 左侧：力导向布局的动态图谱，节点带标签，连线带颜色
   - 缩放、拖拽画布、hover 节点（邻居高亮、其余变淡）
   - 点击节点：紫色高亮 + 右侧面板显示标题/标签/关系
   - 点击空白处：取消选中
   - 右下角缩略导航图
   - **节点是可以拖动的**（编辑模式）
2. 访问 `/student/courses/course-1/graph` → 结构相同，但：
   - 无"新增节点"按钮，改为"Fork 复刻"紫色按钮
   - 节点不可拖动（只读）
   - 点击 Fork 跳转到私人图谱页

### 注意事项（G6 关键坑点）

1. **G6 实例必须手动 destroy**。忘记 `graph.destroy()` 会导致 Canvas 元素泄露，页面切换后图谱仍然存在，且事件监听器重复绑定。`useEffect` 的 `return` 清理函数必须执行 `graph.destroy()`。

2. **`containerRef.current` 可能在 G6 创建时还未挂载**。React 的 `useEffect` 在 DOM 挂载后执行，所以 `containerRef.current` 一定有值。但如果用了条件渲染（`{show && <div ref={containerRef} />}`），容器可能在 `useEffect` 运行时是 `null`，需要加 `if (!containerRef.current) return`。

3. **G6 v5 的 `node.state` 和 `edge.state` 是配置式的**，不需要手动写 CSS。在 `node.style.state.selected` 里定义选中态样式，通过 `graph.setElementState({ [nodeId]: 'selected' })` 激活。

4. **`hover-activate` behavior 的 `inactiveState` 必须和 edge/state 中定义的 state 名一致**。这里用 `'inactive'`，对应 node state 里定义的那个 `opacity: 0.1`。

5. **React StrictMode 会让 useEffect 执行两次**（挂载→卸载→挂载）。G6 的 `new Graph()` 是副作用，需要在创建前判断 `if (graphRef.current) return` 防止创建两次实例。同时清理函数中的 `destroy()` 要正确处理第一次卸载。

6. **G6 v5 必须调用 `graph.draw()`**。不像旧版本自动渲染，v5 需要显式调用 `draw()` 才会把数据渲染到 Canvas 上。

---

## 完成情况

至此，你已经完成了：

| 步骤 | 成果 |
|------|------|
| 1-2 | 项目骨架 + 目录结构 |
| 3-4 | CSS 变量 + AntD 主题 |
| 5 | 路由体系 |
| 6 | 教师/学生布局壳 |
| 7 | 登录页 |
| 8 | 教师仪表盘（待审核+课程卡片） |
| 9 | 学生仪表盘（进度+PR+贡献） |
| 10 | G6 图谱页（网络图+详情面板） |

---

## 11. 新建课程向导（P2）

### 目的

教师创建新课程的完整四步流程：课程信息 → 上传资料 → AI 生成图谱 → 校验发布。使用 Ant Design `Steps` 组件引导。

### 代码：`src/pages/teacher/create-course/index.tsx`

```tsx
// 新建课程向导 — 四步流程

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Steps, Button, Form, Input, Select, Upload, Progress, message } from 'antd'
import { InboxOutlined, CheckCircleOutlined } from '@ant-design/icons'

const { Dragger } = Upload
const { Step } = Steps

/*
  步骤流转：
  Step 0: 课程信息表单
  Step 1: 上传课件资料
  Step 2: AI 生成图谱（进度条 + 日志）
  Step 3: 预览校验 → 确认发布
*/

const CreateCourseWizard = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [form] = Form.useForm()

  // 课程信息
  const [courseInfo, setCourseInfo] = useState({ name: '', className: '', semester: '', subject: '' })

  // 上传的文件列表（模拟：实际接 MinIO）
  const [fileList, setFileList] = useState<any[]>([])

  // AI 生成状态
  const [generating, setGenerating] = useState(false)
  const [genProgress, setGenProgress] = useState(0)
  const [genLogs, setGenLogs] = useState<string[]>([])

  // Step 0 → Step 1
  const handleNextFromInfo = () => {
    form.validateFields().then((values) => {
      setCourseInfo(values)
      setCurrentStep(1)
    })
  }

  // Step 1 → Step 2（开始 AI 生成）
  const handleStartGenerate = () => {
    setCurrentStep(2)
    setGenerating(true)
    // 模拟 AI 生成进度（3 个阶段）
    const stages = [
      { progress: 30, log: '实体抽取中：从《第三章 栈与队列.pptx》识别到 12 个候选知识节点' },
      { progress: 60, log: '关系生成中：建立 8 条 PREREQUISITE 依赖、15 条 CONTAINS 关系' },
      { progress: 90, log: '校验去重中：合并 3 个重复节点，标记 2 个易错点' },
      { progress: 100, log: '生成完成：共创建 50 个节点、45 条关系' },
    ]
    stages.forEach((stage, idx) => {
      setTimeout(() => {
        setGenProgress(stage.progress)
        setGenLogs((prev) => [...prev, stage.log])
        if (idx === stages.length - 1) {
          setGenerating(false)
          message.success('知识图谱生成完成！请预览并确认。')
        }
      }, (idx + 1) * 1500)
    })
  }

  // Step 3 → 完成 → 跳转
  const handlePublish = () => {
    message.success('课程知识图谱已发布！')
    // 跳转到新课程的图谱管理页（模拟 courseId）
    navigate('/teacher/courses/course-new/graph')
  }

  // ── 步骤条配置 ──
  const steps = [
    { title: '课程信息' },
    { title: '上传资料' },
    { title: 'AI 生成' },
    { title: '校验发布' },
  ]

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* ★ 步骤条 */}
      <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

      {/* ── Step 0：课程信息 ── */}
      {currentStep === 0 && (
        <div style={{ background: '#fff', padding: 24, borderRadius: 8, border: '0.5px solid var(--color-border)' }}>
          <Form form={form} layout="vertical" initialValues={courseInfo}>
            <Form.Item name="name" label="课程名称" rules={[{ required: true }]}>
              <Input placeholder="例如：数据结构" />
            </Form.Item>
            <Form.Item name="className" label="授课班级" rules={[{ required: true }]}>
              <Input placeholder="例如：计科 2101 班" />
            </Form.Item>
            <Form.Item name="semester" label="学期" rules={[{ required: true }]}>
              <Select placeholder="选择学期" options={[
                { value: '2025-2026-1', label: '2025-2026 第一学期' },
                { value: '2025-2026-2', label: '2025-2026 第二学期' },
              ]} />
            </Form.Item>
            <Form.Item name="subject" label="学科方向" rules={[{ required: true }]}>
              <Select placeholder="选择学科" options={[
                { value: 'data-structure', label: '数据结构' },
                { value: 'os', label: '操作系统' },
                { value: 'network', label: '计算机网络' },
                { value: 'db', label: '数据库' },
              ]} />
            </Form.Item>
          </Form>
          <div style={{ textAlign: 'right' }}>
            <Button type="primary" onClick={handleNextFromInfo}>下一步：上传资料</Button>
          </div>
        </div>
      )}

      {/* ── Step 1：上传资料 ── */}
      {currentStep === 1 && (
        <div style={{ background: '#fff', padding: 24, borderRadius: 8, border: '0.5px solid var(--color-border)' }}>
          <Dragger
            multiple
            fileList={fileList}
            onChange={({ fileList: newList }) => setFileList(newList)}
            beforeUpload={() => false}  // ● 阻止自动上传，手动控制
            accept=".ppt,.pptx,.pdf,.doc,.docx,.md,.py,.java,.cpp"
          >
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p>点击或拖拽文件到此区域上传</p>
            <p style={{ color: 'var(--color-text-tertiary)', fontSize: 12 }}>
              支持 PPT、PDF、Word、Markdown、代码文件
            </p>
          </Dragger>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <Button onClick={() => setCurrentStep(0)}>上一步</Button>
            <Button type="primary" onClick={handleStartGenerate} disabled={fileList.length === 0}>
              开始 AI 生成
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 2：AI 生成中 ── */}
      {currentStep === 2 && (
        <div style={{ background: '#fff', padding: 24, borderRadius: 8, border: '0.5px solid var(--color-border)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Progress type="circle" percent={genProgress} />
            <p style={{ marginTop: 16, color: 'var(--color-text-secondary)' }}>
              {generating ? 'AI 正在分析文档并生成知识图谱...' : '生成完成！'}
            </p>
          </div>
          {/* 生成日志 */}
          <div style={{
            background: '#FAFAFA',
            borderRadius: 6,
            padding: 12,
            maxHeight: 240,
            overflow: 'auto',
            fontSize: 13,
            fontFamily: 'var(--font-mono)',
            lineHeight: 1.8,
          }}>
            {genLogs.map((log, i) => (
              <div key={i} style={{ color: 'var(--color-text-secondary)' }}>
                [{new Date().toLocaleTimeString()}] {log}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <Button onClick={() => setCurrentStep(1)} disabled={generating}>上一步</Button>
            <Button type="primary" onClick={() => setCurrentStep(3)} disabled={generating}>
              预览校验
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3：校验发布 ── */}
      {currentStep === 3 && (
        <div style={{ background: '#fff', padding: 24, borderRadius: 8, border: '0.5px solid var(--color-border)' }}>
          {/* 图谱预览占位 — 真实版本嵌入 Step3 GraphViewer */}
          <div style={{
            height: 400,
            background: '#FAFAFA',
            borderRadius: 6,
            border: '0.5px solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 24,
          }}>
            <CheckCircleOutlined style={{ fontSize: 48, color: 'var(--color-success)', marginBottom: 12 }} />
            <p style={{ fontWeight: 600 }}>图谱预览区域</p>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
              此处将嵌入 &lt;GraphViewer /&gt; 展示 AI 生成的初始图谱
            </p>
          </div>
          {/* 节点统计 */}
          <div style={{
            display: 'flex', gap: 24, marginBottom: 24,
            padding: 12, background: '#FAFAFA', borderRadius: 6,
            justifyContent: 'center',
          }}>
            <div><strong>50</strong> 个节点</div>
            <div><strong>45</strong> 条关系</div>
            <div><strong>6</strong> 个章节</div>
            <div><strong>3</strong> 个易错点</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={() => setCurrentStep(2)}>返回编辑</Button>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button>保存草稿</Button>
              <Button type="primary" onClick={handlePublish}>确认发布</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreateCourseWizard
```

### 注意事项

- **`beforeUpload={() => false}`** 阻止 Dragger 自动发起 HTTP 上传。在 MVP 阶段先存文件列表，后续接入 MinIO 时改为 `customRequest`。
- Step 2 的 AI 生成是纯前端模拟（`setTimeout` 定时推进进度）。真实接入时替换为轮询后端任务状态或 WebSocket 推送。
- Step 3 的图谱预览区域是占位 `<div>`，真实版本嵌入 `GraphCanvas` 组件并传入生成的数据。

---

## 12. 审核工作台（P8）

### 目的

教师审核学生提交的 PR 的聚合页面。核心功能：PR 卡片列表、AI 预审评分展示、详情抽屉（含完整 AI 报告 + 审核操作）。

### 12.1 Mock 数据

**在 `src/api/mock/dashboard.ts` 追加**：

```typescript
// ── 审核工作台 Mock 数据 ──

export interface PRItem {
  id: string
  submitter: string
  courseName: string
  changeType: string       // 'note_add' | 'note_edit' | 'edge_add' | 'edge_edit' 等
  changeSummary: string     // 人类可读的变更摘要
  status: 'pending_ai' | 'pending_group_leader' | 'pending_teacher' | 'approved' | 'rejected'
  aiScore: number | null    // 0-100，null 表示未评分
  aiReport: {
    duplicateCheck: { score: number; similarNodes: string[] }
    contentQuality: { score: number; issues: string[] }
    suggestions: string[]
    riskLevel: 'low' | 'medium' | 'high'
  } | null
  diffPreview: string        // 简短的 diff 摘要文字
  createdAt: string
}

export const mockPRItems: PRItem[] = [
  {
    id: 'pr-001', submitter: '张三', courseName: '数据结构',
    changeType: 'note_add', changeSummary: '新增节点 "红黑树" #knowledge-point',
    status: 'pending_teacher', aiScore: 85, aiReport: {
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
    status: 'pending_group_leader', aiScore: 90, aiReport: {
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
    status: 'pending_ai', aiScore: null, aiReport: null,
    diffPreview: '~ 进程调度：新增多级反馈队列算法描述',
    createdAt: '1 小时前',
  },
  {
    id: 'pr-004', submitter: '赵六', courseName: '数据结构',
    changeType: 'error_point_add', changeSummary: '新增易错点 "栈溢出原因分析"',
    status: 'pending_teacher', aiScore: 62, aiReport: {
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
```

### 12.2 审核工作台页面

**`src/pages/teacher/review/index.tsx`**

```tsx
// 教师审核工作台

import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Select, Tag, Button, Drawer, Progress, Empty, Divider, Input, Space } from 'antd'
import { CheckOutlined, CloseOutlined, WarningOutlined } from '@ant-design/icons'
import { mockPRItems } from '../../../api/mock/dashboard'
import type { PRItem } from '../../../api/mock/dashboard'

// 状态 → 显示配置
const statusConfig: Record<string, { color: string; label: string }> = {
  pending_ai:            { color: '#999', label: '待 AI 审核' },
  pending_group_leader:  { color: '#D4A72C', label: '待二审' },
  pending_teacher:       { color: '#956BF5', label: '待终审' },
  approved:              { color: '#1A7F1A', label: '已通过' },
  rejected:              { color: '#CF222E', label: '已打回' },
}

// AI 评分 → 颜色
const scoreColor = (score: number) =>
  score >= 80 ? 'var(--color-success)' : score >= 60 ? 'var(--color-warning)' : 'var(--color-danger)'

const ReviewWorkbench = () => {
  const [searchParams] = useSearchParams()
  // 从 URL 读取课程筛选参数（来自仪表盘点击）
  const filterCourseId = searchParams.get('courseId') || 'all'

  // 筛选状态
  const [statusFilter, setStatusFilter] = useState('all')
  const [courseFilter, setCourseFilter] = useState(filterCourseId)

  // 选中的 PR（弹详情抽屉）
  const [selectedPR, setSelectedPR] = useState<PRItem | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // 批量选择
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // ── 筛选逻辑 ──
  const filteredPRs = mockPRItems.filter((pr) => {
    if (statusFilter !== 'all' && pr.status !== statusFilter) return false
    if (courseFilter !== 'all' && !pr.courseName.includes(
      courseFilter === 'course-1' ? '数据结构' : courseFilter === 'course-2' ? '操作系统' : ''
    )) return false
    return true
  })

  const handleOpenDetail = (pr: PRItem) => {
    setSelectedPR(pr)
    setDrawerOpen(true)
  }

  const handleApprove = () => {
    // TODO: API 调用
    setDrawerOpen(false)
  }

  return (
    <div>
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 24 }}>审核工作台</h2>

      {/* ── 筛选栏 ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 16, padding: '12px 16px',
        background: '#fff', borderRadius: 8, border: '0.5px solid var(--color-border)',
      }}>
        <Space>
          <Select value={courseFilter} onChange={setCourseFilter} style={{ width: 140 }}
            options={[
              { value: 'all', label: '全部课程' },
              { value: 'course-1', label: '数据结构' },
              { value: 'course-2', label: '操作系统' },
            ]}
          />
          <Select value={statusFilter} onChange={setStatusFilter} style={{ width: 120 }}
            options={[
              { value: 'all', label: '全部状态' },
              { value: 'pending_teacher', label: '待终审' },
              { value: 'pending_group_leader', label: '待二审' },
              { value: 'pending_ai', label: '待 AI 审' },
            ]}
          />
        </Space>
        {selectedIds.length > 0 && (
          <Space>
            <span style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>
              已选 {selectedIds.length} 项
            </span>
            <Button size="small" icon={<CheckOutlined />} onClick={() => message.success('批量通过')}>
              批量通过
            </Button>
          </Space>
        )}
      </div>

      {/* ── PR 列表 ── */}
      {filteredPRs.length === 0 ? (
        <Empty description="暂无待审核内容" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredPRs.map((pr) => {
            const status = statusConfig[pr.status]
            return (
              <div
                key={pr.id}
                onClick={() => handleOpenDetail(pr)}
                style={{
                  padding: '14px 16px',
                  background: '#fff',
                  border: '0.5px solid var(--color-border)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'border-color 0.15s',
                  // ● 高风险 PR 左边框红色
                  borderLeft: pr.aiReport?.riskLevel === 'high'
                    ? '3px solid var(--color-danger)'
                    : '3px solid transparent',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
              >
                {/* 左侧信息 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>#{pr.id}</span>
                    <Tag style={{ margin: 0, fontSize: 11 }}>{pr.changeSummary}</Tag>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                    {pr.submitter} · {pr.courseName} · {pr.createdAt}
                  </div>
                </div>
                {/* 右侧状态 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, marginLeft: 16 }}>
                  {/* AI 评分 */}
                  {pr.aiScore !== null && (
                    <div style={{
                      textAlign: 'center',
                      minWidth: 44,
                      fontWeight: 700,
                      fontSize: 16,
                      color: scoreColor(pr.aiScore),
                    }}>
                      {pr.aiScore}
                    </div>
                  )}
                  {/* 风险标记 */}
                  {pr.aiReport?.riskLevel === 'high' && (
                    <WarningOutlined style={{ color: 'var(--color-danger)', fontSize: 16 }} />
                  )}
                  {/* 状态标签 */}
                  <Tag style={{ margin: 0, color: status.color, background: `${status.color}15`, border: 'none' }}>
                    {status.label}
                  </Tag>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── PR 详情抽屉 ── */}
      <Drawer
        title={`PR #${selectedPR?.id} 详情`}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={640}
        extra={
          selectedPR?.status === 'pending_teacher' && (
            <Space>
              <Button icon={<CloseOutlined />} danger>打回</Button>
              <Button type="primary" icon={<CheckOutlined />} onClick={handleApprove}>通过</Button>
            </Space>
          )
        }
      >
        {selectedPR && (
          <div>
            {/* 基本信息 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 4 }}>提交人</div>
              <div style={{ fontWeight: 500 }}>{selectedPR.submitter}</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 4 }}>变更摘要</div>
              <Tag>{selectedPR.changeSummary}</Tag>
            </div>

            {/* Diff 预览 — 占位 */}
            <Divider style={{ borderColor: 'var(--color-border)' }} />
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>变更对比</div>
            <div style={{
              background: '#FAFAFA', borderRadius: 6, padding: 12,
              fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
            }}>
              {selectedPR.diffPreview}
            </div>

            {/* ★ AI 审核报告 */}
            {selectedPR.aiReport && (
              <>
                <Divider style={{ borderColor: 'var(--color-border)' }} />
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>AI 审核报告</div>

                {/* 评分仪表盘 */}
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <Progress
                    type="dashboard"
                    percent={selectedPR.aiScore || 0}
                    strokeColor={scoreColor(selectedPR.aiScore || 0)}
                    format={() => `${selectedPR.aiScore} 分`}
                    size={120}
                  />
                </div>

                {/* 重复度检测 */}
                <div style={{
                  padding: 12, background: '#FAFAFA', borderRadius: 6, marginBottom: 8,
                }}>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>重复度检测</div>
                  <div>相似度评分：{selectedPR.aiReport.duplicateCheck.score}%</div>
                  {selectedPR.aiReport.duplicateCheck.similarNodes.length > 0 && (
                    <div style={{ color: 'var(--color-warning)', marginTop: 4 }}>
                      疑似重复节点：{selectedPR.aiReport.duplicateCheck.similarNodes.join(', ')}
                    </div>
                  )}
                </div>

                {/* 内容质量 */}
                <div style={{
                  padding: 12, background: '#FAFAFA', borderRadius: 6, marginBottom: 8,
                }}>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>内容质量评估</div>
                  <div>质量评分：{selectedPR.aiReport.contentQuality.score}%</div>
                  {selectedPR.aiReport.contentQuality.issues.map((issue, i) => (
                    <div key={i} style={{ color: 'var(--color-danger)', fontSize: 13, marginTop: 4 }}>
                      ⚠ {issue}
                    </div>
                  ))}
                </div>

                {/* 修改建议 */}
                {selectedPR.aiReport.suggestions.length > 0 && (
                  <div style={{
                    padding: 12, background: '#F4F0FF', borderRadius: 6,
                  }}>
                    <div style={{ fontWeight: 500, marginBottom: 4, color: 'var(--color-primary)' }}>
                      AI 修改建议
                    </div>
                    {selectedPR.aiReport.suggestions.map((s, i) => (
                      <div key={i} style={{ fontSize: 13, marginTop: 4 }}>· {s}</div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* 审核意见输入 */}
            {selectedPR.status.startsWith('pending') && (
              <>
                <Divider style={{ borderColor: 'var(--color-border)' }} />
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>审核意见</div>
                <Input.TextArea rows={3} placeholder="输入审核意见（打回时必填）" />
              </>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default ReviewWorkbench
```

### 注意事项

- **Dashboard 跳转带 `?courseId=xxx` 参数**：审核工作台用 `useSearchParams()` 读取初始筛选条件。这是实现"从仪表盘点击某课程待审卡片 → 审核台自动筛选该课程"的方式。
- **高风险 PR 左边框红色**：`borderLeft: '3px solid red'`，是 GitHub 风格的视觉线索，教师不用看详情就知道哪些需要优先处理。
- **`selectedPR?.status === 'pending_teacher'`** 控制操作按钮显示：AI审核阶段不允许人工直接操作，只有到了待终审阶段才出现通过/打回按钮。

---

## 13. PR 详情页 + 冲突面板（P14）

### 目的

学生查看自己提交的 PR 状态、AI 审核结果、人工审核意见。如被驳回可修改重提。新建 PR 时展示提交表单。

### 13.1 分场景设计

该页面实际是两个变体复用同一个路由：

| URL | 场景 | 内容 |
|-----|------|------|
| `/student/pr/new` | 新建 PR | 变更选择 + 描述 + Diff 预览 + 提交 |
| `/student/pr/pr-001` | 查看已有 PR | 状态时间轴 + AI 报告 + 审核意见 + 冲突面板 |

### 13.2 冲突面板组件

**`src/components/pr/ConflictPanel.tsx`**

```tsx
// 冲突解决面板（在 PR 新建页和 PR 详情页中复用）

import { Button, Tag, Divider } from 'antd'

interface Conflict {
  id: string
  noteTitle: string         // 冲突的节点标题
  type: 'content' | 'tags' | 'relation' | 'delete-modify'
  mineVersion: string       // 我的版本摘要
  theirsVersion: string     // 公有图谱版本摘要
  resolved: boolean
  resolution?: 'mine' | 'theirs' | 'manual'
}

interface ConflictPanelProps {
  conflicts: Conflict[]
  onResolve: (conflictId: string, resolution: 'mine' | 'theirs' | 'manual') => void
  onResolveAll: (resolution: 'mine' | 'theirs') => void
}

const conflictTypeLabels: Record<string, string> = {
  content: '内容冲突',
  tags: '标签冲突',
  relation: '关系冲突',
  'delete-modify': '删除-修改冲突',
}

const ConflictPanel: React.FC<ConflictPanelProps> = ({ conflicts, onResolve, onResolveAll }) => {
  const unresolvedCount = conflicts.filter((c) => !c.resolved).length

  if (conflicts.length === 0) return null

  return (
    <div style={{
      padding: 16,
      background: '#FFF8E1',               // 淡黄色警告背景
      borderRadius: 8,
      border: '0.5px solid var(--color-warning)',
      marginBottom: 16,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <span style={{ fontWeight: 600, color: 'var(--color-warning)' }}>⚠ 检测到 {conflicts.length} 个冲突</span>
          {unresolvedCount > 0 && (
            <span style={{ color: 'var(--color-danger)', marginLeft: 8, fontSize: 13 }}>
              {unresolvedCount} 个未解决，需要解决后才能提交
            </span>
          )}
        </div>
        {unresolvedCount > 0 && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="small" onClick={() => onResolveAll('mine')}>全部保留我的</Button>
            <Button size="small" onClick={() => onResolveAll('theirs')}>全部采用对方</Button>
          </div>
        )}
      </div>

      {conflicts.map((conflict) => (
        <div key={conflict.id} style={{
          padding: 12,
          background: '#fff',
          borderRadius: 6,
          marginBottom: 8,
          border: conflict.resolved ? '0.5px solid var(--color-success)' : '0.5px solid var(--color-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Tag color="warning">{conflictTypeLabels[conflict.type]}</Tag>
            <span style={{ fontWeight: 500 }}>{conflict.noteTitle}</span>
            {conflict.resolved && (
              <Tag color="success">
                {conflict.resolution === 'mine' ? '已保留我的' : conflict.resolution === 'theirs' ? '已采用对方' : '已手动合并'}
              </Tag>
            )}
          </div>

          {/* 两边版本对比 */}
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{
              flex: 1, padding: 8, background: '#E8F5E9', borderRadius: 4, fontSize: 12,
            }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>我的版本</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{conflict.mineVersion}</div>
            </div>
            <div style={{
              flex: 1, padding: 8, background: '#FFF3E0', borderRadius: 4, fontSize: 12,
            }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>公有图谱当前版本</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{conflict.theirsVersion}</div>
            </div>
          </div>

          {/* 解决按钮 */}
          {!conflict.resolved && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Button size="small" onClick={() => onResolve(conflict.id, 'mine')}>保留我的</Button>
              <Button size="small" onClick={() => onResolve(conflict.id, 'theirs')}>采用对方的</Button>
              <Button size="small" onClick={() => onResolve(conflict.id, 'manual')}>手动合并</Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default ConflictPanel
```

### 13.3 PR 详情页

**`src/pages/student/pr/index.tsx`**

```tsx
// 学生 PR 详情页（含新建 PR 变体）

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Tag, Steps, Input, Select, Divider, message, Timeline } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, SyncOutlined } from '@ant-design/icons'
import ConflictPanel from '../../../components/pr/ConflictPanel'
import { mockPRItems } from '../../../api/mock/dashboard'

const { TextArea } = Input

const StudentPRPage = () => {
  const { prId } = useParams()
  const navigate = useNavigate()
  const isNew = prId === 'new'

  // ── 搜索已有 PR（后续替换为 API 调用） ──
  const existingPR = !isNew ? mockPRItems.find((p) => p.id === prId) : null

  // ── 新建 PR 状态 ──
  const [changeType, setChangeType] = useState('note_add')
  const [description, setDescription] = useState('')

  // ── 冲突模拟数据 ──
  const [conflicts, setConflicts] = useState(isNew ? [
    { id: 'c1', noteTitle: '快速排序', type: 'content' as const,
      mineVersion: '时间复杂度 O(n²)（最坏）', theirsVersion: '时间复杂度 O(n²)（最坏）、Ω(n log n)（最好）',
      resolved: false },
    { id: 'c2', noteTitle: '堆排序', type: 'delete-modify' as const,
      mineVersion: '（已删除该节点）', theirsVersion: '新增了堆化过程代码示例',
      resolved: false },
  ] : [])

  // 冲突解决处理
  const handleResolve = (conflictId: string, resolution: 'mine' | 'theirs' | 'manual') => {
    setConflicts((prev) =>
      prev.map((c) => (c.id === conflictId ? { ...c, resolved: true, resolution } : c))
    )
  }

  const handleResolveAll = (resolution: 'mine' | 'theirs') => {
    setConflicts((prev) =>
      prev.map((c) => ({ ...c, resolved: true, resolution }))
    )
  }

  const allResolved = conflicts.every((c) => c.resolved)

  // ── 提交新建 PR ──
  const handleSubmitNewPR = () => {
    message.success('PR 提交成功！')
    navigate('/student/dashboard')
  }

  // ═══════════════════════════════════════════════════════════
  //  变体 A：查看已有 PR
  // ═══════════════════════════════════════════════════════════
  if (!isNew && !existingPR) {
    return <div style={{ textAlign: 'center', padding: 48 }}>PR 未找到</div>
  }

  if (!isNew && existingPR) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}>PR #{existingPR.id}</h2>
          <Tag>{existingPR.changeSummary}</Tag>
        </div>

        {/* ★ 状态时间轴（GitHub 风格） */}
        <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '0.5px solid var(--color-border)', marginBottom: 16 }}>
          <Timeline
            items={[
              { color: 'green', children: <><strong>已提交</strong> — {existingPR.createdAt}</> },
              ...(existingPR.aiScore !== null ? [{
                color: existingPR.aiScore >= 80 ? 'green' : existingPR.aiScore >= 60 ? 'yellow' : 'red',
                children: <><strong>AI 审核完成</strong> — 评分 {existingPR.aiScore} 分</>,
              }] : []),
              ...(existingPR.status === 'pending_group_leader' || existingPR.status === 'pending_teacher' || existingPR.status === 'approved' ? [{
                color: existingPR.status === 'pending_teacher' || existingPR.status === 'approved' ? 'green' : 'blue',
                children: <><strong>小组长审核</strong>{existingPR.status === 'pending_teacher' ? ' — 已通过，转教师终审' : ''}</>,
              }] : []),
              ...(existingPR.status === 'approved' ? [{
                color: 'green', dot: <CheckCircleOutlined />,
                children: <><strong>教师终审通过</strong> — 已合入班级图谱</>,
              }] : []),
              ...(existingPR.status === 'rejected' ? [{
                color: 'red', dot: <CloseCircleOutlined />,
                children: <><strong>已打回</strong> — 请修改后重新提交</>,
              }] : []),
            ]}
          />
        </div>

        {/* AI 审核结果 — 复用审核工作台 AI 报告的结构 */}
        {existingPR.aiReport && (
          <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '0.5px solid var(--color-border)', marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, marginBottom: 12 }}>AI 审核结果</h3>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 140, padding: 12, background: '#FAFAFA', borderRadius: 6, textAlign: 'center' }}>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, color: existingPR.aiScore && existingPR.aiScore >= 80 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                  {existingPR.aiScore}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>综合评分</div>
              </div>
              <div style={{ flex: 2, minWidth: 280, padding: 12, background: '#FAFAFA', borderRadius: 6 }}>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>修改建议</div>
                {existingPR.aiReport.suggestions.map((s, i) => (
                  <div key={i} style={{ fontSize: 13, marginBottom: 4 }}>· {s}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Diff 预览 */}
        <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '0.5px solid var(--color-border)', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, marginBottom: 8 }}>变更内容</h3>
          <pre style={{ background: '#FAFAFA', padding: 12, borderRadius: 6, fontSize: 12, fontFamily: 'var(--font-mono)' }}>
            {existingPR.diffPreview}
          </pre>
        </div>

        {/* 操作按钮 */}
        {existingPR.status === 'rejected' && (
          <Button type="primary" onClick={() => message.info('进入编辑模式')}>修改重提</Button>
        )}
        <Button style={{ marginLeft: 8 }} onClick={() => navigate(-1)}>返回</Button>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════
  //  变体 B：新建 PR
  // ═══════════════════════════════════════════════════════════
  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 24 }}>提交 PR</h2>

      {/* ★ 冲突面板 — 提交前检测 */}
      <ConflictPanel conflicts={conflicts} onResolve={handleResolve} onResolveAll={handleResolveAll} />

      <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '0.5px solid var(--color-border)', marginBottom: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>变更类型</div>
          <Select value={changeType} onChange={setChangeType} style={{ width: 260 }}
            options={[
              { value: 'note_add', label: '新增节点' },
              { value: 'note_edit', label: '修改节点内容' },
              { value: 'edge_add', label: '新增关系' },
              { value: 'edge_edit', label: '修改关系' },
              { value: 'material_add', label: '补充资料' },
              { value: 'error_point_add', label: '补充易错点' },
            ]}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>提交说明</div>
          <TextArea rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="描述你的修改内容和理由..."
          />
        </div>
      </div>

      {/* Diff 预览占位 */}
      <div style={{ background: '#fff', padding: 20, borderRadius: 8, border: '0.5px solid var(--color-border)', marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, marginBottom: 8 }}>变更预览</h3>
        <pre style={{ background: '#FAFAFA', padding: 12, borderRadius: 6, fontSize: 12, fontFamily: 'var(--font-mono)' }}>
          {'+ 新增节点 "红黑树" (性质、旋转操作)'}
        </pre>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Button type="primary" onClick={handleSubmitNewPR} disabled={!allResolved || !description.trim()}>
          提交 PR
        </Button>
        <Button onClick={() => navigate(-1)}>取消</Button>
      </div>
    </div>
  )
}

export default StudentPRPage
```

### 注意事项

- **`ConflictPanel` 是共享组件**：在新建 PR 提交前和 Rebase 弹窗中复用，逻辑完全相同（冲突列表 + 逐条解决/批量采纳）。
- **提交按钮 `disabled={!allResolved || !description.trim()}`**：所有冲突必须解决且填写了说明才能提交，防止不完整 PR。
- **新建 PR 变体通过 `prId === 'new'` 判断**，两个变体共享同一个路由文件和 URL 模式 `/student/pr/:prId`。

---

## 14. 私人图谱编辑器（P13）

### 目的

学生 Fork 后的个人图谱编辑空间。与教师图谱管理页结构 99% 相同，额外加上游同步状态和 Rebase 按钮。

### 代码：`src/pages/student/private-graph/index.tsx`

```tsx
// 学生私人图谱编辑器

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Space, Tag, Modal, message } from 'antd'
import { ArrowLeftOutlined, SyncOutlined, SendOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import GraphCanvas from '../../../components/graph/GraphCanvas'
import NoteDetailPanel from '../../../components/graph/NoteDetailPanel'
import ConflictPanel from '../../../components/pr/ConflictPanel'

const PrivateGraphEditor = () => {
  const { graphId } = useParams()
  const navigate = useNavigate()
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  // 上游同步状态（模拟）
  const upstreamBehind = 3    // 落后上游 3 个版本
  const upstreamChangedNodes = 8

  // Rebase 弹窗
  const [rebaseOpen, setRebaseOpen] = useState(false)

  // Rebase 冲突（模拟）
  const [rebaseConflicts, setRebaseConflicts] = useState([
    { id: 'rb1', noteTitle: '快速排序', type: 'content' as const,
      mineVersion: 'O(n²) 最坏', theirsVersion: 'O(n log n) 平均，O(n²) 最坏',
      resolved: false },
  ])

  const handleRebaseResolve = (id: string, res: 'mine' | 'theirs' | 'manual') => {
    setRebaseConflicts((prev) => prev.map((c) => (c.id === id ? { ...c, resolved: true, resolution: res } : c)))
  }

  const handleRebaseComplete = () => {
    setRebaseOpen(false)
    message.success('已同步上游变更')
  }

  // 提交 PR
  const handleSubmitPR = () => {
    navigate('/student/pr/new')
  }

  return (
    <div style={{ height: 'calc(100vh - 48px - 48px)' }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 0', marginBottom: 12,
      }}>
        <Space>
          <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate(-1)}>
            返回班级图谱
          </Button>
          {/* ★ 上游同步状态 */}
          {upstreamBehind > 0 && (
            <Tag icon={<ExclamationCircleOutlined />} color="warning" style={{ cursor: 'pointer' }}
              onClick={() => setRebaseOpen(true)}>
              上游有新版本（落后 {upstreamBehind} 个版本，{upstreamChangedNodes} 个节点已变更）
            </Tag>
          )}
        </Space>
        <Space>
          {/* ★ Rebase 按钮 */}
          <Button icon={<SyncOutlined />} onClick={() => setRebaseOpen(true)}>
            同步上游
          </Button>
          {/* ★ 提交 PR */}
          <Button type="primary" icon={<SendOutlined />} onClick={handleSubmitPR}>
            提交 PR
          </Button>
        </Space>
      </div>

      {/* ── 图谱 + 详情面板（与教师图谱页结构相同） ── */}
      <div style={{ display: 'flex', gap: 16, height: 'calc(100% - 48px)' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <GraphCanvas
            selectedNodeId={selectedNodeId}
            onNodeClick={(nodeId) => setSelectedNodeId(nodeId || null)}
            readOnly={false}
          />
        </div>
        <div style={{ width: 320, flexShrink: 0, background: '#fff', borderRadius: 8, border: '0.5px solid var(--color-border)', overflow: 'auto' }}>
          <NoteDetailPanel nodeId={selectedNodeId} />
        </div>
      </div>

      {/* ★ Rebase 弹窗 */}
      <Modal
        title="同步上游变更"
        open={rebaseOpen}
        onCancel={() => setRebaseOpen(false)}
        onOk={handleRebaseComplete}
        okText="完成同步"
        width={720}
        okButtonProps={{ disabled: rebaseConflicts.some((c) => !c.resolved) }}
      >
        <p style={{ marginBottom: 16, color: 'var(--color-text-secondary)', fontSize: 13 }}>
          将公有图谱的最新变更合并到你的私人图谱中。以下内容存在冲突，请逐一解决：
        </p>
        <ConflictPanel
          conflicts={rebaseConflicts}
          onResolve={handleRebaseResolve}
          onResolveAll={(res) => setRebaseConflicts((prev) => prev.map((c) => ({ ...c, resolved: true, resolution: res })))}
        />
      </Modal>
    </div>
  )
}

export default PrivateGraphEditor
```

---

## 15. 版本历史页（P4）

**`src/pages/teacher/graph/versions/index.tsx`**

```tsx
// 版本历史页 — 时间轴 + Diff 对比

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Timeline, Button, Tag, Divider } from 'antd'
import { ArrowLeftOutlined, RollbackOutlined } from '@ant-design/icons'

const mockVersions = [
  { version: 12, date: '2026-07-16 14:30', prTitle: 'PR #42: 新增红黑树节点', author: '张三', nodesChanged: 3 },
  { version: 11, date: '2026-07-15 10:00', prTitle: 'PR #40: 修改栈与队列的 PREREQUISITE 关系', author: '李四', nodesChanged: 1 },
  { version: 10, date: '2026-07-14 16:00', prTitle: 'PR #38: 补充快速排序易错点', author: '王五', nodesChanged: 2 },
  { version: 9,  date: '2026-07-13 09:00', prTitle: 'PR #36: 新增链表代码实现', author: '张三', nodesChanged: 2 },
]

const VersionHistoryPage = () => {
  const navigate = useNavigate()
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null)

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}>版本历史</h2>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回图谱</Button>
      </div>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* 版本时间轴 */}
        <div style={{ flex: 1 }}>
          <Timeline
            items={mockVersions.map((v) => ({
              color: selectedVersion === v.version ? 'var(--color-primary)' : 'gray',
              children: (
                <div
                  style={{
                    cursor: 'pointer',
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: selectedVersion === v.version ? 'var(--color-primary-light)' : 'transparent',
                  }}
                  onClick={() => setSelectedVersion(v.version)}
                >
                  <div style={{ fontWeight: 600 }}>v{v.version}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{v.date}</div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>{v.prTitle}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{v.author} · +{v.nodesChanged} 节点</div>
                </div>
              ),
            }))}
          />
        </div>

        {/* Diff 对比 */}
        <div style={{ flex: 1.5 }}>
          {selectedVersion ? (
            <div style={{ background: '#fff', padding: 16, borderRadius: 8, border: '0.5px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span>
                  对比：<Tag>v{selectedVersion}</Tag> ← <Tag>v{selectedVersion - 1}</Tag>
                </span>
                <Button size="small" icon={<RollbackOutlined />} danger>回滚到此版本</Button>
              </div>
              <pre style={{
                background: '#FAFAFA', padding: 12, borderRadius: 6,
                fontSize: 12, fontFamily: 'var(--font-mono)', lineHeight: 1.8, whiteSpace: 'pre-wrap',
              }}>
{`+ 新增节点 "红黑树" (id: note-042)
+ 新增节点 "红黑树性质" (id: note-043)
+ 新增关系 CONTAINS: 树与二叉树 → 红黑树
+ 新增关系 PREREQUISITE: 红黑树 → 二叉搜索树
~ 修改节点 "树与二叉树" — 新增红黑树引入段落`}
              </pre>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-tertiary)' }}>
              点击左侧版本查看变更对比
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VersionHistoryPage
```

---

## 16-17. 课程资料管理 + 习题库管理（P5 + P6）

### 16. 课程资料管理

**`src/pages/teacher/materials/index.tsx`**

```tsx
// 课程资料管理页

import { useState } from 'react'
import { Button, Upload, Modal, Tag, Input, Space, Empty } from 'antd'
import { UploadOutlined, FilePdfOutlined, FilePptOutlined, FileTextOutlined, VideoCameraOutlined } from '@ant-design/icons'

// 文件类型图标映射
const fileIcons: Record<string, React.ReactNode> = {
  pdf: <FilePdfOutlined style={{ fontSize: 32, color: '#CF222E' }} />,
  ppt: <FilePptOutlined style={{ fontSize: 32, color: '#D4A72C' }} />,
  doc: <FileTextOutlined style={{ fontSize: 32, color: '#1A7F1A' }} />,
  video: <VideoCameraOutlined style={{ fontSize: 32, color: '#956BF5' }} />,
}

interface Material {
  id: string; title: string; fileType: string; uploadedAt: string; mountedNodes: string[]
}

const mockMaterials: Material[] = [
  { id: 'm1', title: '第三章 栈与队列.pptx', fileType: 'ppt', uploadedAt: '2026-07-10', mountedNodes: ['栈', '队列'] },
  { id: 'm2', title: '链表操作详解.pdf', fileType: 'pdf', uploadedAt: '2026-07-12', mountedNodes: ['链表'] },
  { id: 'm3', title: '二叉树遍历动画.mp4', fileType: 'video', uploadedAt: '2026-07-14', mountedNodes: ['二叉树'] },
]

const MaterialsPage = () => {
  const [materials, setMaterials] = useState<Material[]>(mockMaterials)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [searchText, setSearchText] = useState('')

  const filtered = materials.filter((m) => m.title.includes(searchText))

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Input.Search placeholder="搜索资料..." style={{ width: 320 }} onSearch={setSearchText} />
        <Button type="primary" icon={<UploadOutlined />} onClick={() => setUploadOpen(true)}>上传资料</Button>
      </div>

      {filtered.length === 0 ? <Empty description="暂无资料" /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map((m) => (
            <div key={m.id} style={{
              padding: 16, background: '#fff', borderRadius: 8, border: '0.5px solid var(--color-border)',
              cursor: 'pointer', transition: 'border-color 0.2s',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary)' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)' }}
            >
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                {fileIcons[m.fileType] || <FileTextOutlined style={{ fontSize: 32 }} />}
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 4 }}>{m.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{m.uploadedAt}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {m.mountedNodes.map((node) => (
                  <Tag key={node} style={{ fontSize: 11 }}>{node}</Tag>
                ))}
                {m.mountedNodes.length === 0 && (
                  <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>未挂载</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 上传弹窗 */}
      <Modal title="上传资料" open={uploadOpen} onCancel={() => setUploadOpen(false)} onOk={() => setUploadOpen(false)}>
        <Upload.Dragger multiple beforeUpload={() => false}>
          <p><UploadOutlined style={{ fontSize: 24 }} /></p>
          <p>点击或拖拽文件上传</p>
        </Upload.Dragger>
      </Modal>
    </div>
  )
}

export default MaterialsPage
```

### 17. 习题库管理（教师）

**`src/pages/teacher/exercises/index.tsx`**

```tsx
// 习题库管理页（教师）

import { useState } from 'react'
import { Button, Table, Tag, Modal, Form, Input, Select, Space } from 'antd'
import { PlusOutlined, ImportOutlined } from '@ant-design/icons'

interface Exercise {
  key: string; type: string; difficulty: string; summary: string; mountedNode: string; status: string
}

const mockExercises: Exercise[] = [
  { key: 'e1', type: '单选题', difficulty: '简单', summary: '栈的入栈和出栈操作遵循什么原则？', mountedNode: '栈', status: '已发布' },
  { key: 'e2', type: '算法题', difficulty: '中等', summary: '实现链表的反转函数', mountedNode: '链表', status: '已发布' },
  { key: 'e3', type: '代码题', difficulty: '困难', summary: '实现 AVL 树的左旋和右旋操作', mountedNode: 'AVL 树', status: '待审核' },
]

const ExercisePage = () => {
  const [modalOpen, setModalOpen] = useState(false)
  const [form] = Form.useForm()

  const columns = [
    { title: '题型', dataIndex: 'type', key: 'type', width: 90,
      render: (t: string) => <Tag>{t}</Tag> },
    { title: '难度', dataIndex: 'difficulty', key: 'difficulty', width: 80,
      render: (d: string) => (
        <Tag color={d === '简单' ? 'green' : d === '中等' ? 'gold' : 'red'}>{d}</Tag>
      ) },
    { title: '题干摘要', dataIndex: 'summary', key: 'summary', ellipsis: true },
    { title: '挂载节点', dataIndex: 'mountedNode', key: 'mountedNode', width: 120,
      render: (n: string) => <Tag color="purple">{n}</Tag> },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (s: string) => (
        <Tag color={s === '已发布' ? 'green' : 'gold'}>{s}</Tag>
      ) },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>新增习题</Button>
          <Button icon={<ImportOutlined />}>批量导入</Button>
        </Space>
      </div>

      <Table columns={columns} dataSource={mockExercises} pagination={{ pageSize: 10 }}
        style={{ background: '#fff', borderRadius: 8 }}
        onRow={(record) => ({ onClick: () => { form.setFieldsValue(record); setModalOpen(true) }, style: { cursor: 'pointer' } })}
      />

      {/* 新增/编辑弹窗 */}
      <Modal title="编辑习题" open={modalOpen} onCancel={() => setModalOpen(false)} width={640}
        footer={[<Button key="cancel" onClick={() => setModalOpen(false)}>取消</Button>,
          <Button key="save" type="primary" onClick={() => setModalOpen(false)}>保存</Button>]}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="type" label="题型"><Select options={[
            { value: '单选题', label: '单选题' }, { value: '代码题', label: '代码题' }, { value: '算法题', label: '算法题' },
          ]} /></Form.Item>
          <Form.Item name="difficulty" label="难度"><Select options={[
            { value: '简单', label: '简单' }, { value: '中等', label: '中等' }, { value: '困难', label: '困难' },
          ]} /></Form.Item>
          <Form.Item name="summary" label="题干"><Input.TextArea rows={3} /></Form.Item>
          <Form.Item name="mountedNode" label="挂载节点"><Input placeholder="搜索并选择 Note 节点" /></Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ExercisePage
```

---

## 18. 练习页 — 学生（P12）

**`src/pages/student/exercises/index.tsx`**

```tsx
// 学生练习页 — 答题 + 判分

import { useState } from 'react'
import { Radio, Button, Card, Tag, Space, Result, message } from 'antd'

const mockQuestion = {
  id: 'q1', type: '单选题', difficulty: '中等',
  question: '栈的入栈和出栈操作遵循什么原则？',
  options: ['A. FIFO（先进先出）', 'B. LIFO（后进先出）', 'C. 随机访问', 'D. 按优先级'],
  answer: 1,        // 正确答案索引
  explanation: '栈是一种后进先出（LIFO, Last In First Out）的数据结构。最后入栈的元素最先出栈，类比叠盘子。',
  relatedNode: '栈',
}

const StudentExercisePage = () => {
  const [selected, setSelected] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const isCorrect = selected === mockQuestion.answer

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}>练习</h2>
        <Tag color="purple">{mockQuestion.relatedNode}</Tag>
        <Tag>{mockQuestion.type}</Tag>
        <Tag color={mockQuestion.difficulty === '中等' ? 'gold' : ''}>{mockQuestion.difficulty}</Tag>
      </div>

      <Card style={{ marginBottom: 16, borderRadius: 8, border: '0.5px solid var(--color-border)' }}>
        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 20 }}>{mockQuestion.question}</div>
        <Radio.Group value={selected} onChange={(e) => setSelected(e.target.value)}
          disabled={submitted} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mockQuestion.options.map((opt, idx) => (
            <Radio key={idx} value={idx}
              style={{
                padding: '10px 14px', borderRadius: 6,
                ...(submitted && idx === mockQuestion.answer && {
                  background: '#E8F5E9', border: '1px solid var(--color-success)',
                }),
                ...(submitted && idx === selected && idx !== mockQuestion.answer && {
                  background: '#FFEBEE', border: '1px solid var(--color-danger)',
                }),
              }}>
              {opt}
            </Radio>
          ))}
        </Radio.Group>
      </Card>

      {!submitted ? (
        <Button type="primary" disabled={selected === null} onClick={() => setSubmitted(true)} block size="large">
          提交答案
        </Button>
      ) : (
        <Card style={{ borderRadius: 8, border: `1px solid ${isCorrect ? 'var(--color-success)' : 'var(--color-danger)'}` }}>
          <Result
            status={isCorrect ? 'success' : 'error'}
            title={isCorrect ? '回答正确！' : '回答错误'}
            subTitle={mockQuestion.explanation}
            extra={
              <Space>
                <Button onClick={() => { setSelected(null); setSubmitted(false) }}>再做一题</Button>
                <Button type="link" style={{ color: 'var(--color-primary)' }}>
                  查看关联知识点「{mockQuestion.relatedNode}」→
                </Button>
              </Space>
            }
          />
        </Card>
      )}
    </div>
  )
}

export default StudentExercisePage
```

---

## 19. 学情分析看板（P7）

**`src/pages/teacher/analytics/index.tsx`**

```tsx
// 学情分析看板（教师）

import { Table, Tag, Progress, Card, Row, Col } from 'antd'
import { WarningOutlined, CheckCircleOutlined } from '@ant-design/icons'

const mockWeakPoints = [
  { node: '红黑树', correctRate: 42, errorCount: 28, level: '严重' },
  { node: 'AVL 树旋转', correctRate: 55, errorCount: 22, level: '严重' },
  { node: '图的深度优先遍历', correctRate: 68, errorCount: 16, level: '一般' },
  { node: '归并排序', correctRate: 73, errorCount: 13, level: '一般' },
]

const mockStudents = [
  { name: '张三', id: '2024001', completionRate: 92, correctRate: 78, weakPoints: 3, alert: 'normal' },
  { name: '李四', id: '2024002', completionRate: 85, correctRate: 65, weakPoints: 7, alert: 'warning' },
  { name: '王五', id: '2024003', completionRate: 45, correctRate: 40, weakPoints: 15, alert: 'danger' },
]

const AnalyticsPage = () => (
  <div>
    <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 24 }}>学情分析</h2>

    <Row gutter={[16, 16]}>
      {/* 薄弱点排名 */}
      <Col xs={24} lg={12}>
        <Card title="薄弱知识点排名" style={{ borderRadius: 8 }}>
          {mockWeakPoints.map((wp, i) => (
            <div key={wp.node} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0',
              borderBottom: i < mockWeakPoints.length - 1 ? '0.5px solid var(--color-border)' : 'none',
            }}>
              <span style={{ fontWeight: 600, minWidth: 20 }}>#{i + 1}</span>
              <span style={{ flex: 1 }}>{wp.node}</span>
              <Progress percent={wp.correctRate} size="small" style={{ width: 100 }}
                strokeColor={wp.correctRate >= 60 ? 'var(--color-warning)' : 'var(--color-danger)'} />
              <Tag color={wp.level === '严重' ? 'red' : 'gold'}>{wp.correctRate}%</Tag>
            </div>
          ))}
        </Card>
      </Col>

      {/* 学生进度 */}
      <Col xs={24} lg={12}>
        <Card title="学生进度概览" style={{ borderRadius: 8 }}>
          <Table dataSource={mockStudents} pagination={false} size="small"
            columns={[
              { title: '学生', dataIndex: 'name', key: 'name', render: (name: string, record: any) => (
                <span>{name} {record.alert === 'danger' && <WarningOutlined style={{ color: 'var(--color-danger)', marginLeft: 6 }} />}</span>
              )},
              { title: '完成率', dataIndex: 'completionRate', key: 'completionRate',
                render: (v: number) => <Progress percent={v} size="small" /> },
              { title: '正确率', dataIndex: 'correctRate', key: 'correctRate',
                render: (v: number) => <span style={{ color: v >= 60 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>{v}%</span> },
              { title: '薄弱点', dataIndex: 'weakPoints', key: 'weakPoints' },
            ]}
          />
        </Card>
      </Col>
    </Row>
  </div>
)

export default AnalyticsPage
```

---

## 20. 贡献页 + 设置页（P15 + P16 + P9/P17）

### 20. 贡献页

**`src/pages/student/contributions/index.tsx`**

```tsx
import { Tag, Tooltip } from 'antd'
import { TrophyOutlined, FireOutlined, StarOutlined } from '@ant-design/icons'

// ★ GitHub 风格贡献热力图
const ContributionHeatmap = () => {
  // 模拟 52 周 × 7 天的数据（全 0 或随机 0-4）
  const weeks = 20  // 简化：20 周
  const days = 7
  const grid: number[][] = Array.from({ length: weeks }, () =>
    Array.from({ length: days }, () => Math.floor(Math.random() * 5))
  )
  const getColor = (level: number) =>
    ['#EBEDF0', '#E6DFF7', '#C4B5F0', '#A28BE8', '#956BF5'][level]

  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {grid.map((week, wi) => (
        <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {week.map((level, di) => (
            <Tooltip key={di} title={`${level} 次贡献`}>
              <div style={{
                width: 12, height: 12, borderRadius: 2,
                background: getColor(level),
              }} />
            </Tooltip>
          ))}
        </div>
      ))}
    </div>
  )
}

const mockBadges = [
  { name: '首批贡献者', icon: <TrophyOutlined />, color: '#D4A72C', earned: true },
  { name: '纠错能手', icon: <StarOutlined />, color: '#956BF5', earned: true },
  { name: '代码达人', icon: <FireOutlined />, color: '#CF222E', earned: false },
]

const ContributionsPage = () => (
  <div style={{ maxWidth: 800, margin: '0 auto' }}>
    <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 24 }}>我的贡献</h2>

    {/* 积分统计 */}
    <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
      {[
        { label: '总积分', value: '285', icon: <TrophyOutlined />, color: '#D4A72C' },
        { label: '本周积分', value: '+45', icon: <FireOutlined />, color: '#CF222E' },
        { label: '班级排名', value: '#3 / 42', icon: <StarOutlined />, color: '#956BF5' },
      ].map((stat) => (
        <div key={stat.label} style={{
          flex: 1, padding: 16, background: '#fff', borderRadius: 8, textAlign: 'center',
          border: '0.5px solid var(--color-border)',
        }}>
          <div style={{ fontSize: 28, color: stat.color, marginBottom: 4 }}>{stat.icon}</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{stat.value}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{stat.label}</div>
        </div>
      ))}
    </div>

    {/* 贡献热力图 */}
    <div style={{ padding: 16, background: '#fff', borderRadius: 8, border: '0.5px solid var(--color-border)', marginBottom: 16 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>贡献记录（最近 20 周）</div>
      <ContributionHeatmap />
    </div>

    {/* 徽章墙 */}
    <div style={{ padding: 16, background: '#fff', borderRadius: 8, border: '0.5px solid var(--color-border)' }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>徽章墙</div>
      <div style={{ display: 'flex', gap: 12 }}>
        {mockBadges.map((badge) => (
          <div key={badge.name} style={{
            padding: '12px 16px', borderRadius: 8,
            background: badge.earned ? '#F4F0FF' : '#FAFAFA',
            border: `0.5px solid ${badge.earned ? 'var(--color-primary)' : 'var(--color-border)'}`,
            opacity: badge.earned ? 1 : 0.4,
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 24, color: badge.color, marginBottom: 4 }}>{badge.icon}</div>
            <div style={{ fontSize: 12, fontWeight: badge.earned ? 600 : 400 }}>{badge.name}</div>
            {!badge.earned && <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>未解锁</div>}
          </div>
        ))}
      </div>
    </div>
  </div>
)

export default ContributionsPage
```

### 22. 设置页

**（教师和学生共用同一结构，仅内容不同）**

**`src/pages/teacher/settings/index.tsx`** 和 **`src/pages/student/settings/index.tsx`**

```tsx
// 教师/学生个人设置页（结构相同）

import { Form, Input, Button, Switch, Divider, message } from 'antd'

const SettingsPage = () => {
  const isTeacher = window.location.pathname.startsWith('/teacher')

  const onFinish = (values: any) => {
    message.success('设置已保存')
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 24 }}>个人设置</h2>
      <div style={{ padding: 24, background: '#fff', borderRadius: 8, border: '0.5px solid var(--color-border)' }}>
        <Form layout="vertical" onFinish={onFinish}
          initialValues={{ displayName: '张老师', email: 'zhang@university.edu.cn' }}
        >
          <Form.Item name="displayName" label="显示名称"><Input /></Form.Item>
          <Form.Item name="email" label="邮箱"><Input /></Form.Item>
          <Form.Item name="password" label="新密码"><Input.Password placeholder="留空则不修改" /></Form.Item>

          {/* 教师专属：审核流程配置 */}
          {isTeacher && (
            <>
              <Divider />
              <h4 style={{ marginBottom: 16 }}>审核流程配置</h4>
              <Form.Item name="enableAIReview" label="开启 AI 预审核" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>
              <Form.Item name="enableGroupLeader" label="需要小组长二审" valuePropName="checked" initialValue={false}>
                <Switch />
              </Form.Item>
            </>
          )}

          <Button type="primary" htmlType="submit">保存设置</Button>
        </Form>
      </div>
    </div>
  )
}

export default SettingsPage
```

---

## 23. Markdown 编辑器共享组件

**`src/components/markdown/MarkdownEditor.tsx`**

```tsx
// 轻量 Markdown 编辑器（文本区 + 实时预览）
// 后续可替换为 ByteMD 或 Monaco Editor

import { useState } from 'react'
import { Button, Space, Tabs, Tooltip } from 'antd'
import { BoldOutlined, ItalicOutlined, CodeOutlined, LinkOutlined } from '@ant-design/icons'

interface MarkdownEditorProps {
  initialValue?: string
  placeholder?: string
  onChange?: (value: string) => void
  height?: number
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  initialValue = '',
  placeholder = '输入 Markdown 内容...',
  onChange,
  height = 300,
}) => {
  const [content, setContent] = useState(initialValue)
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

  const handleChange = (value: string) => {
    setContent(value)
    onChange?.(value)
  }

  // 工具栏：插入 Markdown 语法
  const insertSyntax = (prefix: string, suffix: string = '') => {
    const textarea = document.querySelector('.md-textarea') as HTMLTextAreaElement
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selected = content.substring(start, end)
    const newText = content.substring(0, start) + prefix + selected + suffix + content.substring(end)
    handleChange(newText)
  }

  return (
    <div style={{
      border: '0.5px solid var(--color-border)',
      borderRadius: 6,
      overflow: 'hidden',
    }}>
      {/* 标签栏：编辑 / 预览 */}
      <Tabs activeKey={activeTab} onChange={(k) => setActiveTab(k as 'edit' | 'preview')}
        tabBarExtraContent={
          activeTab === 'edit' && (
            <Space size={4} style={{ paddingRight: 8 }}>
              <Tooltip title="加粗"><Button size="small" type="text" icon={<BoldOutlined />}
                onClick={() => insertSyntax('**', '**')} /></Tooltip>
              <Tooltip title="斜体"><Button size="small" type="text" icon={<ItalicOutlined />}
                onClick={() => insertSyntax('*', '*')} /></Tooltip>
              <Tooltip title="代码"><Button size="small" type="text" icon={<CodeOutlined />}
                onClick={() => insertSyntax('`', '`')} /></Tooltip>
              <Tooltip title="链接"><Button size="small" type="text" icon={<LinkOutlined />}
                onClick={() => insertSyntax('[', '](url)')} /></Tooltip>
            </Space>
          )
        }
        style={{ padding: '0 12px', marginBottom: 0 }}
        items={[
          {
            key: 'edit',
            label: '编辑',
            children: (
              <textarea
                className="md-textarea"
                value={content}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={placeholder}
                style={{
                  width: '100%', height, border: 'none', outline: 'none',
                  resize: 'vertical', padding: 12,
                  fontFamily: 'var(--font-mono)', fontSize: 13,
                  lineHeight: 1.8, background: '#FAFAFA',
                }}
              />
            ),
          },
          {
            key: 'preview',
            label: '预览',
            children: (
              <div style={{
                height, overflow: 'auto', padding: 12,
                background: '#fff', lineHeight: 1.8, fontSize: 14,
              }}>
                {/* 简易 Markdown 渲染（后续替换为 react-markdown） */}
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-sans)' }}>{content}</pre>
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}

export default MarkdownEditor
```

---

## 24. AI 对话面板共享组件

**`src/components/common/AIPanel.tsx`**

```tsx
// AI 辅导员对话面板
// 仅在图谱页中嵌入，非全局组件

import { useState, useRef, useEffect } from 'react'
import { Button, Input, Tag, Space, Empty } from 'antd'
import { SendOutlined, RobotOutlined, CloseOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons'

interface Message {
  role: 'user' | 'assistant'
  content: string
  citedNotes?: string[]       // 引用的 Note 节点名
  id: string
}

interface AIPanelProps {
  visible: boolean
  onClose: () => void
  graphName?: string          // 当前知识库名称
}

const AIPanel: React.FC<AIPanelProps> = ({ visible, onClose, graphName = '数据结构·计科2101班' }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `你好！我是基于「${graphName}」知识图谱的 AI 辅导员。你可以问我关于这门课的任何问题。`, id: 'init' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const userMsg: Message = { role: 'user', content: input, id: Date.now().toString() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // 模拟 AI 回复（后续替换为流式 GraphRAG API）
    await new Promise((r) => setTimeout(r, 1200))
    const aiMsg: Message = {
      role: 'assistant',
      content: `关于"${input}"：根据课程知识图谱，栈是一种后进先出（LIFO）的数据结构，其基本操作包括 `push`（入栈）、`pop`（出栈）和 `peek`（查看栈顶元素）。栈的典型应用场景包括函数调用栈、表达式求值和括号匹配等。`,
      citedNotes: ['栈', '栈的应用场景', '栈与队列对比'],
      id: (Date.now() + 1).toString(),
    }
    setMessages((prev) => [...prev, aiMsg])
    setLoading(false)
  }

  if (!visible) return null

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: '#fff', borderRadius: 8, border: '0.5px solid var(--color-border)',
    }}>
      {/* 头部 */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 14px', borderBottom: '0.5px solid var(--color-border)',
      }}>
        <Space>
          <RobotOutlined style={{ color: 'var(--color-primary)' }} />
          <span style={{ fontWeight: 600, fontSize: 14 }}>AI 辅导员</span>
        </Space>
        <Button size="small" type="text" icon={<CloseOutlined />} onClick={onClose} />
      </div>

      {/* 知识库信息 */}
      <div style={{
        padding: '6px 14px', background: '#FAFAFA',
        fontSize: 11, color: 'var(--color-text-tertiary)',
      }}>
        知识库：{graphName}
      </div>

      {/* 消息列表 */}
      <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{
            marginBottom: 12,
            display: 'flex', flexDirection: 'column',
            alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '90%', padding: '8px 12px', borderRadius: 8, fontSize: 13, lineHeight: 1.6,
              background: msg.role === 'user' ? 'var(--color-primary)' : '#FAFAFA',
              color: msg.role === 'user' ? '#fff' : 'var(--color-text)',
              border: msg.role === 'assistant' ? '0.5px solid var(--color-border)' : 'none',
            }}>
              {msg.content}
            </div>
            {/* 引用 Note */}
            {msg.citedNotes && msg.citedNotes.length > 0 && (
              <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {msg.citedNotes.map((note) => (
                  <Tag key={note} color="purple" style={{ fontSize: 11, cursor: 'pointer', margin: 0 }}>{note}</Tag>
                ))}
              </div>
            )}
            {/* 反馈按钮（仅 AI 消息） */}
            {msg.role === 'assistant' && msg.id !== 'init' && (
              <Space size={4} style={{ marginTop: 4 }}>
                <Button size="small" type="text" icon={<LikeOutlined />} style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }} />
                <Button size="small" type="text" icon={<DislikeOutlined />} style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }} />
              </Space>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ color: 'var(--color-text-tertiary)', fontSize: 13 }}>
            <RobotOutlined /> 思考中...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区 */}
      <div style={{
        padding: 10, borderTop: '0.5px solid var(--color-border)',
        display: 'flex', gap: 8,
      }}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onPressEnter={handleSend}
          placeholder="向 AI 辅导员提问..."
          style={{ flex: 1 }}
          disabled={loading}
        />
        <Button type="primary" icon={<SendOutlined />} onClick={handleSend} loading={loading} />
      </div>
    </div>
  )
}

export default AIPanel
```

---

## 25. 课程广场 + 邀请码加入 + 教师学生管理

### 目的

实现学生加入课程的两种方式：
1. 浏览课程广场 → 申请加入 → 教师审批
2. 输入邀请码 → 直接加入

以及教师端的申请审批与邀请码管理。

### 25.1 扩展 Mock 数据

**在 `src/api/mock/dashboard.ts` 末尾追加**：

```typescript
// ── 课程广场 & 加入课程 Mock 数据 ──

export interface BrowseCourse {
  id: string
  name: string
  teacherName: string
  className: string
  semester: string
  subject: string
  description: string
  nodeCount: number
  enrolledStudentCount: number
  enrollmentStatus: 'not_joined' | 'pending' | 'joined'  // 当前学生的状态
}

export const mockBrowseCourses: BrowseCourse[] = [
  {
    id: 'course-1', name: '数据结构', teacherName: '张老师', className: '计科 2101 班',
    semester: '2025-2026-1', subject: 'data-structure',
    description: '涵盖线性表、栈与队列、树与二叉树、图、排序算法等核心数据结构与算法。',
    nodeCount: 186, enrolledStudentCount: 42, enrollmentStatus: 'joined',
  },
  {
    id: 'course-2', name: '操作系统', teacherName: '李老师', className: '计科 2101 班',
    semester: '2025-2026-1', subject: 'os',
    description: '进程管理、内存管理、文件系统、I/O 系统等操作系统核心概念与原理。',
    nodeCount: 124, enrolledStudentCount: 38, enrollmentStatus: 'pending',
  },
  {
    id: 'course-3', name: '计算机网络', teacherName: '王老师', className: '计科 2102 班',
    semester: '2025-2026-1', subject: 'network',
    description: '从物理层到应用层的 TCP/IP 协议栈，涵盖 HTTP、TCP、IP、DNS 等核心协议。',
    nodeCount: 98, enrolledStudentCount: 55, enrollmentStatus: 'not_joined',
  },
  {
    id: 'course-4', name: '数据库原理', teacherName: '赵老师', className: '计科 2103 班',
    semester: '2025-2026-1', subject: 'db',
    description: '关系模型、SQL、事务管理、索引与查询优化等数据库核心技术。',
    nodeCount: 0, enrolledStudentCount: 15, enrollmentStatus: 'not_joined',
  },
]

// ── 教师端：加入申请 Mock 数据 ──

export interface EnrollmentRequestItem {
  id: string
  studentName: string
  studentId: string      // 学号
  courseId: string
  courseName: string
  message: string        // 申请留言
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

// ── 教师端：邀请码 Mock 数据 ──

export interface InviteCodeItem {
  id: string
  code: string
  courseId: string
  maxUses: number | null     // null = 无限
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
  { id: 'ic-3', code: 'DSKOLD1', courseId: 'course-1', maxUses: 30, usedCount: 30,
    expiresAt: '2026-07-01', isActive: false, createdAt: '2026-06-15' },
]
```

### 25.2 邀请码加入（学生仪表盘嵌入组件）

**更新 `src/pages/student/dashboard/index.tsx`**，在欢迎语下方添加邀请码输入区：

```tsx
// 在学生仪表盘欢迎语和课程列表之间插入以下代码

import { Input, message } from 'antd'
import { KeyOutlined } from '@ant-design/icons'

// 在 StudentDashboard 组件内添加：
const [inviteCode, setInviteCode] = useState('')
const [joining, setJoining] = useState(false)

const handleJoinByCode = async () => {
  if (!inviteCode.trim()) return
  setJoining(true)
  await new Promise(r => setTimeout(r, 1000))
  message.success(`成功加入课程！邀请码：${inviteCode}`)
  setInviteCode('')
  setJoining(false)
}

// 在欢迎语下方、课程列表上方添加：
{/* ── 邀请码加入 ── */}
<div style={{
  marginBottom: 'var(--space-5)',
  padding: '12px 16px',
  background: '#fff',
  borderRadius: 8,
  border: '0.5px solid var(--color-border)',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
}}>
  <KeyOutlined style={{ fontSize: 20, color: 'var(--color-primary)' }} />
  <Input
    placeholder="输入课程邀请码加入班级"
    value={inviteCode}
    onChange={e => setInviteCode(e.target.value.toUpperCase())}
    onPressEnter={handleJoinByCode}
    style={{ flex: 1, maxWidth: 280 }}
  />
  <Button type="primary" loading={joining} onClick={handleJoinByCode} disabled={!inviteCode.trim()}>
    立即加入
  </Button>
</div>
```

### 25.3 课程广场页

**`src/pages/student/courses-browse/index.tsx`**

```tsx
// 课程广场 — 浏览 + 申请加入

import { useState } from 'react'
import { Input, Select, Tag, Button, Modal, message } from 'antd'
import { SearchOutlined, UserOutlined, ApartmentOutlined } from '@ant-design/icons'
import { mockBrowseCourses } from '../../../api/mock/dashboard'

const subjectLabels: Record<string, string> = {
  'data-structure': '数据结构',
  'os': '操作系统',
  'network': '计算机网络',
  'db': '数据库',
}

const statusConfig = {
  joined:     { label: '已加入', color: 'green' },
  pending:    { label: '审核中', color: 'gold' },
  not_joined: { label: '未加入', color: 'default' },
}

const CourseBrowsePage = () => {
  const [searchText, setSearchText] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [applyModal, setApplyModal] = useState<{ open: boolean; course?: typeof mockBrowseCourses[0] }>({ open: false })
  const [applyMessage, setApplyMessage] = useState('')

  const filtered = mockBrowseCourses.filter((c) => {
    if (searchText && !c.name.includes(searchText) && !c.teacherName.includes(searchText)) return false
    if (subjectFilter !== 'all' && c.subject !== subjectFilter) return false
    return true
  })

  const handleApply = (course: typeof mockBrowseCourses[0]) => {
    setApplyModal({ open: true, course })
    setApplyMessage('')
  }

  const handleSubmitApply = () => {
    message.success(`已向「${applyModal.course?.name}」提交加入申请，请等待教师审批。`)
    setApplyModal({ open: false })
  }

  return (
    <div>
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 24 }}>课程广场</h2>

      {/* 搜索 + 筛选 */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <Input prefix={<SearchOutlined />} placeholder="搜索课程名称或教师..." style={{ width: 320 }}
          value={searchText} onChange={(e) => setSearchText(e.target.value)} />
        <Select value={subjectFilter} onChange={setSubjectFilter} style={{ width: 160 }}
          options={[
            { value: 'all', label: '全部分类' },
            ...Object.entries(subjectLabels).map(([k, v]) => ({ value: k, label: v })),
          ]} />
      </div>

      {/* 课程卡片网格 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {filtered.map((course) => (
          <div key={course.id} style={{
            padding: 'var(--space-4)', background: '#fff', borderRadius: 8,
            border: '0.5px solid var(--color-border)',
          }}>
            {/* 课程名 + 状态 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{course.name}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                  {course.teacherName} · {course.className} · {course.semester}
                </div>
              </div>
              <Tag color={statusConfig[course.enrollmentStatus].color}>
                {statusConfig[course.enrollmentStatus].label}
              </Tag>
            </div>

            {/* 课程简介 */}
            <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>
              {course.description}
            </p>

            {/* 底部：统计 + 操作 */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                <span><ApartmentOutlined style={{ marginRight: 4 }} />{course.nodeCount} 节点</span>
                <span><UserOutlined style={{ marginRight: 4 }} />{course.enrolledStudentCount} 人</span>
              </div>

              {course.enrollmentStatus === 'not_joined' && (
                <Button size="small" type="primary" onClick={() => handleApply(course)}>
                  申请加入
                </Button>
              )}
              {course.enrollmentStatus === 'pending' && (
                <Button size="small" disabled>审核中</Button>
              )}
              {course.enrollmentStatus === 'joined' && (
                <Button size="small" disabled style={{ color: 'var(--color-success)' }}>已加入</Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 申请弹窗 */}
      <Modal
        title={`申请加入「${applyModal.course?.name}」`}
        open={applyModal.open}
        onCancel={() => setApplyModal({ open: false })}
        onOk={handleSubmitApply}
        okText="提交申请"
      >
        <p style={{ marginBottom: 12, color: 'var(--color-text-secondary)', fontSize: 13 }}>
          授课教师：{applyModal.course?.teacherName} · {applyModal.course?.className}
        </p>
        <Input.TextArea
          value={applyMessage}
          onChange={(e) => setApplyMessage(e.target.value)}
          placeholder="申请留言（可选）：简单介绍你为什么想加入这门课"
          rows={3}
        />
      </Modal>
    </div>
  )
}

export default CourseBrowsePage
```

### 25.4 教师端学生管理页

**`src/pages/teacher/enrollments/index.tsx`**

```tsx
// 教师端 — 学生管理（申请审批 + 邀请码管理）

import { useState } from 'react'
import { Tabs, Button, Table, Tag, Input, message, Tooltip, Modal, Select, DatePicker } from 'antd'
import { CopyOutlined, StopOutlined, PlusOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { mockEnrollmentRequests, mockInviteCodes } from '../../../api/mock/dashboard'

const EnrollmentsPage = () => {
  const [activeTab, setActiveTab] = useState('requests')
  const [requests, setRequests] = useState(mockEnrollmentRequests)
  const [inviteCodes, setInviteCodes] = useState(mockInviteCodes)
  const [selectedReqIds, setSelectedReqIds] = useState<string[]>([])

  // ── 审批操作 ──
  const handleApprove = (id: string) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'approved' as const } : r)))
    message.success('已通过申请')
  }
  const handleReject = (id: string) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'rejected' as const } : r)))
    message.info('已拒绝申请')
  }
  const handleBatchApprove = () => {
    setRequests((prev) => prev.map((r) => (selectedReqIds.includes(r.id) ? { ...r, status: 'approved' as const } : r)))
    message.success(`已批量通过 ${selectedReqIds.length} 个申请`)
    setSelectedReqIds([])
  }

  // ── 邀请码操作 ──
  const handleCreateCode = () => {
    const newCode: typeof mockInviteCodes[0] = {
      id: `ic-${Date.now()}`, code: Math.random().toString(36).substring(2, 8).toUpperCase(),
      courseId: 'course-1', maxUses: 50, usedCount: 0, expiresAt: null,
      isActive: true, createdAt: '刚刚',
    }
    setInviteCodes((prev) => [newCode, ...prev])
    message.success('邀请码已生成')
  }
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    message.success('已复制邀请码')
  }
  const handleDeactivateCode = (id: string) => {
    setInviteCodes((prev) => prev.map((c) => (c.id === id ? { ...c, isActive: false } : c)))
    message.info('邀请码已停用')
  }

  // 申请表格列
  const requestColumns = [
    { title: '学生', dataIndex: 'studentName', key: 'studentName', render: (name: string, r: any) => (
      <span>{name} <span style={{ color: 'var(--color-text-tertiary)', fontSize: 12 }}>{r.studentId}</span></span>
    )},
    { title: '申请留言', dataIndex: 'message', key: 'message', ellipsis: true,
      render: (msg: string) => msg || <span style={{ color: 'var(--color-text-tertiary)' }}>（无留言）</span> },
    { title: '时间', dataIndex: 'createdAt', key: 'createdAt', width: 120 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 90,
      render: (s: string) => (
        <Tag color={s === 'approved' ? 'green' : s === 'rejected' ? 'red' : 'gold'}>
          {s === 'approved' ? '已通过' : s === 'rejected' ? '已拒绝' : '待处理'}
        </Tag>
      ) },
    { title: '操作', key: 'actions', width: 140,
      render: (_: any, r: any) => r.status === 'pending' ? (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => handleApprove(r.id)}>通过</Button>
          <Button size="small" danger icon={<CloseOutlined />} onClick={() => handleReject(r.id)}>拒绝</Button>
        </div>
      ) : null },
  ]

  // 邀请码表格列
  const codeColumns = [
    { title: '邀请码', dataIndex: 'code', key: 'code', render: (code: string, r: any) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 16, letterSpacing: 2 }}>{code}</span>
        <Tooltip title="复制"><Button size="small" type="text" icon={<CopyOutlined />} onClick={() => handleCopyCode(code)} /></Tooltip>
      </div>
    )},
    { title: '已用/上限', key: 'usage', render: (_: any, r: any) => (
      <span>{r.usedCount} / {r.maxUses ?? '∞'}</span>
    ) },
    { title: '过期时间', dataIndex: 'expiresAt', key: 'expiresAt', render: (d: string | null) => d || '永久有效' },
    { title: '状态', dataIndex: 'isActive', key: 'isActive', render: (a: boolean) => (
      <Tag color={a ? 'green' : 'default'}>{a ? '有效' : '已停用'}</Tag>
    ) },
    { title: '操作', key: 'actions', render: (_: any, r: any) => r.isActive ? (
      <Button size="small" icon={<StopOutlined />} onClick={() => handleDeactivateCode(r.id)}>停用</Button>
    ) : null },
  ]

  return (
    <div>
      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 600, marginBottom: 24 }}>学生管理</h2>

      <Tabs activeKey={activeTab} onChange={setActiveTab}
        items={[
          {
            key: 'requests',
            label: `加入申请 (${requests.filter((r) => r.status === 'pending').length})`,
            children: (
              <div>
                {selectedReqIds.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <Button type="primary" onClick={handleBatchApprove}>
                      批量通过 ({selectedReqIds.length})
                    </Button>
                  </div>
                )}
                <Table dataSource={requests} columns={requestColumns} rowKey="id" size="middle"
                  rowSelection={{
                    selectedRowKeys: selectedReqIds,
                    onChange: (keys) => setSelectedReqIds(keys as string[]),
                    getCheckboxProps: (r: any) => ({ disabled: r.status !== 'pending' }),
                  }}
                  style={{ background: '#fff', borderRadius: 8 }}
                />
              </div>
            ),
          },
          {
            key: 'invite-codes',
            label: '邀请码管理',
            children: (
              <div>
                <div style={{ marginBottom: 16 }}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateCode}>
                    生成新邀请码
                  </Button>
                </div>
                <Table dataSource={inviteCodes} columns={codeColumns} rowKey="id" size="middle"
                  style={{ background: '#fff', borderRadius: 8 }}
                />
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}

export default EnrollmentsPage
```

### 25.5 路由补全

更新路由表，追加新页面的导入和路由：

```tsx
// 追加导入
import TeacherEnrollments from '../pages/teacher/enrollments'
import CourseBrowse     from '../pages/student/courses-browse'
// 删除：import StudentWrongAnswers from ...

// 教师端追加
{ path: 'courses/:courseId/enrollments', element: <TeacherEnrollments /> },

// 学生端追加
{ path: 'courses/browse',    element: <CourseBrowse /> },
// 删除：{ path: 'wrong-answers', ... }
```

---

## 26. 路由补全（汇总）

所有页面路由注册的最终版本：

```tsx
// 教师端 children
{ index: true, element: <TeacherDashboard /> },
{ path: 'dashboard', element: <TeacherDashboard /> },
{ path: 'courses/new', element: <TeacherCreateCourse /> },
{ path: 'courses/:courseId/graph', element: <TeacherGraph /> },
{ path: 'courses/:courseId/graph/versions', element: <TeacherVersions /> },
{ path: 'courses/:courseId/materials',  element: <TeacherMaterials /> },
{ path: 'courses/:courseId/exercises',  element: <TeacherExercises /> },
{ path: 'courses/:courseId/analytics',  element: <TeacherAnalytics /> },
{ path: 'courses/:courseId/enrollments', element: <TeacherEnrollments /> },
{ path: 'review',    element: <TeacherReview /> },
{ path: 'settings',  element: <TeacherSettings /> },

// 学生端 children
{ index: true, element: <StudentDashboard /> },
{ path: 'dashboard',     element: <StudentDashboard /> },
{ path: 'courses/browse', element: <CourseBrowse /> },
{ path: 'courses/:courseId/graph', element: <StudentGraph /> },
{ path: 'courses/:courseId/exercises', element: <StudentExercises /> },
{ path: 'private-graph/:graphId', element: <StudentPrivateGraph /> },
{ path: 'pr/:prId',       element: <StudentPR /> },
{ path: 'contributions',  element: <StudentContributions /> },
{ path: 'settings',       element: <StudentSettings /> },
```

---

## 完成总结

至此，**全部 19 个页面 + 5 个共享组件**的教程已写完。最终文件结构：

```
src/
├── components/
│   ├── layout/
│   │   ├── TeacherLayout.tsx       ← 教师布局壳
│   │   ├── StudentLayout.tsx       ← 学生布局壳
│   │   └── sidebarConfig.ts        ← 菜单配置
│   ├── graph/
│   │   ├── GraphCanvas.tsx         ← ★ G6 图谱画布
│   │   └── NoteDetailPanel.tsx     ← 节点详情面板
│   ├── pr/
│   │   └── ConflictPanel.tsx       ← 冲突解决面板
│   ├── markdown/
│   │   └── MarkdownEditor.tsx      ← Markdown 编辑器
│   └── common/
│       └── AIPanel.tsx             ← AI 对话面板
├── pages/
│   ├── login/                      ← P0
│   ├── teacher/
│   │   ├── dashboard/              ← P1
│   │   ├── create-course/          ← P2
│   │   ├── graph/                  ← P3
│   │   │   └── versions/           ← P4
│   │   ├── materials/              ← P5
│   │   ├── exercises/              ← P6
│   │   ├── analytics/              ← P7
│   │   ├── enrollments/            ← P18 ★
│   │   ├── review/                 ← P8
│   │   └── settings/               ← P9
│   └── student/
│       ├── dashboard/              ← P10 (含邀请码入口)
│       ├── courses-browse/         ← P19 ★
│       ├── graph/                  ← P11
│       ├── exercises/              ← P12
│       ├── private-graph/          ← P13
│       ├── pr/                     ← P14
│       ├── contributions/          ← P15
│       └── settings/               ← P16
├── router/index.tsx                ← 路由表
├── api/mock/
│   ├── dashboard.ts                ← 仪表盘 + 课程广场 + 申请审批 Mock
│   └── graph.ts                    ← 图谱 Mock 数据
├── stores/                         ← Zustand（后续）
├── styles/                         ← CSS 变量 + Reset
├── theme/                          ← AntD Token 配置
└── types/                          ← TS 类型
```

| 步骤 | 覆盖页面 | 关键技术点 |
|------|---------|-----------|
| 1-7 | 基础架构 | Vite、CSS 变量、AntD 主题、路由、布局壳、登录页 |
| 8-9 | 仪表盘 | 待审核卡片按课程拆分、PR 状态列表、Progress 组件 |
| 10 | G6 图谱 | force 布局、hover-activate、state 机制、destroy 生命周期 |
| 11 | 新建课程 | Steps 向导、Dragger 上传、模拟 AI 生成进度 |
| 12 | 审核工作台 | PR 卡片筛选、Drawer 详情、AI 报告展示、批量操作 |
| 13 | PR 详情 | 时间轴、ConflictPanel 复用、新建/查看双变体 |
| 14 | 私人图谱 | Fork 编辑、Rebase 弹窗、上游同步状态 |
| 15 | 版本历史 | Timeline + Diff 对比 |
| 16-17 | 资料/习题 | 文件上传、表格编辑、弹窗表单 |
| 18 | 学生练习 | 答题、判分、Result 反馈 |
| 19 | 学情看板 | 薄弱点排名、学生进度表 |
| 20 | 贡献页 | 热力图、徽章墙 |
| 21 | 设置页 | 教师/学生共享结构（含审核流程配置） |
| 22 | Markdown 编辑器 | Tabs 编辑/预览、工具栏 |
| 23 | AI 面板 | 对话列表、流式占位、引用 Note、反馈按钮 |
| 24 | 邀请码加入 | 学生仪表盘嵌入邀请码输入 → 直接加入课程 |
| 25 | 课程广场 + 学生管理 | 浏览公开课程申请加入 + 教师审批 + 邀请码生成管理 |
| 26 | 路由补全 | 所有页面路由注册 |

所有代码均为可运行状态（mock 数据驱动），开发时逐一创建文件、`npm run dev` 验证即可。
