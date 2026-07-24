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

interface GraphVersion {
  key: string
  label: string
  forkedAt: string
  sourceVersion: string
  description: string
  nodeCount: number
}

interface CommitRecord {
  message: string
  authorId: string
  authorName: string
  timestamp: number
}

interface GraphStore {
  selectedNodeId: string | null
  setSelectedNodeId: (id: string | null) => void
  graphNodes: GraphNode[]
  graphEdges: GraphEdge[]
  addExerciseBank: (title: string, description: string, retryLimit?: number, aiGradingEnabled?: boolean) => void
  myGraphs: GraphVersion[]
  commitHistory: CommitRecord[]
  forkGraph: (label?: string) => void
  submitToClassGraph: (message: string, authorId: string, authorName: string) => void
}

export const useGraphStore = create<GraphStore>((set, get) => ({
  selectedNodeId: null,
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  graphNodes: [...mockGraphNodes],
  graphEdges: [...mockGraphEdges],
  addExerciseBank: (title, description, retryLimit = 0, aiGradingEnabled = true) => {
    const id = `ex${Date.now()}`
    const newNode = {
      id,
      data: { title, tags: ['#exercise-bank'], content: description, retryLimit, aiGradingEnabled },
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
  myGraphs: [],
  commitHistory: [],
  forkGraph: (label) => {
    const v = get().myGraphs.length + 1
    const versionKey = `t${Date.now()}`
    const newGraph = {
      key: versionKey,
      label: label || `我的图谱 ${v}`,
      forkedAt: '刚刚',
      sourceVersion: '班级图谱',
      description: '基于班级图谱的私人编辑副本',
      nodeCount: get().graphNodes.length,
    }
    set({ myGraphs: [newGraph, ...get().myGraphs] })
  },
  submitToClassGraph: (message, authorId, authorName) => {
    const record = {
      message,
      authorId,
      authorName,
      timestamp: Date.now(),
    }
    set({ commitHistory: [record, ...get().commitHistory] })
  },
}))
