import type { ThemeConfig } from "antd";

//主题色
const colorPrimary   = '#956BF5'
const colorBgBase    = '#FAFAFA'
const colorTextBase  = '#2C2C2C'
const colorBorder    = '#CECECE'

const themeConfig: ThemeConfig = {
  // ── 全局 Token（影响所有组件） ──
  token: {
    // 颜色
    colorPrimary,                                // 主色：按钮、选中态、链接
    colorBgContainer: '#FFFFFF',                 // 容器/卡片背景（比页背景白一度）
    colorBgLayout:    colorBgBase,               // 页面布局背景
    colorBgElevated:  '#FFFFFF',                 // 浮层/弹窗背景
    colorBorder,                                 // 默认边框色
    colorBorderSecondary: '#E8E8E8',             // 次要边框：表格行线
    colorText:         colorTextBase,            // 正文
    colorTextSecondary:'#6B6B6B',                // 次要文字
    colorTextTertiary: '#999999',                // 辅助文字
    colorLink:         '#539BF5',                  // 浅蓝链接色

    // 字体
    fontSize:   14,                              // 默认字号 14px
    fontSizeLG: 16,                              // 大字号 16px
    fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI',
                 'PingFang SC', 'Microsoft YaHei', sans-serif`,

    // 圆角
    borderRadius:   6,                           // 默认圆角
    borderRadiusLG: 8,                           // 大圆角
    borderRadiusSM: 4,                           // 小圆角

    // 间距（AntD 会自动基于这些计算内部间距）
    padding:          16,                        // 默认内边距
    paddingXS:        8,
    paddingSM:        12,
    paddingLG:        24,
    marginXS:         4,
    marginSM:         8,
    margin:           12,
    marginMD:         16,
    marginLG:         24,
    marginXL:         32,

    // 阴影（极简，GitHub 风格几乎没有阴影）
    boxShadow:        '0 1px 2px rgba(0,0,0,0.04)',
    boxShadowSecondary:'0 4px 12px rgba(0,0,0,0.08)',
  },

    // ── 组件级 Token（按照之前的设计逐组件微调） ──
  components: {
    // 按钮：去掉默认阴影，统一字重
    Button: {
      primaryShadow:   'none',
      defaultShadow:   'none',
      fontWeight:      500,
      controlHeight:   32,                       // 标准按钮高度
      controlHeightSM: 28,
      controlHeightLG: 40,
      paddingInline:   16,                       // 左右内边距
      borderRadius:    6,
    },

    // 输入框：focus 时紫色外发光
    Input: {
      activeShadow: '0 0 0 3px rgba(149,107,245,0.15)',
      borderRadius: 4,
    },

    // 卡片：调整内边距（AntD 默认 24px 太大）
    Card: {
      paddingLG: 16,
    },

    // 表格：表头浅灰底、去掉竖线
    Table: {
      headerBg:      colorBgBase,
      headerColor:   colorTextBase,
      rowHoverBg:    '#F6F6F6',                  // hover 时极浅灰
      borderColor:   '#E8E8E8',
      fontSize:      14,
    },

    // 标签：统一圆角
    Tag: {
      borderRadiusSM: 4,
    },

    // 菜单项
    Menu: {
      itemHeight:       36,
      itemBorderRadius: 6,
      subMenuItemBorderRadius: 6,
    },

    // 标签页
    Tabs: {
      horizontalItemGutter: 24,
    },
  },
}

export default themeConfig