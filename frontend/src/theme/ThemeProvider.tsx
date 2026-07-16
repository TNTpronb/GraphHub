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