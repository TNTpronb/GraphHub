// 自研图渲染引擎：d3-force 物理 + Canvas 2D 渲染

import { useEffect, useRef, useCallback, useState } from 'react'
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
} from 'd3-force'
import { Button, Popover, Switch, Slider, Collapse } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import { mockGraphNodes, mockGraphEdges } from '../../api/mock/graph'
import { useGraphStore } from '../../stores/graphStore'

interface GraphCanvasProps {
  selectedNodeId?: string | null
  onNodeClick?: (nodeId: string) => void
  readOnly?: boolean
}

interface SimNode {
  id: string; x: number; y: number; vx: number; vy: number
  title: string; degree: number; size: number; fill: string
}
interface SimEdge { source: string; target: string }

const degreeMap: Record<string, number> = {}
mockGraphNodes.forEach((n) => { degreeMap[n.id] = 0 })
mockGraphEdges.forEach((e) => {
  degreeMap[e.source] = (degreeMap[e.source] || 0) + 1
  degreeMap[e.target] = (degreeMap[e.target] || 0) + 1
})
const maxDegree = Math.max(...Object.values(degreeMap), 1)

const GraphCanvas: React.FC<GraphCanvasProps> = ({
  selectedNodeId, onNodeClick, readOnly = false,
}) => {
  const storeSelected = useGraphStore((s) => s.selectedNodeId)
  const setSelectedNodeId = useGraphStore((s) => s.setSelectedNodeId)
  const effectiveSelected = selectedNodeId !== undefined ? selectedNodeId : storeSelected
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const simRef = useRef<any>(null)
  const nodesRef = useRef<SimNode[]>([])
  const edgesRef = useRef<SimEdge[]>([])
  const hoveredRef = useRef<string | null>(null)
  const selectedRef = useRef<string | null>(effectiveSelected || null)
  const draggingRef = useRef<{ id: string } | null>(null)
  const panningRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null)
  const offsetRef = useRef({ x: 0, y: 0 })
  const scaleRef = useRef(1)
  const dimOpacityRef = useRef(1)
  const highlightAlphaRef = useRef(0)
  const animFrameRef = useRef(0)

  // ── 设置面板状态 ──
  const [showTags, setShowTags] = useState(true)
  const [showAttachments, setShowAttachments] = useState(true)
  const [showArrows, setShowArrows] = useState(false)
  const [nodeSizeMult, setNodeSizeMult] = useState(100)
  const [edgeWidth, setEdgeWidth] = useState(100)
  const [centerForce, setCenterForce] = useState(0.5)  // 0-10 → 0-1.0
  const [repulsionForce, setRepulsionForce] = useState(40)  // 0-100 → -30 ~ -300
  const [attractionForce, setAttractionForce] = useState(50)// 0-100 → 0.1-1.0
  const [linkDistance, setLinkDistance] = useState(80)      // 像素

  // 力度参数写入 ref，render/restart 直接读
  const forceRef = useRef({ center: 0.05, repulsion: 120, attraction: 0.5, distance: 80 })

  const restartSim = useCallback(() => {
    const sim = simRef.current
    if (!sim) return
    const f = forceRef.current
    sim.force('center', forceCenter(
      (canvasRef.current?.width ?? 800) / 2,
      (canvasRef.current?.height ?? 600) / 2,
    ).strength(f.center))
    sim.force('charge', forceManyBody().strength(() => -f.repulsion))
    sim.force('link', forceLink(edgesRef.current as any).id((d: any) => d.id).distance(f.distance).strength(f.attraction))
    sim.alpha(0.5).restart()
  }, [])

  // ── 渲染 ──
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)
    const ox = offsetRef.current.x, oy = offsetRef.current.y, s = scaleRef.current
    const nodes = nodesRef.current
    const hovered = hoveredRef.current
    const selected = selectedRef.current

    const activeNeighbors = new Set<string>()
    const getNb = (id: string) => {
      const set = new Set<string>([id])
      edgesRef.current.forEach((e) => {
        const sid = typeof e.source === 'string' ? e.source : (e.source as any).id
        const tid = typeof e.target === 'string' ? e.target : (e.target as any).id
        if (sid === id) set.add(tid)
        if (tid === id) set.add(sid)
      })
      return set
    }
    if (hovered) getNb(hovered).forEach((v) => activeNeighbors.add(v))
    if (selected) getNb(selected).forEach((v) => activeNeighbors.add(v))

    const nm = nodeSizeMult / 100
    const ew = edgeWidth / 100

    // ── 边 ──
    edgesRef.current.forEach((e) => {
      const sid = typeof e.source === 'string' ? e.source : (e.source as any).id
      const tid = typeof e.target === 'string' ? e.target : (e.target as any).id
      const sn = nodes.find((n) => n.id === sid)
      const tn = nodes.find((n) => n.id === tid)
      if (!sn || !tn) return
      const x1 = sn.x * s + ox, y1 = sn.y * s + oy
      const x2 = tn.x * s + ox, y2 = tn.y * s + oy
      const isActive = (hovered && (sid === hovered || tid === hovered))
                    || (selected && (sid === selected || tid === selected))
      ctx.globalAlpha = isActive ? 1 : dimOpacityRef.current
      ctx.strokeStyle = isActive ? '#956BF5' : `rgb(${Math.round(200 - ((degreeMap[sid]||1)+(degreeMap[tid]||1))/2/maxDegree*80)},${Math.round(200 - ((degreeMap[sid]||1)+(degreeMap[tid]||1))/2/maxDegree*80)},${Math.round(200 - ((degreeMap[sid]||1)+(degreeMap[tid]||1))/2/maxDegree*80)})`
      ctx.lineWidth = (isActive ? 2 : 1) * ew
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
      // 箭头
      if (showArrows && !isActive) {
        const angle = Math.atan2(y2 - y1, x2 - x1)
        const as = 5 * ew
        const rx = x2 - Math.cos(angle) * (tn.size * nm * s + 4)
        const ry = y2 - Math.sin(angle) * (tn.size * nm * s + 4)
        ctx.beginPath()
        ctx.moveTo(rx, ry)
        ctx.lineTo(rx - Math.cos(angle - 0.5) * as, ry - Math.sin(angle - 0.5) * as)
        ctx.lineTo(rx - Math.cos(angle + 0.5) * as, ry - Math.sin(angle + 0.5) * as)
        ctx.closePath(); ctx.fill()
      }
      ctx.globalAlpha = 1
    })

    // ── 附件节点 ──
    if (showAttachments) {
      // TODO: 渲染挂载的附件图标
    }

    // ── 标签节点 ──
    if (showTags) {
      // TODO: 渲染标签圆角标签
    }

    // ── 节点 ──
    nodes.forEach((n) => {
      const cx = n.x * s + ox, cy = n.y * s + oy, r = n.size * nm * s
      if (cx < -50 || cx > W + 50 || cy < -50 || cy > H + 50) return
      const isActive = activeNeighbors.has(n.id)
      const isSel = n.id === selected

      ctx.globalAlpha = isActive ? 1 : dimOpacityRef.current
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2)

      if (isSel) {
        ctx.fillStyle = '#956BF5'; ctx.fill()
        ctx.strokeStyle = '#6A3FCC'; ctx.lineWidth = 2; ctx.stroke()
      } else if (isActive) {
        ctx.fillStyle = n.fill; ctx.fill()
        ctx.globalAlpha = highlightAlphaRef.current
        ctx.fillStyle = '#956BF5'
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill()
        ctx.globalAlpha = 1
      } else {
        ctx.fillStyle = n.fill; ctx.fill()
      }

      if (isActive) {
        ctx.globalAlpha = 1
        ctx.fillStyle = '#2C2C2C'
        ctx.font = '12px sans-serif'; ctx.textAlign = 'center'
        ctx.fillText(n.title, cx, cy - r - 6)
      }
    })
    ctx.globalAlpha = 1
  }, [showArrows, showTags, showAttachments, nodeSizeMult, edgeWidth])

  // ── 初始化 ──
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const p = canvas.parentElement!
      canvas.width = p.clientWidth
      canvas.height = p.clientHeight
      render()
    }
    resize()
    window.addEventListener('resize', resize)

    const nodes: SimNode[] = mockGraphNodes.map((n) => {
      const deg = degreeMap[n.id] || 1
      const g = Math.round(220 - (deg / maxDegree) * 140)
      return {
        id: n.id, title: n.data.title, degree: deg,
        x: canvas.width / 2 + (Math.random() - 0.5) * 50,
        y: canvas.height / 2 + (Math.random() - 0.5) * 50,
        vx: 0, vy: 0, size: 6 + (deg / maxDegree) * 12,
        fill: `rgb(${g},${g},${g})`,
      }
    })

    const edges: SimEdge[] = mockGraphEdges.map((e) => ({ source: e.source, target: e.target }))
    nodesRef.current = nodes; edgesRef.current = edges

    const avgDegree = Object.values(degreeMap).reduce((a, b) => a + b, 0) / nodes.length
    const densityFactor = Math.max(0.5, 1 - avgDegree / (maxDegree * 2))
    const estimatedSpan = Math.sqrt(nodes.length) * 160 * densityFactor + 200
    const padding = 60
    const idealScale = Math.min(
      (canvas.width - padding * 2) / estimatedSpan,
      (canvas.height - padding * 2) / estimatedSpan, 1.5,
    )
    scaleRef.current = idealScale
    offsetRef.current.x = canvas.width / 2 - (canvas.width / 2) * idealScale
    offsetRef.current.y = canvas.height / 2 - (canvas.height / 2) * idealScale

    const sim = forceSimulation(nodes as any)
      .force('link', forceLink(edges as any).id((d: any) => d.id).distance(80).strength(0.5))
      .force('charge', forceManyBody().strength(() => -120))
      .force('center', forceCenter(canvas.width / 2, canvas.height / 2).strength(0.05))
      .force('collide', forceCollide((d: any) => d.size + 4).strength(0.8))
      .alpha(0.5).alphaMin(0.001).alphaDecay(0.02)
      .on('tick', render)
    simRef.current = sim

    // 渐变动画
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
        if (dimDone && hlDone) { animFrameRef.current = 0; return }
        animFrameRef.current = requestAnimationFrame(animate)
      }
      animFrameRef.current = requestAnimationFrame(animate)
    }

    const hitTest = (mx: number, my: number): SimNode | null => {
      const ox = offsetRef.current.x, oy = offsetRef.current.y, s = scaleRef.current
      for (const n of nodes) {
        const dx = mx - (n.x * s + ox), dy = my - (n.y * s + oy)
        if (dx * dx + dy * dy <= (n.size * s) ** 2) return n
      }
      return null
    }

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left, my = e.clientY - rect.top
      if (draggingRef.current) {
        const ox = offsetRef.current.x, oy = offsetRef.current.y, s = scaleRef.current
        const n = nodes.find((n) => n.id === draggingRef.current!.id)
        if (n) { n.x = (mx - ox) / s; n.y = (my - oy) / s; sim.alpha(0.3).restart() }
        return
      }
      if (panningRef.current) {
        offsetRef.current.x = panningRef.current.ox + (mx - panningRef.current.sx)
        offsetRef.current.y = panningRef.current.oy + (my - panningRef.current.sy)
        render(); return
      }
      const hit = hitTest(mx, my)
      const prev = hoveredRef.current
      hoveredRef.current = hit ? hit.id : null
      canvas.style.cursor = hit ? 'pointer' : 'default'
      if (prev !== hoveredRef.current) startDimAnimation()
    }

    const onPointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left, my = e.clientY - rect.top
      const hit = hitTest(mx, my)
      if (hit && !readOnly) {
        draggingRef.current = { id: hit.id }
        canvas.setPointerCapture(e.pointerId)
      } else {
        panningRef.current = { sx: mx, sy: my, ox: offsetRef.current.x, oy: offsetRef.current.y }
        canvas.setPointerCapture(e.pointerId)
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      if (draggingRef.current) { draggingRef.current = null; canvas.releasePointerCapture(e.pointerId); return }
      if (panningRef.current) {
        const didPan = Math.abs(offsetRef.current.x - panningRef.current.ox) > 3
                    || Math.abs(offsetRef.current.y - panningRef.current.oy) > 3
        panningRef.current = null
        canvas.releasePointerCapture(e.pointerId)
        if (!didPan) {
          const rect = canvas.getBoundingClientRect()
          const hit = hitTest(e.clientX - rect.left, e.clientY - rect.top)
          selectedRef.current = hit ? hit.id : null
          onNodeClick?.(hit?.id ?? '')
          setSelectedNodeId(hit?.id ?? null)
          startDimAnimation()
        }
      }
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left, my = e.clientY - rect.top
      const factor = e.deltaY > 0 ? 0.9 : 1.1
      const ns = Math.max(0.1, Math.min(4, scaleRef.current * factor))
      offsetRef.current.x = mx - (mx - offsetRef.current.x) * (ns / scaleRef.current)
      offsetRef.current.y = my - (my - offsetRef.current.y) * (ns / scaleRef.current)
      scaleRef.current = ns; render()
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
      cancelAnimationFrame(animFrameRef.current)
      sim.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { selectedRef.current = selectedNodeId || null; render() }, [selectedNodeId, render])

  // 力度滑块变化时重启模拟
  useEffect(() => {
    forceRef.current = {
      center: centerForce * 0.1,
      repulsion: 30 + repulsionForce * 2.7,
      attraction: 0.1 + attractionForce * 0.009,
      distance: linkDistance,
    }
    restartSim()
  }, [centerForce, repulsionForce, attractionForce, linkDistance, restartSim])

  // ── 设置面板内容 ──
  const settingsContent = (
    <div style={{ width: 260 }}>
      <Collapse
        ghost
        defaultActiveKey={[]}
        items={[
          {
            key: 'filter', label: '筛选',
            children: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#2C2C2C' }}>标签</span>
                  <Switch size="small" checked={showTags} onChange={setShowTags} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#2C2C2C' }}>附件</span>
                  <Switch size="small" checked={showAttachments} onChange={setShowAttachments} />
                </div>
              </div>
            ),
          },
          {
            key: 'appearance', label: '外观',
            children: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#2C2C2C' }}>箭头</span>
                  <Switch size="small" checked={showArrows} onChange={setShowArrows} />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#2C2C2C', marginBottom: 4 }}>节点大小</div>
                  <Slider min={30} max={200} value={nodeSizeMult} onChange={setNodeSizeMult}
                    tooltip={{ formatter: (v) => `${v}%` }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#2C2C2C', marginBottom: 4 }}>连线粗细</div>
                  <Slider min={20} max={200} value={edgeWidth} onChange={setEdgeWidth}
                    tooltip={{ formatter: (v) => `${v}%` }} />
                </div>
              </div>
            ),
          },
          {
            key: 'force', label: '力度',
            children: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <div style={{ fontSize: 13, color: '#2C2C2C', marginBottom: 4 }}>向心力</div>
                    <Slider min={0} max={10} step={0.1} value={centerForce} onChange={setCenterForce} />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#2C2C2C', marginBottom: 4 }}>节点排斥力</div>
                  <Slider min={0} max={100} value={repulsionForce} onChange={setRepulsionForce} />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#2C2C2C', marginBottom: 4 }}>节点吸引力</div>
                  <Slider min={0} max={100} value={attractionForce} onChange={setAttractionForce} />
                </div>
                <div>
                  <div style={{ fontSize: 13, color: '#2C2C2C', marginBottom: 4 }}>连线长度</div>
                  <Slider min={20} max={300} value={linkDistance} onChange={setLinkDistance} />
                </div>
              </div>
            ),
          },
        ]}
      />
    </div>
  )

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: 500 }}>
      {/* 设置按钮 */}
      <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
        <Popover content={settingsContent} trigger="click" placement="bottomRight">
          <Button size="small" icon={<SettingOutlined />}
            style={{
              width: 28, height: 28, minWidth: 28, padding: 0,
              background: '#fff', border: '0.5px solid var(--color-border)',
              borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }} />
        </Popover>
      </div>
      <canvas
        ref={canvasRef}
        style={{
          width: '100%', height: '100%', minHeight: 500,
          borderRadius: 'var(--radius-lg)', border: '0.5px solid var(--color-border)',
          cursor: 'default', background: '#FAFAFA',
        }}
      />
    </div>
  )
}

export default GraphCanvas
