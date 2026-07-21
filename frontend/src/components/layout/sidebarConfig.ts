//侧边栏菜单项配置

import React from 'react'
import {
  HomeOutlined,
  ApartmentOutlined,
  AuditOutlined,
  SettingOutlined,
  BookOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  BarChartOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import type { ItemType } from 'antd/es/menu/interface'

//教师端相关菜单
export const teacherCourseMenuItems: ItemType[] = [
  { key: 'graph',       icon: React.createElement(ApartmentOutlined), label: '图谱管理' },
  { key: 'materials',   icon: React.createElement(FileTextOutlined),   label: '课程资料' },
  { key: 'exercises',   icon: React.createElement(ExperimentOutlined),  label: '习题库' },
  { key: 'analytics',   icon: React.createElement(BarChartOutlined),    label: '学情分析' },
  { key: 'enrollments', icon: React.createElement(TeamOutlined),        label: '学生管理' },
]

// 教师端全局菜单（始终显示在侧边栏下方）
export const teacherGlobalMenuItems: ItemType[] = [
  { key: 'dashboard', icon: React.createElement(HomeOutlined),    label: '首页' },
  { key: 'review',    icon: React.createElement(AuditOutlined),    label: '审核工作台' },
  { key: 'settings',  icon: React.createElement(SettingOutlined),  label: '设置' },
]

// 学生端菜单
export const studentMenuItems: ItemType[] = [
  { key: 'dashboard', icon: React.createElement(HomeOutlined),       label: '首页' },
  { key: 'browse',    icon: React.createElement(SearchOutlined),      label: '课程广场' },
  { key: 'graph',     icon: React.createElement(ApartmentOutlined),  label: '图谱浏览' },
  { key: 'exercises', icon: React.createElement(ExperimentOutlined), label: '练习' },
  { key: 'contributions', icon: React.createElement(BarChartOutlined), label: '我的贡献' },
  { key: 'settings',  icon: React.createElement(SettingOutlined),    label: '设置' },
]