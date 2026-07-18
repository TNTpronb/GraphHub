// 自研图渲染引擎：d3-force 物理 + Canvas 2D 渲染
// 彻底绕开 G6 的 behavior 管线冲突

import { useEffect, useRef, useCallback } from 'react'
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
} from 'd3-force'
import { mockGraphNodes, mockGraphEdges } from '../../api/mock/graph'

interface GraphCanvasProps {
  selectedNodeId?: string | null
  onNodeClick?: (nodeId: string) => void
  readOnly?: boolean
}

interface SimNode {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  title: string
  degree: number
  size: number
  fill: string
}

interface SimEdge {
  source: string
  target: string
}

// 度数统计
const degreeMap: Record<string, number> = {}
mockGraphNodes.forEach((n) => { degreeMap[n.id] = 0 })
mockGraphEdges.forEach((e) => {
  degreeMap[e.source] = (degreeMap[e.source] || 0) + 1
  degreeMap[e.target] = (degreeMap[e.target] || 0) + 1
})
const maxDegree = Math.max(...Object.values(degreeMap), 1)

const GraphCanvas: React.FC<GraphCanvasProps> = ({
  selectedNodeId,
  onNodeClick,
  readOnly = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const simRef = useRef<any>(null)
  const nodesRef = useRef<SimNode[]>([])
  const edgesRef = useRef<SimEdge[]>([])
  // 交互状态（ref 避免重渲染）
  const hoveredRef = useRef<string | null>(null)
  const selectedRef = useRef<string | null>(selectedNodeId || null)
  const draggingRef = useRef<{ id: string; ox: number; oy: number } | null>(null)
  const panningRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null)
  const offsetRef = useRef({ x: 0, y: 0 })
  const scaleRef = useRef(1)
  // 渐变动画：dimOpacity 从 1 渐变到 0.15（非高亮节点变暗），反之亦然
  const dimOpacityRef = useRef(1)
  const highlightAlphaRef = useRef(0) // 高亮紫色叠加透明度：0=灰色, 1=紫色
  const animFrameRef = useRef(0)

  // 获取邻居节点和关联边
  const getNeighborIds = useCallback((nodeId: string): Set<string> => {
    const s = new Set<string>([nodeId])
    edgesRef.current.forEach((e) => {
      const sid = typeof e.source === 'string' ? e.source : (e.source as any).id
      const tid = typeof e.target === 'string' ? e.target : (e.target as any).id
      if (sid === nodeId) s.add(tid)
      if (tid === nodeId) s.add(sid)
    })
    return s
  }, [])

  const getRelatedEdges = useCallback((nodeId: string): string[] => {
    const ids: string[] = []
    edgesRef.current.forEach((e, i) => {
      const sid = typeof e.source === 'string' ? e.source : (e.source as any).id
      const tid = typeof e.target === 'string' ? e.target : (e.target as any).id
      if (sid === nodeId || tid === nodeId) ids.push(`e${i}`)
    })
    return ids
  }, [])

  // 渲染整帧
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width
    const H = canvas.height
    ctx.clearRect(0, 0, W, H)

    const ox = offsetRef.current.x
    const oy = offsetRef.current.y
    const s = scaleRef.current
    const nodes = nodesRef.current
    const hovered = hoveredRef.current
    const selected = selectedRef.current

    // 活跃邻居集合（hover 或 selected）
    const activeNeighbors = new Set<string>()
    if (hovered) getNeighborIds(hovered).forEach((id) => activeNeighbors.add(id))
    if (selected) getNeighborIds(selected).forEach((id) => activeNeighbors.add(id))

    // ── 绘制边 ──
    edgesRef.current.forEach((e) => {
      // d3-force forceLink 会把 source/target 从字符串改成节点对象
      const sid = typeof e.source === 'string' ? e.source : (e.source as any).id
      const tid = typeof e.target === 'string' ? e.target : (e.target as any).id
      const sn = nodes.find((n) => n.id === sid)
      const tn = nodes.find((n) => n.id === tid)
      if (!sn || !tn) return

      const x1 = sn.x * s + ox
      const y1 = sn.y * s + oy
      const x2 = tn.x * s + ox
      const y2 = tn.y * s + oy

      // 与高亮节点相关的边用紫色，否则灰色 + 可能变暗
      const isActive =
        (hovered && (sid === hovered || tid === hovered)) ||
        (selected && (sid === selected || tid === selected))

      if (isActive) {
        ctx.strokeStyle = '#956BF5'
        ctx.lineWidth = 2
        ctx.globalAlpha = 1
      } else {
        const avg = ((degreeMap[sid] || 1) + (degreeMap[tid] || 1)) / 2
        const g = Math.round(200 - (avg / maxDegree) * 80)
        ctx.strokeStyle = `rgb(${g},${g},${g})`
        ctx.lineWidth = 1
        ctx.globalAlpha = isActive ? 1 : dimOpacityRef.current
      }

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
      ctx.globalAlpha = 1
    })

    // ── 绘制节点 ──
    nodes.forEach((n) => {
      const cx = n.x * s + ox
      const cy = n.y * s + oy
      const r = n.size * s

      // 在画布外就跳过
      if (cx < -50 || cx > W + 50 || cy < -50 || cy > H + 50) return

      const isActive = activeNeighbors.has(n.id)
      const isSel = n.id === selected

      // 非活跃节点变暗（渐变值），活跃节点保持 1
      ctx.globalAlpha = isActive ? 1 : dimOpacityRef.current

      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)

      if (isSel) {
        // 选中态：直接紫色
        ctx.fillStyle = '#956BF5'
        ctx.fill()
        ctx.strokeStyle = '#6A3FCC'
        ctx.lineWidth = 2
        ctx.stroke()
      } else if (isActive) {
        // 高亮态：先画灰色底，再用渐变紫色叠加在上面
        ctx.fillStyle = n.fill
        ctx.fill()
        ctx.globalAlpha = highlightAlphaRef.current
        ctx.fillStyle = '#956BF5'
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      } else {
        ctx.fillStyle = n.fill
        ctx.fill()
      }

      // hover/select 时显示 label
      if (isActive) {
        ctx.fillStyle = '#2C2C2C'
        ctx.font = '12px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(n.title, cx, cy - r - 6)
      }
    })

    ctx.globalAlpha = 1
  }, [getNeighborIds])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // 初始化画布尺寸
    const resize = () => {
      const p = canvas.parentElement!
      canvas.width = p.clientWidth
      canvas.height = p.clientHeight
      render()
    }
    resize()
    window.addEventListener('resize', resize)

    // 构建物理节点
    const nodes: SimNode[] = mockGraphNodes.map((n) => {
      const deg = degreeMap[n.id] || 1
      const g = Math.round(220 - (deg / maxDegree) * 140)
      return {
        id: n.id,
        x: canvas.width / 2 + (Math.random() - 0.5) * 50,
        y: canvas.height / 2 + (Math.random() - 0.5) * 50,
        vx: 0, vy: 0,
        title: n.data.title,
        degree: deg,
        size: 6 + (deg / maxDegree) * 12,
        fill: `rgb(${g},${g},${g})`,
      }
    })

    const edges: SimEdge[] = mockGraphEdges.map((e) => ({
      source: e.source,
      target: e.target,
    }))

    nodesRef.current = nodes
    edgesRef.current = edges

    // 根据节点数 + 度数分布估算布局占据的直径
    // 核心思想：每个节点占一个圆形区域 ≈ linkDistance²，总面积的直径 ∝ √N
    // 再加上度数高的节点靠得更近（repulsion 较小），整体会更紧凑
    const avgDegree = Object.values(degreeMap).reduce((a, b) => a + b, 0) / nodes.length
    // 直径系数：度数越高图的边密度越大，节点更聚拢，系数越小
    const densityFactor = Math.max(0.5, 1 - avgDegree / (maxDegree * 2))
    const estimatedSpan = Math.sqrt(nodes.length) * 160 * densityFactor + 200

    // 缩放：确保估算的直径能放进画布（留 padding）
    const padding = 60
    const idealScale = Math.min(
      (canvas.width - padding * 2) / estimatedSpan,
      (canvas.height - padding * 2) / estimatedSpan,
      1.5,
    )
    scaleRef.current = idealScale
    // 偏移量：使力模拟中心点 (canvas.width/2, canvas.height/2) 在缩放后仍在画布中心
    offsetRef.current.x = canvas.width / 2 - (canvas.width / 2) * idealScale
    offsetRef.current.y = canvas.height / 2 - (canvas.height / 2) * idealScale

    // 创建 d3-force 模拟
    const sim = forceSimulation(nodes as any)
      .force('link', forceLink(edges as any).id((d: any) => d.id).distance(80).strength(0.5))
      .force('charge', forceManyBody().strength(() => -120))
      .force('center', forceCenter(canvas.width / 2, canvas.height / 2).strength(0.8))
      .force('collide', forceCollide((d: any) => d.size + 4).strength(0.8))
      .alpha(0.5)
      .alphaMin(0.001)
      .alphaDecay(0.02)
      .on('tick', render)

    simRef.current = sim

    // ── 渐变动画循环 ──
    const startDimAnimation = () => {
      cancelAnimationFrame(animFrameRef.current)
      const animate = () => {
        const dimTarget = hoveredRef.current || selectedRef.current ? 0.15 : 1
        const hlTarget = hoveredRef.current || selectedRef.current ? 1 : 0

        const dimNext = dimOpacityRef.current + (dimTarget - dimOpacityRef.current) * 0.18
        const hlNext = highlightAlphaRef.current + (hlTarget - highlightAlphaRef.current) * 0.18

        const dimDone = Math.abs(dimNext - dimTarget) < 0.003
        const hlDone = Math.abs(hlNext - hlTarget) < 0.003

        dimOpacityRef.current = dimDone ? dimTarget : dimNext
        highlightAlphaRef.current = hlDone ? hlTarget : hlNext

        render()

        if (dimDone && hlDone) {
          animFrameRef.current = 0
          return
        }
        animFrameRef.current = requestAnimationFrame(animate)
      }
      animFrameRef.current = requestAnimationFrame(animate)
    }

    // ── 鼠标事件 ──
    const hitTest = (mx: number, my: number): SimNode | null => {
      const ox = offsetRef.current.x
      const oy = offsetRef.current.y
      const s = scaleRef.current
      for (const n of nodes) {
        const dx = mx - (n.x * s + ox)
        const dy = my - (n.y * s + oy)
        if (dx * dx + dy * dy <= (n.size * s) ** 2) return n
      }
      return null
    }

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      if (draggingRef.current) {
        const ox = offsetRef.current.x
        const oy = offsetRef.current.y
        const s = scaleRef.current
        const n = nodes.find((n) => n.id === draggingRef.current!.id)
        if (n) {
          n.x = (mx - ox) / s
          n.y = (my - oy) / s
          sim.alpha(0.3).restart()
        }
        return
      }

      if (panningRef.current) {
        offsetRef.current.x = panningRef.current.ox + (mx - panningRef.current.sx)
        offsetRef.current.y = panningRef.current.oy + (my - panningRef.current.sy)
        render()
        return
      }

      const hit = hitTest(mx, my)
      const prev = hoveredRef.current
      if (hit) {
        hoveredRef.current = hit.id
        canvas.style.cursor = 'pointer'
      } else {
        hoveredRef.current = null
        canvas.style.cursor = 'default'
      }
      if (prev !== hoveredRef.current) startDimAnimation()
    }

    const onPointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      const hit = hitTest(mx, my)
      if (hit && !readOnly) {
        // 拖拽节点
        draggingRef.current = { id: hit.id, ox: mx, oy: my }
        canvas.setPointerCapture(e.pointerId)
      } else {
        // 拖拽画布
        panningRef.current = { sx: mx, sy: my, ox: offsetRef.current.x, oy: offsetRef.current.y }
        canvas.setPointerCapture(e.pointerId)
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      if (draggingRef.current) {
        draggingRef.current = null
        canvas.releasePointerCapture(e.pointerId)
        return
      }
      if (panningRef.current) {
        const dx = Math.abs(e.clientX - panningRef.current.sx - canvas.getBoundingClientRect().left + canvas.getBoundingClientRect().left)
        // 简化判断：如果移动很小，视为 click
        const didPan = Math.abs(offsetRef.current.x - panningRef.current.ox) > 3
                      || Math.abs(offsetRef.current.y - panningRef.current.oy) > 3
        panningRef.current = null
        canvas.releasePointerCapture(e.pointerId)

        if (!didPan) {
          // 这是 click
          const rect = canvas.getBoundingClientRect()
          const mx = e.clientX - rect.left
          const my = e.clientY - rect.top
          const hit = hitTest(mx, my)
          if (hit) {
            selectedRef.current = hit.id
            onNodeClick?.(hit.id)
          } else {
            selectedRef.current = null
            onNodeClick?.('')
          }
          startDimAnimation()
        }
      }
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const factor = e.deltaY > 0 ? 0.9 : 1.1
      const newScale = Math.max(0.1, Math.min(4, scaleRef.current * factor))

      // 以鼠标位置为中心缩放
      const ox = offsetRef.current.x
      const oy = offsetRef.current.y
      offsetRef.current.x = mx - (mx - ox) * (newScale / scaleRef.current)
      offsetRef.current.y = my - (my - oy) * (newScale / scaleRef.current)
      scaleRef.current = newScale
      render()
    }

    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })

    return () => {
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('wheel', onWheel)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      sim.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 外部 selectedNodeId 变化
  useEffect(() => {
    selectedRef.current = selectedNodeId || null
    render()
  }, [selectedNodeId, render])

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 500,
        borderRadius: 'var(--radius-lg)',
        border: '0.5px solid var(--color-border)',
        cursor: 'default',
        background: '#FAFAFA',
      }}
    />
  )
}

export default GraphCanvas
