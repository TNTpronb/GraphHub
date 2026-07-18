import { create } from 'zustand'

interface GraphStore {
  selectedNodeId: string | null
  setSelectedNodeId: (id: string | null) => void
}

export const useGraphStore = create<GraphStore>((set) => ({
  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
}))
