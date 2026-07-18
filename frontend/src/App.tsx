// src/App.tsx
// 应用根组件：主题 → 路由
// 目前先只有主题包裹，路由在下一步配置

import ThemeProvider from './theme/ThemeProvider'
import { RouterProvider } from 'react-router-dom'
import router from './router'
import { SidebarProvider } from './contexts/SidebarContext'

function App() {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <RouterProvider router={router} />
      </SidebarProvider>
    </ThemeProvider>
  )
}

export default App