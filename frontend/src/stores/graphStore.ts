import { create } from 'zustand'
import { mockGraphNodes, mockGraphEdges } from '../api/mock/graph'

interface GraphNode {
  id: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
}

interface GraphEdge {
  source: string
  target: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: Record<string, any>
}

interface GraphStore {
  selectedNodeId: string | null
  setSelectedNodeId: (id: string | null) => void
  graphNodes: GraphNode[]
  graphEdges: GraphEdge[]
  addExerciseBank: (title: string, description: string) => void
}

export const useGraphStore = create<GraphStore>((set, get) => ({
  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  graphNodes: [...mockGraphNodes],
  graphEdges: [...mockGraphEdges],
  addExerciseBank: (title, description) => {
    const id = `ex${Date.now()}`
    const newNode = {
      id,
      data: { title, tags: ['#exercise-bank'], content: description },
    }
    const newEdge = {
      source: 'n1',
      target: id,
      data: { relation: 'CONTAINS' },
    }
    set({
      graphNodes: [...get().graphNodes, newNode],
      graphEdges: [...get().graphEdges, newEdge],
    })
  },
}))
