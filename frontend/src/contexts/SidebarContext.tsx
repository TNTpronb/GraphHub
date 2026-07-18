// 侧边栏内容上下文
// 图谱页等页面通过此 Context 向布局壳注入侧边栏内容

import { createContext, useContext, useState, ReactNode } from 'react'

interface SidebarContextType {
  content: ReactNode | null
  setContent: (node: ReactNode | null) => void
}

const SidebarContext = createContext<SidebarContextType>({
  content: null,
  setContent: () => {},
})

export const useSidebarContent = () => useContext(SidebarContext)

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<ReactNode | null>(null)
  return (
    <SidebarContext.Provider value={{ content, setContent }}>
      {children}
    </SidebarContext.Provider>
  )
}
