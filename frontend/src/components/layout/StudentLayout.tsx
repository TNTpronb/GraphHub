// 学生端布局壳（占位）
// 后续会替换为真实的 Header + Sidebar + Outlet
import { Outlet } from 'react-router-dom'

const StudentLayout = () => {
  return (
    <div>
      <div style={{ height: 48, background: '#fff', borderBottom: '1px solid #eee', padding: '0 16px', lineHeight: '48px' }}>
        学生端 Header（占位）
      </div>
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 48px)' }}>
        <div style={{ width: 240, background: '#fafafa', padding: 16, borderRight: '1px solid #eee' }}>
          侧边栏（占位）
        </div>
        <div style={{ flex: 1, padding: 24 }}>
          <Outlet /> {/* 子路由内容会在这里渲染 */}
        </div>
      </div>
    </div>
  )
}

export default StudentLayout