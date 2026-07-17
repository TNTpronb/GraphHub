# KG-Class 前端路由与组件树设计

## 一、路由设计

### 路由总览

```
/login                              # 登录页

/teacher                            # 教师端壳
  /dashboard                        # 教师首页
  /courses/new                      # ★ 新建课程 + AI 图谱生成
  /courses/:courseId                # 课程上下文壳（侧边栏切换课程）
    /graph                          # 图谱管理（编辑模式，双视图）
    /graph/versions                 # 版本历史
    /materials                      # 课程资料管理
    /exercises                      # 习题库管理
    /analytics                      # 学情分析看板
    /enrollments                    # ★ 学生管理（审批加入申请 + 邀请码管理）
  /review                           # 审核工作台（全局，聚合所有课程PR）
  /settings                         # 个人设置

/student                            # 学生端壳
  /dashboard                        # 学生首页
  /courses/browse                   # ★ 课程广场（浏览 + 申请加入）
  /courses/:courseId                # 课程上下文壳
    /graph                          # 图谱浏览（学习模式，双视图）
    /exercises                      # 练习
  /private-graph/:graphId           # 私人图谱编辑
  /pr/:prId                         # PR 详情 / 新建 PR
  /contributions                    # 个人贡献
  /settings                         # 个人设置
```

### 路由详细说明

| 路由 | 页面 | 说明 |
|------|------|------|
| `/login` | 登录页 | 账号密码登录 / SSO 跳转 |
| **教师端** | | |
| `/teacher/dashboard` | 教师首页 | 按课程拆分的待审核卡片（点击 → 审核工作台并筛选该课）、课程卡片列表、新建课程入口 |
| `/teacher/courses/new` | 新建课程 | ★ 多步向导：课程信息 → 上传课件资料 → AI 生成初始图谱 → 预览编辑 → 发布 |
| `/teacher/courses/:courseId/graph` | 图谱管理 | 网络图 + 树状列表双视图编辑模式，可增删改 Note 节点/关系。**页面内嵌 AI 辅导员面板（仅此图谱可见）** |
| `/teacher/courses/:courseId/graph/versions` | 版本历史 | 版本时间轴、版本 Diff 对比、一键回滚 |
| `/teacher/courses/:courseId/materials` | 课程资料 | PPT/PDF 等非 md 资料上传、分类、挂载到 Note |
| `/teacher/courses/:courseId/exercises` | 习题库 | 习题增删改、批量导入、挂载到 Note |
| `/teacher/courses/:courseId/analytics` | 学情看板 | 全班掌握热力图、薄弱点预警、学生进度列表 |
| `/teacher/courses/:courseId/enrollments` | 学生管理 | ★ 审批加入申请（通过/拒绝）+ 邀请码生成与管理（创建/复制/停用/查看使用情况） |
| `/teacher/review` | 审核工作台 | ★ 全类型 PR 聚合列表；每条 PR 附 AI 预审评分与风险标记；批量操作；点击进入详情查看 AI 审核报告全文 |
| `/teacher/settings` | 个人设置 | 密码修改、审核流程配置等 |
| **学生端** | | |
| `/student/dashboard` | 学生首页 | 我的课程、图谱学习进度、待处理 PR、近期贡献。**顶部醒目位置：邀请码加入入口** |
| `/student/courses/browse` | 课程广场 | ★ 浏览全校可加入的公开课程，支持搜索/按学科筛选，每门课展示简介+节点数+学生数，点击"申请加入"提交申请 |
| `/student/courses/:courseId/graph` | 图谱浏览 | 网络图 + 树状列表双视图学习模式（只读 + 掌握度标注）。**页面内嵌 AI 辅导员面板** |
| `/student/courses/:courseId/exercises` | 练习 | 按节点/难度筛选练习、答题、自动判分 |
| `/student/private-graph/:graphId` | 私人图谱 | Fork 副本编辑，含 Markdown 编辑器、冲突检测、同步上游、提交 PR 入口 |
| `/student/pr/:prId` | PR 详情 | ★ 查看 PR 状态、AI 审核结果与评分、人工审核意见、Diff 预览、冲突解决、修改重提；`prId=new` 时为新建 PR |
| `/student/contributions` | 我的贡献 | 贡献矩阵热力图、积分、徽章、贡献记录列表 |
| `/student/settings` | 个人设置 | 密码修改等 |

---

## 二、AI 辅导员定位：非全局，跟随公共图谱

```
AI 辅导员只在以下页面出现（公有图谱专属）：

  ┌─────────────────────────────────────────────────┐
  │ 教师端                                            │
  │ /teacher/courses/:courseId/graph  图谱管理页      │
  │                          └── 右侧可收起 AIPanel    │
  │                                                   │
  │ 学生端                                            │
  │ /student/courses/:courseId/graph  图谱浏览页      │
  │                          └── 右侧可收起 AIPanel    │
  └─────────────────────────────────────────────────┘

不在以下位置出现：
  ✗ 全局 Layout（已移除）    ✗ 私人图谱编辑页
  ✗ 审核工作台               ✗ 练习/错题/贡献页
  ✗ 登录页 / 设置页
```

> 设计原因：GraphRAG 检索引擎以班级公有图谱为知识底座，私人图谱未审核不可作为回答依据。减轻无关页面的请求压力。

---

## 三、组件树

### 3.1 顶层结构（修正：AIPanel 移出 Layout）

```
<App>
  ├── <AuthProvider>
  ├── <Router>
  │   ├── <LoginPage />
  │   ├── <TeacherLayout>                  # 不再包含 AIPanel
  │   │   ├── <Sidebar />
  │   │   ├── <Header />
  │   │   └── <Outlet />                   # AIPanel 由具体页面自行嵌入
  │   ├── <StudentLayout>                  # 不再包含 AIPanel
  │   │   ├── <Sidebar />
  │   │   ├── <Header />
  │   │   └── <Outlet />
  │   └── <NotFoundPage />
```

### 3.2 教师端组件展开

```
<TeacherLayout>
  ├── <TeacherSidebar>
  │   ├── <CourseSwitcher>                        # 下拉切换课程
  │   │   └── <CourseOption>                      # 每门课尾部显示待审红点
  │   │       ├── 课程名称
  │   │       └── <PendingBadge count />          # ★ 仅本课程待审数（红点+数字）
  │   ├── <NavItem to="graph" />
  │   ├── <NavItem to="materials" />
  │   ├── <NavItem to="exercises" />
  │   ├── <NavItem to="analytics" />
  │   ├── <NavItem to="enrollments" />             # ★ 学生管理（申请审批+邀请码）
  │   ├── <Divider />
  │   ├── <NavItem to="/teacher/dashboard" />
  │   ├── <NavItem to="/teacher/review" />        # badge: 全部待审总数
  │   └── <NavItem to="/teacher/settings" />
  └── <Outlet>
      │
      ├── <TeacherDashboard>
      │   ├── <CreateCourseButton />              # ★ 跳转 /teacher/courses/new
      │   ├── <PendingReviewByCourse />           # ★ 按课程拆分的待审核概览
      │   │   └── <CoursePendingCard />           # 单门课待审卡片
      │   │       ├── 课程名称
      │   │       ├── 待审数 + AI评分趋势箭头 ↑↓→
      │   │       └── 点击 → P8（审核工作台，自动筛选该课程）
      │   ├── <CourseCardList>
      │   │   └── <CourseCard />
      │   └── <RecentActivity />
      │
      ├── <CreateCourseWizard>                    # ★ /teacher/courses/new
      │   └── <Steps>                             # Ant Design Steps 多步向导
      │       ├── <Step1: CourseInfoForm />       # 课程名称、学期、班级、学科
      │       ├── <Step2: MaterialUpload />       # 上传课件/大纲/教材/代码文档
      │       │   ├── <FileDropZone />            # 拖拽上传区
      │       │   ├── <FileList />                # 已上传文件列表
      │       │   └── <UploadProgress />
      │       ├── <Step3: AIGraphGeneration />    # ★ 图谱生成智能体处理中
      │       │   ├── <GenerationProgress />      # 进度条 + 阶段提示（实体抽取→关系生成→校验）
      │       │   ├── <GeneratedGraphPreview />   # 生成结果预览
      │       │   │   └── <GraphCanvas readOnly /> # 只读预览
      │       │   └── <AIGenerationLog />         # 生成日志（哪个节点从哪份文档抽取）
      │       └── <Step4: GraphEditAndPublish />  # 教师校验调整
      │           ├── <GraphViewer readOnly=false /> # ★ 双视图编辑模式
      │           ├── <NoteDetailPanel />
      │           └── <PublishButton />           # 确认发布到班级
      │
      ├── <CourseContextLayout>
      │   └── <Outlet>
      │       ├── <GraphManagePage>
      │       │   ├── <ViewToolbar />
      │       │   │   ├── <SearchBar />
      │       │   │   ├── <FilterByTag />
      │       │   │   ├── <ActionButtons />        # 新增节点、导入、导出
      │       │   │   └── <AIToggleButton />       # ★ 开关 AI 面板
      │       │   ├── <TreeNodeList />             # ★ 树状列表（放入布局壳的内容侧边栏，宽度可拖拽）
      │       │   ├── <GraphViewer />              # 网络图（主内容区）
      │       │   │   └── <GraphCanvas />
      │       │   ├── <AIPanel />                  # ★ 右侧可收起
      │       │   │   ├── <ChatMessageList />
      │       │   │   ├── <ChatInput />
      │       │   │   └── <CitedNotes />
      │       │   ├── <NoteDetailPanel />
      │       │   │   ├── <MarkdownRenderer />
      │       │   │   ├── <TagEditor />
      │       │   │   ├── <RelationEditor />
      │       │   │   ├── <MountedResources />
      │       │   │   └── <NoteEditDrawer />
      │       │   │       └── <MarkdownEditor />
      │       │   └── <GraphMiniMap />
      │       │
      │       ├── <VersionHistoryPage>
      │       │   ├── <VersionTimeline />
      │       │   └── <VersionDiffViewer />
      │       │
      │       ├── <MaterialPage>
      │       │   ├── <MaterialToolbar />
      │       │   ├── <MaterialList />
      │       │   │   └── <MaterialCard />
      │       │   ├── <MaterialUploadDrawer />
      │       │   └── <NodeMountSelector />
      │       │
      │       ├── <ExercisePage>
      │       │   ├── <ExerciseToolbar />
      │       │   ├── <ExerciseTable />
      │       │   ├── <ExerciseFormDrawer />
      │       │   │   ├── <QuestionEditor />
      │       │   │   ├── <AnswerEditor />
      │       │   │   └── <TagSelect />
      │       │   └── <NodeMountSelector />
      │       │
      │       ├── <AnalyticsPage>
      │       │   ├── <AnalyticsHeader />
      │       │   ├── <MasteryHeatmap />
      │       │   │   └── <GraphCanvas />          # 复用，叠加热力图
      │       │   ├── <WeakPointList />
      │       │   ├── <StudentProgressTable />
      │       │   └── <AlertPanel />
      │       │
      │       └── <EnrollmentsPage>               # ★ /teacher/courses/:courseId/enrollments
      │           ├── <Tabs>
      │           │   ├── <TabPane: 加入申请>
      │           │   │   ├── <RequestFilter />
      │           │   │   ├── <RequestList />
      │           │   │   │   └── <RequestCard />
      │           │   │   │       ├── 学生姓名、学号
      │           │   │   │       ├── 申请留言
      │           │   │   │       ├── 申请时间
      │           │   │   │       └── <ApproveButton /> / <RejectButton />
      │           │   │   └── <BatchApprove />
      │           │   └── <TabPane: 邀请码>
      │           │       ├── <CreateInviteCodeButton />
      │           │       ├── <InviteCodeList />
      │           │       │   └── <InviteCodeCard />
      │           │       │       ├── 邀请码（大字，一键复制按钮）
      │           │       │       ├── 已使用/最大使用次数
      │           │       │       ├── 创建时间 / 过期时间
      │           │       │       ├── <CopyButton />
      │           │       │       └── <DeactivateButton />   # 停用
      │           │       └── <InviteCodeStats />             # 总使用次数统计
      │           └── <EnrolledStudentTable />                # 当前已注册学生列表
      │           └── <AlertPanel />
      │
      ├── <ReviewWorkbench>                        # ★ AI 审核在此
      │   ├── <ReviewToolbar />
      │   │   ├── <FilterBar />
      │   │   │   ├── <CourseFilter />
      │   │   │   ├── <TypeFilter />
      │   │   │   ├── <StatusFilter />
      │   │   │   └── <SortByAI>                   # 按 AI 评分排序
      │   │   └── <BatchActions />
      │   ├── <PRList />
      │   │   └── <PRCard />
      │   │       ├── <PRStatusBadge />
      │   │       ├── <PRDiffPreview />
      │   │       ├── <AIReviewBadge />            # ★ AI 评分标签（绿/黄/红）
      │   │       └── <AIRiskFlags />              # ★ AI 风险标记（疑似重复/内容风险）
      │   └── <PRDetailDrawer />
      │       ├── <PRDiffViewer />
      │       ├── <AIReviewReport />               # ★ 完整 AI 审核报告
      │       │   ├── <AIScoreGauge />             # 评分仪表盘
      │       │   ├── <AIDuplicateCheck />         # 重复度检测结果
      │       │   ├── <AIContentQuality />         # 内容质量评估
      │       │   ├── <AIRiskWarnings />           # 风险项列表
      │       │   └── <AISuggestions />            # AI 修改建议
      │       ├── <ConflictWarning />              # ★ 冲突提示（如有）
      │       ├── <ReviewHistory />
      │       └── <ReviewActionBar />
      │           ├── <ApproveButton />
      │           ├── <RejectWithComment />
      │           └── <TransferToRole />           # 转审
      │
      └── <SettingsPage>
          ├── <ProfileForm />
          └── <ReviewConfigForm />
```

### 3.3 学生端组件展开

```
<StudentLayout>
  ├── <StudentSidebar>
  │   ├── <CourseSwitcher />
  │   ├── <NavItem to="graph" />
  │   ├── <NavItem to="exercises" />
  │   ├── <Divider />
  │   ├── <NavItem to="/student/dashboard" />
  │   ├── <NavItem to="/student/courses/browse" />  # ★ 课程广场
  │   ├── <NavItem to="/student/contributions" />
  │   ├── <NavItem to="/student/settings" />
  │   ├── <Divider />
  │   └── <MyPrivateGraphs />
  └── <Outlet>
      │
      ├── <StudentDashboard>
      │   ├── <InviteCodeJoinCard />              # ★ 醒目的邀请码输入区
      │   ├── <MyCourseCards />
      │   ├── <RecentPRList />
      │   ├── <ContributionSummary />
      │   └── <LearningStreak />
      │
      ├── <CourseBrowsePage>                      # ★ /student/courses/browse
      │   ├── <SearchAndFilterBar />
      │   │   ├── <SearchBox />
      │   │   └── <SubjectFilter />
      │   ├── <CourseGrid />
      │   │   └── <CourseBrowseCard />
      │   │       ├── 课程名、教师、班级
      │   │       ├── 节点数、学生数
      │   │       ├── 课程简介
      │   │       ├── <ApplyButton />              # ★ 申请加入
      │   │       └── <EnrollmentStatusBadge />    # 已申请/已加入/未加入
      │   └── <ApplyDrawer />                      # 申请抽屉
      │       ├── 课程名称显示
      │       ├── <MessageInput />                 # 申请留言
      │       └── <SubmitButton />
      │
      ├── <CourseContextLayout>
      │   └── <Outlet>
      │       ├── <GraphBrowsePage>
      │       │   ├── <ViewToolbar />
      │       │   │   ├── <SearchBar />
      │       │   │   ├── <FilterByTag />
      │       │   │   ├── <ForkButton />
      │       │   │   └── <AIToggleButton />
      │       │   ├── <TreeNodeList />             # ★ 放入内容侧边栏
      │       │   ├── <GraphViewer readOnly />
      │       │   │   └── <GraphCanvas />
      │       │   │       └── <MasteryOverlay />
      │       │   ├── <AIPanel />                  # ★ 仅此页面嵌入
      │       │   ├── <NoteDetailPanel />
      │       │   │   ├── <MarkdownRenderer />
      │       │   │   ├── <MountedResources />
      │       │   │   ├── <RelatedExercises />
      │       │   │   └── <MarkAsMasteredButton />
      │       │   └── <GraphMiniMap />
      │       │
      │       └── <ExercisePage>
      │           ├── <ExerciseFilter />
      │           ├── <ExercisePlayer />
      │           │   ├── <QuestionDisplay />
      │           │   ├── <AnswerInput />
      │           │   └── <ResultFeedback />
      │           └── <RelatedNotes />
      │
      ├── <PrivateGraphEditor>
      │   ├── <PrivateGraphHeader />
      │   │   ├── <BackToSource />
      │   │   ├── <UpstreamSyncStatus />           # ★ 与源图谱的版本差异提示
      │   │   ├── <RebaseButton />                 # ★ 同步上游变更
      │   │   └── <SubmitPRButton />
      │   ├── <GraphViewer readOnly=false />
      │   ├── <NoteDetailPanel />
      │   │   └── <NoteEditDrawer />
      │   │       └── <MarkdownEditor />
      │   └── <ChangeSummaryPanel />
      │
      ├── <PRDetailPage>                           # ★ AI 审核结果在此可见
      │   ├── <PRHeader />
      │   │   ├── <PRStatusBadge />
      │   │   └── <PRTimeline />
      │   │       ├── <TimelineItem: submitted />
      │   │       ├── <TimelineItem: ai_reviewed /> # ★ AI 审核完成节点
      │   │       ├── <TimelineItem: group_leader />
      │   │       └── <TimelineItem: teacher_final />
      │   ├── <AIReviewCard />                     # ★ 学生可查看 AI 评分和报告
      │   │   ├── <AIScoreGauge />
      │   │   ├── <AIDuplicateWarning />
      │   │   └── <AISuggestions />                # AI 修改建议，一键应用
      │   ├── <ConflictPanel />                    # ★ 冲突解决面板（如有冲突）
      │   │   ├── <ConflictList />
      │   │   │   └── <ConflictItem />
      │   │   │       ├── <ConflictNoteTitle />
      │   │   │       ├── <DiffView: mine vs theirs />
      │   │   │       └── <ResolveButtons />       # 保留我的 / 采用对方的 / 手动合并
      │   │   └── <ResolveAllButton />
      │   ├── <PRDiffViewer />
      │   ├── <ReviewHistory />
      │   │   └── <ReviewComment />               # 含人工审核意见
      │   ├── <ModifyResubmitButton />
      │   └── <PRSubmitForm />                     # 新建 PR 时的提交表单
      │       ├── <ChangeTypeSelect />
      │       ├── <ConflictCheck />                # ★ 提交前冲突检测
      │       ├── <PRDiffViewer />
      │       └── <SubmitDescription />
      │
      ├── <WrongAnswerPage>
      │   ├── <WrongAnswerFilter />
      │   ├── <WrongAnswerList />
      │   │   └── <WrongAnswerCard />
      │   │       ├── <QuestionPreview />
      │   │       ├── <MyAnswer />
      │   │       ├── <CorrectAnswer />
      │   │       ├── <RootCauseChain />
      │   │       └── <RedoButton />
      │   └── <RemediationPath />
      │
      ├── <ContributionPage>
      │   ├── <ContributionStats />
      │   ├── <ContributionHeatmap />
      │   ├── <BadgeWall />
      │   │   └── <BadgeCard />
      │   └── <ContributionList />
      │
      └── <SettingsPage>
          └── <ProfileForm />
```

---

## 四、合并冲突解决机制

### 4.1 冲突何时产生

```
时间线：
  1. 学生 A Fork 班级公有图谱（版本 v10）
  2. 教师合并了学生 B 的 PR（公有图谱升级到 v11，修改了 Note X）
  3. 学生 A 在自己的 Fork 中也修改了 Note X
  4. 学生 A 提交 PR → 检测到 Note X 有冲突
```

### 4.2 冲突检测粒度

| 冲突类型 | 检测方式 | 说明 |
|----------|---------|------|
| **同一 Note 内容冲突** | 两份 md diff 的修改行重叠 | 公有图谱和学生 Fork 都改了同一个 Note.content |
| **同一 Note 标签冲突** | tags 数组变更冲突 | 双方改了同一个 Note 的 tags |
| **同一关系冲突** | 同类型、同起点、同终点的边变更 | 都新增/修改/删除了相同的关系 |
| **删除-修改冲突** | 一方删除 Note，另一方修改了同一 Note | 最严重的冲突 |

### 4.3 冲突解决 UI 流程

```
┌─────────────────────────────────────────────────────┐
│  学生提交 PR 时                                       │
│                                                       │
│  1. 提交前自动检测冲突                                  │
│     ┌──────────────────────────────────────────┐     │
│     │ ⚠ 检测到 3 个冲突，需要解决后才能提交     │     │
│     │                                          │     │
│     │ 冲突 1：Note "快速排序" content 被修改     │     │
│     │  ┌──────────────────────────────────┐    │     │
│     │  │ 我的版本          公有图谱当前版本  │    │     │
│     │  │ O(n²)              O(n log n)     │    │     │
│     │  │ 分治法...          分治策略...     │    │     │
│     │  │                                   │    │     │
│     │  │ [保留我的] [采用对方的] [手动合并]  │    │     │
│     │  └──────────────────────────────────┘    │     │
│     │                                          │     │
│     │ 冲突 2：Note "堆排序" 被你删除，公有图谱   │     │
│     │         中的此节点已被修改增强              │     │
│     │  [恢复节点] [保持删除]                     │     │
│     │                                          │     │
│     │ 冲突 3：关系 HAS_ERROR "链表→空指针异常"   │     │
│     │         公有图谱已删除此关系，你修改了描述    │     │
│     │  [同步删除] [保留我的修改]                  │     │
│     └──────────────────────────────────────────┘     │
│                                                       │
│  2. 解决所有冲突后，提交按钮激活                        │
│                                                       │
│  3. 教师审核时如发现新的逻辑冲突，可打回要求重新同步     │
│     PrivateGraphEditor 中提供 <RebaseButton>         │
│     允许学生在提交前主动同步上游                         │
└─────────────────────────────────────────────────────┘
```

### 4.4 前置预防：Rebase 按钮

在 `PrivateGraphEditor` 的 Header 中提供：

```
<PrivateGraphHeader>
  ├── <UpstreamSyncStatus />    # "源图谱比你 Fork 时新增 5 个版本，修改了 12 个节点"
  └── <RebaseButton />          # ★ 点击后拉取上游变更，逐冲突解决后合并到 Fork
      └── <RebaseDialog />
          └── <ConflictPanel /> # 复用冲突解决组件
```

建议学生在提交 PR 前先 Rebase，减少审核时出现冲突的概率。

---

## 五、全局共享组件（跨角色复用）

```
<AIPanel>                              # ★ 非全局，由图谱页面自行嵌入
  ├── <ChatHeader />
  │   ├── <ToggleButton />             # 展开/收起
  │   ├── <GraphContextIndicator />    # 当前知识库：数据结构·计科2101班
  │   └── <NoteContextIndicator />     # 当前选中的 Note 上下文（可选锁定）
  ├── <ChatMessageList />
  │   └── <ChatMessage />
  │       ├── <StreamingText />
  │       └── <CitedNotes />           # 引用 Note 点击跳转到图谱对应节点
  ├── <ChatInput />
  │   └── <ContextTag />              # 附加上下文（错题/指定Note）
  └── <FeedbackButtons />             # 点赞/纠错 → 纠错内容进审核队列

<GraphViewer readOnly>                 # ★ 核心双视图组件
  ├── <GraphCanvas />                  # AntV G6 5.x 网络图
  │   ├── layout: force (引力 + 斥力 + 弹簧)
  │   ├── behaviors: drag-canvas, zoom-canvas, drag-node, hover-activate
  │   ├── plugins: minimap, tooltip, context-menu
  │   ├── animations: enter(渐入), update(过渡), layout(力导运动)
  │   └── <MasteryOverlay />          # 掌握度热力图层
  ├── <TreeNodeList />
  │   ├── <SearchBox />
  │   ├── <TreeNodeItem />
  │   └── drag-and-drop
  └── bidirectional-linkage

<NoteDetailPanel readOnly>
  ├── <NoteHeader />
  │   ├── title
  │   └── <TagList />
  ├── <MarkdownRenderer content />
  ├── <RelationList />
  ├── <MountedResources />
  └── <NoteEditDrawer />              # readOnly=false 时可用
      └── <MarkdownEditor />

<MarkdownEditor>                       # ★ 基于 ByteMD 或 Monaco
  ├── editor panel
  ├── preview panel (toggle)
  ├── toolbar (bold/code/table/math/...)
  ├── [[ ]] autocomplete              # Obsidian 风格双向链接
  └── tag insertion shortcuts         # #knowledge-point 等标签快捷插入

<MarkdownRenderer>
  ├── standard md → HTML
  ├── [[note-id]] → <Link to graph>
  ├── code block → syntax highlight
  └── mermaid block → diagram render

<PRDiffViewer>
  ├── <NoteDiffView />                # md 左右对比 / 统一视图
  ├── <RelationDiffView />            # 关系变更（add/remove/modify 列表）
  └── <MountedDiffView />             # 挂载变更

<ConflictPanel>                        # ★ 冲突解决面板（PR 提交页 + Rebase 弹窗共用）
  ├── <ConflictHeader />
  │   ├── conflictCount
  │   └── <ResolveAllButton />
  ├── <ConflictList />
  │   └── <ConflictItem />
  │       ├── <ConflictTypeBadge />    # content / tags / relation / delete-modify
  │       ├── <SplitDiffView />
  │       │   ├── <MineVersion />
  │       │   └── <TheirsVersion />
  │       └── <ResolveButtons />       # 保留我的 / 采用对方的 / 手动合并
  └── <ManualMergeEditor />           # 手动合并时弹出 md 编辑器

<GraphMiniMap />
```

---

## 六、组件复用关系图

```
                    ┌─────────────────────────┐
                    │     MarkdownEditor       │  ★ 核心
                    └───────────┬─────────────┘
                                │ used by
          ┌─────────────────────┼─────────────────────┐
          ▼                     ▼                     ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ NoteEditDrawer  │   │  PRSubmitForm   │   │ManualMergeEditor│
│ (教师图谱编辑)   │   │  (PR描述填写)    │   │ (冲突手动合并)   │
└─────────────────┘   └─────────────────┘   └─────────────────┘

                    ┌─────────────────────────┐
                    │       GraphViewer        │  ★ 核心
                    └───────────┬─────────────┘
                                │ used by
    ┌───────────────┬───────────┼───────────┬───────────────┐
    ▼               ▼           ▼           ▼               ▼
┌────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│Create  │  │ Graph    │  │ Graph    │  │Private   │  │Analytics │
│Course  │  │ Manage   │  │ Browse   │  │Graph     │  │Page      │
│Wizard  │  │ Page     │  │ Page     │  │Editor    │  │(热力图)   │
│(预览)  │  │(教师编辑) │  │(学生浏览) │  │(Fork编辑) │  │          │
└────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘

                    ┌─────────────────────────┐
                    │      PRDiffViewer        │  ★ 核心
                    └───────────┬─────────────┘
                                │ used by
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐   ┌───────────────────┐   ┌───────────────────┐
│ PRDetailDrawer│   │  PRDetailPage     │   │ChangeSummaryPanel │
│ (教师审核)     │   │  (学生PR详情)      │   │ (提交前预览)       │
└───────────────┘   └───────────────────┘   └───────────────────┘

                    ┌─────────────────────────┐
                    │      ConflictPanel       │  ★ 核心
                    └───────────┬─────────────┘
                                │ used by
                ┌───────────────┴───────────────┐
                ▼                               ▼
        ┌───────────────┐               ┌───────────────┐
        │ PRDetailPage  │               │ RebaseDialog  │
        │ (PR提交/详情)  │               │ (主动同步上游)  │
        └───────────────┘               └───────────────┘

                    ┌─────────────────────────┐
                    │        AIPanel           │
                    └───────────┬─────────────┘
                                │ 仅嵌入于
                ┌───────────────┴───────────────┐
                ▼                               ▼
        ┌───────────────┐               ┌───────────────┐
        │GraphManagePage│               │GraphBrowsePage│
        │  (教师图谱管理) │               │  (学生图谱浏览) │
        └───────────────┘               └───────────────┘
```

---

## 七、AntV G6 效果对标 Obsidian

| Obsidian 效果 | G6 实现方式 | 覆盖度 |
|--------------|------------|--------|
| 力导向布局 + 引力 | `layout: { type: 'force', gravity: 10 }` 牛顿引力 | 100% |
| 拖拽节点后力重算 | `DragElementForce` behavior | 100% |
| 缩放平移 | `zoom-canvas` + `drag-canvas` behaviors | 100% |
| Hover 高亮邻居 | `HoverActivate` behavior (N 度邻居 + 方向控制 + 动画) | 100% |
| Hover tooltip | `Tooltip` plugin (自定义 HTML) | 100% |
| 节点进入动画 | 全局 `animation.enter: 'fade'` + 错开延迟 | 90% |
| 节点呼吸/发光 | Halo shape + 动画循环，或 CSS filter | 需自定义 |
| 暗色主题 | G6 内置 `theme: 'dark'` | 100% |
| 缩略导航 | `Minimap` plugin | 100% |
| 右键菜单 | `ContextMenu` plugin | 100% |

> 结论：G6 5.x 可覆盖 90% 的 Obsidian 图谱体验，发光等视觉效果需自定义节点绘制，工作量可控。

---

## 八、状态管理（Zustand Store）

| Store | 职责 | 关键字段 |
|-------|------|---------|
| `useAuthStore` | 认证 | `user, token, role, login(), logout()` |
| `useCourseStore` | 当前课程 | `currentCourse, courseList, switchCourse()` |
| `useGraphStore` | 图谱交互 | `nodes, edges, selectedNodeId, viewMode, layout` |
| `useAIStore` | AI 面板（页面级） | `isOpen, messages, contextNoteId` |
| `usePRStore` | PR 列表 | `prList, filters, selectedPRId` |
| `useConflictStore` | 冲突解决 | `conflicts[], resolvedMap, resolveById()` |

---

## 九、技术栈

| 层级 | 选型 |
|------|------|
| 框架 | React 18 + TypeScript |
| 路由 | React Router v6 |
| UI 组件库 | Ant Design 5.x |
| 图谱渲染 | AntV G6 5.x（force layout + HoverActivate + Tooltip） |
| Markdown 编辑器 | ByteMD |
| Markdown 渲染 | ByteMD / react-markdown |
| 状态管理 | Zustand |
| HTTP + 缓存 | Axios + TanStack Query |
| 构建 | Vite |
