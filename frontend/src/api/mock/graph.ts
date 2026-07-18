// src/api/mock/graph.ts
// 模拟知识图谱数据（节点 + 边）
// 后续替换为 Neo4j 查询结果

/*
  G6 v5 的节点数据格式：
  {
    id: string                   唯一标识
    data: { ... }                自定义数据（title, tags, content 等）
    style?: { ... }              视觉样式（可选，优先级低于 node.style 配置）
  }
*/

// 6 种标签对应的节点颜色
const tagColors: Record<string, string> = {
  '#subject':              '#956BF5',
  '#chapter':              '#7B52E0',
  '#knowledge-point':      '#FAFAFA',
  '#code-implementation':  '#F0F0F0',
  '#experiment':           '#E8F5E9',
  '#algorithm-case':       '#FFF3E0',
  '#error-point':          '#FFEBEE',
}

// 模拟节点数据
export const mockGraphNodes = [
  { id: 'n1',  data: { title: '数据结构',      tags: ['#subject'] } },
  { id: 'n2',  data: { title: '线性表',         tags: ['#chapter'] } },
  { id: 'n3',  data: { title: '栈与队列',       tags: ['#chapter'] } },
  { id: 'n4',  data: { title: '树与二叉树',     tags: ['#chapter'] } },
  { id: 'n5',  data: { title: '图',             tags: ['#chapter'] } },
  { id: 'n6',  data: { title: '排序算法',       tags: ['#chapter'] } },
  { id: 'n7',  data: { title: '数组',           tags: ['#knowledge-point'] } },
  { id: 'n8',  data: { title: '链表',           tags: ['#knowledge-point'] } },
  { id: 'n9',  data: { title: '栈',             tags: ['#knowledge-point'] } },
  { id: 'n10', data: { title: '队列',           tags: ['#knowledge-point'] } },
  { id: 'n11', data: { title: '二叉树',         tags: ['#knowledge-point'] } },
  { id: 'n12', data: { title: '二叉搜索树',     tags: ['#knowledge-point', '#algorithm-case'] } },
  { id: 'n13', data: { title: 'AVL 树',         tags: ['#knowledge-point', '#algorithm-case'] } },
  { id: 'n14', data: { title: '红黑树',         tags: ['#knowledge-point', '#algorithm-case'] } },
  { id: 'n15', data: { title: '冒泡排序',       tags: ['#knowledge-point'] } },
  { id: 'n16', data: { title: '快速排序',       tags: ['#knowledge-point'] } },
  { id: 'n17', data: { title: '归并排序',       tags: ['#knowledge-point'] } },
  { id: 'n18', data: { title: '链表实现栈',     tags: ['#code-implementation'] } },
  { id: 'n19', data: { title: '数组实现队列',   tags: ['#code-implementation'] } },
  { id: 'n20', data: { title: '快速排序代码',   tags: ['#code-implementation'] } },
  { id: 'n21', data: { title: '链表操作实验',   tags: ['#experiment'] } },
  { id: 'n22', data: { title: '二叉树遍历实验', tags: ['#experiment'] } },
  { id: 'n23', data: { title: '空指针异常',     tags: ['#error-point'] } },
  { id: 'n24', data: { title: '栈溢出',         tags: ['#error-point'] } },
  { id: 'n25', data: { title: '递归深度超限',   tags: ['#error-point'] } },
  { id: 'n26', data: { title: '排序算法比较',   tags: ['#knowledge-point', '#algorithm-case'] } },
]

// 模拟边数据
// source → target，label 为关系类型，data 存附加信息
export const mockGraphEdges = [
  // CONTAINS 关系（学科→章→知识点）
  { source: 'n1', target: 'n2',  data: { relation: 'CONTAINS' } },
  { source: 'n1', target: 'n3',  data: { relation: 'CONTAINS' } },
  { source: 'n1', target: 'n4',  data: { relation: 'CONTAINS' } },
  { source: 'n1', target: 'n5',  data: { relation: 'CONTAINS' } },
  { source: 'n1', target: 'n6',  data: { relation: 'CONTAINS' } },
  { source: 'n2', target: 'n7',  data: { relation: 'CONTAINS' } },
  { source: 'n2', target: 'n8',  data: { relation: 'CONTAINS' } },
  { source: 'n3', target: 'n9',  data: { relation: 'CONTAINS' } },
  { source: 'n3', target: 'n10', data: { relation: 'CONTAINS' } },
  { source: 'n4', target: 'n11', data: { relation: 'CONTAINS' } },
  { source: 'n4', target: 'n12', data: { relation: 'CONTAINS' } },
  { source: 'n4', target: 'n13', data: { relation: 'CONTAINS' } },
  { source: 'n4', target: 'n14', data: { relation: 'CONTAINS' } },
  { source: 'n6', target: 'n15', data: { relation: 'CONTAINS' } },
  { source: 'n6', target: 'n16', data: { relation: 'CONTAINS' } },
  { source: 'n6', target: 'n17', data: { relation: 'CONTAINS' } },

  // PREREQUISITE 关系（前置依赖）— 数组 → 链表 → 栈/队列
  { source: 'n8',  target: 'n7',  data: { relation: 'PREREQUISITE' } },
  { source: 'n9',  target: 'n8',  data: { relation: 'PREREQUISITE' } },
  { source: 'n10', target: 'n8',  data: { relation: 'PREREQUISITE' } },
  { source: 'n11', target: 'n8',  data: { relation: 'PREREQUISITE' } },
  { source: 'n12', target: 'n11', data: { relation: 'PREREQUISITE' } },
  { source: 'n13', target: 'n12', data: { relation: 'PREREQUISITE' } },
  { source: 'n14', target: 'n13', data: { relation: 'PREREQUISITE' } },
  { source: 'n15', target: 'n7',  data: { relation: 'PREREQUISITE' } },
  { source: 'n16', target: 'n15', data: { relation: 'PREREQUISITE' } },

  // CODE_IMPL 关系（代码→知识点）
  { source: 'n18', target: 'n9',  data: { relation: 'CODE_IMPL' } },
  { source: 'n19', target: 'n10', data: { relation: 'CODE_IMPL' } },
  { source: 'n20', target: 'n16', data: { relation: 'CODE_IMPL' } },

  // HAS_ERROR 关系（知识点→易错点）
  { source: 'n8',  target: 'n23', data: { relation: 'HAS_ERROR' } },
  { source: 'n9',  target: 'n24', data: { relation: 'HAS_ERROR' } },
  { source: 'n11', target: 'n25', data: { relation: 'HAS_ERROR' } },

  // OPTIMIZE_FROM 关系（优化演进）— 冒泡→快排→归并
  { source: 'n16', target: 'n15', data: { relation: 'OPTIMIZE_FROM' } },
  { source: 'n17', target: 'n16', data: { relation: 'OPTIMIZE_FROM' } },

  // CONFUSE_WITH 关系（易混淆）
  { source: 'n9', target: 'n10', data: { relation: 'CONFUSE_WITH' } },

  // EXPERIMENT 关系
  { source: 'n21', target: 'n8',  data: { relation: 'CODE_IMPL' } },
  { source: 'n22', target: 'n11', data: { relation: 'CODE_IMPL' } },
]

// 关系类型 → 连线颜色映射
export const relationColors: Record<string, string> = {
  CONTAINS:        '#CECECE',
  PREREQUISITE:    '#D4A72C',
  CODE_IMPL:       '#1A7F1A',
  CONFUSE_WITH:    '#CF222E',
  OPTIMIZE_FROM:   '#956BF5',
  HAS_ERROR:       '#CF222E',
}

// 关系类型 → 线型（实线 / 虚线）
export const relationLineStyle: Record<string, 'solid' | 'dashed' | 'dotted'> = {
  CONTAINS:        'solid',
  PREREQUISITE:    'solid',
  CODE_IMPL:       'dashed',
  CONFUSE_WITH:    'dotted',
  OPTIMIZE_FROM:   'dashed',
  HAS_ERROR:       'dotted',
}

// 获取节点的 tag 颜色（用于节点背景色）
export const getNodeColor = (nodeId: string): string => {
  const node = mockGraphNodes.find((n) => n.id === nodeId)
  if (!node || !node.data.tags.length) return '#FAFAFA'

  // 优先取第一个 tag 的颜色
  const primaryTag = node.data.tags[0]
  return tagColors[primaryTag] || '#FAFAFA'
}

// 获取节点大小（subject > chapter > 其他）
export const getNodeSize = (nodeId: string): number => {
  const node = mockGraphNodes.find((n) => n.id === nodeId)
  if (!node) return 24
  if (node.data.tags.includes('#subject')) return 48
  if (node.data.tags.includes('#chapter')) return 36
  return 28
}