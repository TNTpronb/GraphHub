import { create } from 'zustand'

export interface WorkspaceTab {
  key: string
  label: string
  type: 'graph' | 'editor' | 'exercise'
  nodeId?: string
}

interface WorkspaceStore {
  tabs: WorkspaceTab[]
  activeKey: string
  openTab: (tab: WorkspaceTab) => void
  closeTab: (key: string) => void
  setActiveKey: (key: string) => void
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  tabs: [{ key: 'graph', label: '图谱', type: 'graph' }],
  activeKey: 'graph',

  openTab: (tab) => {
    const { tabs } = get()
    // 如果已存在，直接切换到该 tab
    if (tabs.some((t) => t.key === tab.key)) {
      set({ activeKey: tab.key })
      return
    }
    set({ tabs: [...tabs, tab], activeKey: tab.key })
  },

  closeTab: (key) => {
    const { tabs, activeKey } = get()
    const idx = tabs.findIndex((t) => t.key === key)
    const next = tabs.filter((t) => t.key !== key)
    let nextActive = activeKey
    if (activeKey === key) {
      nextActive = next[Math.min(idx, next.length - 1)]?.key || 'graph'
    }
    set({ tabs: next, activeKey: nextActive })
  },

  setActiveKey: (key) => set({ activeKey: key }),
}))
