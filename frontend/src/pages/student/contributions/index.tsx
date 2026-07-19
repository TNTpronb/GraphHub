// 我的贡献页（学生端 — 含 GitHub 风格热力图）

import { useMemo } from 'react'
import { Tooltip } from 'antd'
import { TrophyOutlined, BugOutlined, StarOutlined } from '@ant-design/icons'

// 生成近半年贡献数据
const generateContributions = () => {
  const data: { date: string; count: number }[] = []
  const now = new Date()
  for (let i = 179; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const rand = Math.random()
    data.push({ date: key, count: rand < 0.3 ? 0 : rand < 0.5 ? 1 : rand < 0.7 ? 2 : rand < 0.85 ? 3 : 4 })
  }
  return data
}

const groupByWeek = (data: { date: string; count: number }[]) => {
  const weeks: { date: string; count: number }[][] = []
  let cur: { date: string; count: number }[] = []
  const first = new Date(data[0].date)
  for (let i = 0; i < first.getDay(); i++) cur.push({ date: '', count: -1 })
  data.forEach((d) => {
    cur.push(d)
    if (new Date(d.date).getDay() === 6) { weeks.push(cur); cur = [] }
  })
  if (cur.length > 0) weeks.push(cur)
  return weeks
}

const colors = ['#EBEDF0', '#D6CCF0', '#B8A0E8', '#9B74E0', '#956BF5']
const weekDayLabels = ['', '一', '', '三', '', '五', '']

const StudentContributions = () => {
  const rawData = useMemo(generateContributions, [])
  const weeks = useMemo(() => groupByWeek(rawData), [rawData])

  const records = [
    { type: 'pr', desc: '新增节点 "红黑树"', date: '2 天前', points: 50 },
    { type: 'issue', desc: '报告问题：栈溢出描述不准确', date: '3 天前', points: 20 },
    { type: 'issue', desc: '解答问题：快速排序稳定性讨论', date: '1 周前', points: 30 },
    { type: 'pr', desc: '修改关系：栈←队列', date: '1 周前', points: 40 },
  ]

  const icons: Record<string, React.ReactNode> = {
    pr: <TrophyOutlined style={{ color: '#956BF5' }} />,
    issue: <BugOutlined style={{ color: '#D4A72C' }} />,
  }

  return (
    <div>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>我的贡献</h3>

      {/* 积分统计 */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        {[
          { label: '总积分', value: 285, icon: <TrophyOutlined />, color: '#D4A72C' },
          { label: '已关闭 Issue', value: 3, icon: <BugOutlined />, color: '#CF222E' },
          { label: 'PR 提交', value: 5, icon: <StarOutlined />, color: '#956BF5' },
        ].map((s) => (
          <div key={s.label} style={{
            flex: 1, padding: 16, textAlign: 'center', background: '#fff',
            borderRadius: 8, border: '0.5px solid var(--color-border)',
          }}>
            <div style={{ fontSize: 24, color: s.color }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#999' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* 热力图 + 贡献列表 左右分栏 */}
      <div style={{ display: 'flex', gap: 20 }}>
        {/* 左：贡献记录列表 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {records.map((c, i) => (
            <div key={i} style={{
              padding: '10px 16px', background: '#fff', cursor: 'pointer',
              border: '0.5px solid var(--color-border)', borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {icons[c.type]}
                <div>
                  <div style={{ fontSize: 13 }}>{c.desc}</div>
                  <div style={{ fontSize: 12, color: '#999' }}>{c.date}</div>
                </div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#956BF5' }}>+{c.points}</span>
            </div>
          ))}
        </div>

        {/* 右：热力图 */}
        <div style={{
          padding: '12px 16px', background: '#fff',
          borderRadius: 8, border: '0.5px solid var(--color-border)',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: '#2C2C2C' }}>
            最近 26 周
          </div>
          <table style={{ borderSpacing: 3 }}>
            <tbody>
              {[0, 1, 2, 3, 4, 5, 6].map((row) => (
                <tr key={row}>
                  <td style={{ fontSize: 10, color: '#999', textAlign: 'right', paddingRight: 4, width: 20 }}>
                    {weekDayLabels[row]}
                  </td>
                  {weeks.map((week, wi) => (
                    <td key={wi}>
                      {week[row] && week[row].count >= 0 ? (
                        <Tooltip title={`${week[row].date}: ${week[row].count} 次贡献`}>
                          <div style={{
                            width: 12, height: 12, borderRadius: 2,
                            background: colors[week[row].count] || colors[0],
                          }} />
                        </Tooltip>
                      ) : (
                        <div style={{ width: 12, height: 12 }} />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 11, color: '#999' }}>
            <span>Less</span>
            {colors.map((c) => <div key={c} style={{ width: 12, height: 12, borderRadius: 2, background: c }} />)}
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudentContributions
