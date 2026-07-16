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