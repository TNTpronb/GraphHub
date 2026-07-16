// src/App.tsx
// 应用根组件：主题 → 路由
// 目前先只有主题包裹，路由在下一步配置

import ThemeProvider from './theme/ThemeProvider'
import { RouterProvider } from 'react-router-dom'
import router from './router'

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  )
}

export default App