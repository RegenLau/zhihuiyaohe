# AGENTS.md

## 项目范围

本说明适用于 `/Users/regenlau/Desktop/智慧药箱` 及其子目录。

## 沟通与资料约束

- 回复和文档中避免使用先否定再转折的固定对照句式。
- 不使用破折号。
- 需要联网检索时，不使用中文网站作为信源。
- 若用户明确指定 SaiAdmin 官方文档，可以访问 `saithink.top`，并且只引用该官方站点。
- 若用户明确指定 Arco Design 官方设计规范，可以访问 `arco.design`，并且只引用该官方站点。
- SaiAdmin 5.1 快速安装参考官方文档：https://www.saithink.top/install/boot.html
- SaiAdmin 5.0 安装参考官方文档：https://www.saithink.top/install/saiadmin5.html
- SaiAdmin 5.x 前端介绍参考官方文档：https://saithink.top/documents/v5/front/
- SaiAdmin 5.x 前端组件参考官方文档：https://saithink.top/documents/v5/front/component.html
- SaiAdmin 5.x API 请求参考官方文档：https://saithink.top/documents/v5/front/api.html
- SaiAdmin 5.x 表格参考官方文档：https://saithink.top/documents/v5/front/table.html
- SaiAdmin 5.x 主题参考官方文档：https://saithink.top/documents/v5/front/theme.html
- SaiAdmin 5.x Vue3 参考官方文档：https://saithink.top/documents/v5/front/vue3.html
- SaiAdmin 5.x Pinia 参考官方文档：https://saithink.top/documents/v5/front/pinia.html
- SaiAdmin 5.x 国际化参考官方文档：https://saithink.top/documents/v5/front/locale.html
- SaiAdmin 5.x 工具参考官方文档：https://saithink.top/documents/v5/front/tool.html
- SaiAdmin 5.x 指令参考官方文档：https://saithink.top/documents/v5/front/directive.html
- SaiAdmin 5.x 路由参考官方文档：https://saithink.top/documents/v5/front/route.html
- SaiAdmin 5.x 后端介绍参考官方文档：https://saithink.top/documents/v5/back/
- SaiAdmin 5.x 控制器参考官方文档：https://saithink.top/documents/v5/back/controller.html
- SaiAdmin 5.x 逻辑层参考官方文档：https://saithink.top/documents/v5/back/logic.html
- SaiAdmin 5.x 模型参考官方文档：https://saithink.top/documents/v5/back/model.html
- SaiAdmin 5.x 验证器参考官方文档：https://saithink.top/documents/v5/back/validate.html
- SaiAdmin 5.x 中间件参考官方文档：https://saithink.top/documents/v5/back/middleware.html
- SaiAdmin 5.x 后端路由参考官方文档：https://saithink.top/documents/v5/back/route.html
- SaiAdmin 5.x 异常处理参考官方文档：https://saithink.top/documents/v5/back/exception.html
- SaiAdmin 5.x 部门结构参考官方文档：https://saithink.top/documents/v5/struct/dept.html
- SaiAdmin 5.x 角色结构参考官方文档：https://saithink.top/documents/v5/struct/role.html
- SaiAdmin 5.x 用户结构参考官方文档：https://saithink.top/documents/v5/struct/user.html
- Arco Design 设计规范简介参考官方文档：https://arco.design/docs/spec/introduce
- Arco Design 设计原则参考官方文档：https://arco.design/docs/spec/philosophy
- Arco Design 样式指南参考官方文档：https://arco.design/docs/spec/style-guideline
- Arco Design 组件用法参考官方文档：https://arco.design/docs/spec/link
- Arco Design Vue 组件库参考官方文档：https://arco.design/vue/component/button
- Arco Design Vue 表格组件参考官方文档：https://arco.design/vue/component/table
- Arco Design Vue 表单组件参考官方文档：https://arco.design/vue/component/form
- Arco Design Vue 输入组件参考官方文档：https://arco.design/vue/component/input
- Arco Design Vue 选择器组件参考官方文档：https://arco.design/vue/component/select
- Arco Design Vue 卡片组件参考官方文档：https://arco.design/vue/component/card
- Arco Design Vue 栅格组件参考官方文档：https://arco.design/vue/component/grid
- Arco Design Vue 间距组件参考官方文档：https://arco.design/vue/component/space
- Arco Design Vue 空状态组件参考官方文档：https://arco.design/vue/component/empty
- Arco Design Vue 标签组件参考官方文档：https://arco.design/vue/component/tag
- Arco Design Vue 对话框组件参考官方文档：https://arco.design/vue/component/modal
- Arco Design Vue 抽屉组件参考官方文档：https://arco.design/vue/component/drawer
- Arco Design Vue 菜单组件参考官方文档：https://arco.design/vue/component/menu
- Arco Design Vue 消息组件参考官方文档：https://arco.design/vue/component/message
- Arco Design Vue 官方仓库参考：https://github.com/arco-design/arco-design-vue/tree/main
- Arco Design Pro Vue 官方仓库参考：https://github.com/arco-design/arco-design-pro-vue/tree/main
- Arco Design React 官方仓库参考：https://github.com/arco-design/arco-design

## 项目结构

- `saiadmin-base/`：智慧药盒后台工程。
- `saiadmin-base/frontend/`：SaiAdmin 5.x 前端应用，底座按 `saiadmin-vue` 处理。
- `saiadmin-base/mock-api/`：本地 Express mock API，只用于本地前端联调。
- `smart-pillbox-doctor-admin-pm/`：产品和项目管理资料。
- `Agile-PM-Workflow/`：项目管理流程资料。
- `docs/`：项目文档。

## 常用命令

在 `saiadmin-base/` 下执行：

```bash
pnpm install:all
pnpm dev:mock
pnpm dev:frontend
pnpm build:frontend
```

本地地址：

- 前端：`http://localhost:3006`
- mock API：`http://127.0.0.1:3010`
- demo 登录：`admin`，任意密码，验证码 `1234`

## SaiAdmin 5.x 前端规范

- 前端底座使用 `saiadmin-vue`。
- UI 组件使用 Arco Design Vue，模板内优先使用 `a-*` 组件。
- 业务表格优先使用 `sa-table`，通过 `options`、`columns`、`searchForm` 管理表格、分页、搜索和操作列。
- 列表页默认按 SaiAdmin 5.x SaTable 官方文档实现，参考 https://saithink.top/documents/v5/front/table.html。
- 内置组件默认按 SaiAdmin 5.x 组件官方文档实现，参考 https://saithink.top/documents/v5/front/component.html。
- 路由按 `src/router/webRoutes.js`、`src/router/homePageRoutes.js` 组织。
- `webRoutes.js` 放登录、异常页、框架壳等固定路由。
- `homePageRoutes.js` 放后台首页与本地业务菜单路由。
- 动态菜单接入真实后端时，以后端菜单数据为准生成页面路由。
- 页面组件路径要和路由 `component` 字段保持一致，隐藏页面通过路由元信息控制菜单展示。
- API 请求统一使用 `src/utils/request.js`，调用形态为 `request({ url, method, params, data })`。
- 列表接口使用 `GET` 和 `params`，新增接口使用 `POST` 和 `data`，更新接口使用 `PUT` 和 `data`，删除接口使用 `DELETE` 和 `data`。
- 权限控制使用 `v-auth`、`v-role`，权限编码格式使用 `{插件名}:{模块名}:{功能名}:{操作}`。
- 状态管理使用 Pinia，跨页面状态进入 `src/store`，页面局部状态使用 Vue3 组合式 API。
- 国际化按 5.x 国际化目录和 `$t` 方式处理，业务文本暂未接入多语言时可保持中文文案。
- 工具函数放入 `src/utils`，业务可复用逻辑放入页面模块或 `src/hooks`。
- 主题和布局配置优先使用 5.x 主题配置体系，避免修改框架核心布局组件。
- 图标优先使用 5.x 底座已接入的图标能力，业务图标需要和现有菜单风格一致。

### SaiAdmin 表格与组件执行规范

- 主列表页优先使用 `sa-table`，表格请求、列、分页、搜索、排序、操作列由 `options`、`columns`、`searchForm` 统一表达。
- 搜索区使用 `tableSearch` 插槽承载 `a-form-item`，字段数量多时允许折行或展开，搜索和重置按钮必须和筛选控件同一视觉组内对齐。
- 顶部操作使用 `tableBeforeButtons`、`tableAfterButtons`、`tools` 等插槽放置，行内操作使用 `operationBeforeExtend`、`operationCell`、`operationAfterExtend`。
- 状态、字典、开关优先使用 `sa-dict`、`sa-select`、`sa-radio`、`sa-checkbox`、`sa-switch`，图标优先使用 `sa-icon` 或底座已接入的 Arco 图标。
- 图表优先使用 `sa-chart`，必须给容器稳定高度，数据为空时使用 Arco 空状态或项目统一空状态。
- 自定义卡片列表只用于患者卡、设备卡、风险卡等业务语义强的场景，仍需遵循表格页的搜索、分页、操作、空状态和加载状态约束。

## Arco Design 界面规范

- Arco Design 的核心目标是用通用设计系统解决企业级产品体验问题，并促进设计和研发协作；本项目的页面实现要优先服务清晰、高效、一致的后台工作流。
- 设计原则落地时优先检查及时反馈、贴近现实、系统一致性、防错、遵从习惯、突出重点、错误帮助和人性化帮助。
- 样式遵循 Arco 色彩体系，主色用于主要按钮、重点操作、选中态和关键高亮，中性色用于文字、背景、边框、分割线，功能色只表达成功、警告、错误、链接等明确状态。
- 字号以 14px 为常规正文基准，最小可识别文字不低于 12px，常规页面控制在 3 到 5 个文字层级内，主副文本层级差距保持 2 到 4px。
- 行高按 Arco 默认 1.4 倍作为基准，长文本和说明文案需要有足够段落间距，避免标题、副标题、标签、按钮文本互相挤压。
- 阴影只用于表达清晰层级，卡片等低层级元素使用轻量阴影或边框，下拉、弹窗、抽屉等浮层使用更高层级阴影。
- 文案遵循词汇统一、语法正确、文案精炼、通俗易懂、语言友好；统计文案使用数字加单位加动作或名词，操作文案使用动词加名词。
- 时间默认使用 24 小时制，涉及日期、时间、数值和单位的展示要统一格式，数字和单位之间保持清晰可读。
- 页面入口、标签页、面包屑、按钮和二级内容标题要语义一致，同一业务概念在全后台只使用一个名称。
- 链接只用于页面跳转、外部站点或页内定位；当前页面内触发动作、提交、状态变更、导入导出、创建编辑删除均使用按钮。

### Arco 组件使用规范

- 操作按钮按语义选择 `primary`、`secondary`、`outline`、`text`、`danger`，同一区域只保留一个主按钮，次级操作弱化显示。
- 表单使用 `a-form`、`a-form-item`、`a-input`、`a-select`、`a-radio`、`a-checkbox`、`a-switch` 等组件，控件宽度、标签对齐、错误提示和 disabled 状态必须统一。
- 表格使用 `sa-table` 或 `a-table`，列宽、固定列、操作列、筛选区、分页区需要在 1440px 和移动视口中检查，不允许内容遮挡、按钮换行失控或横向溢出不可用。
- 使用 `a-table` 时参考 Arco Design Vue 官方 API，优先配置 `row-key`、`loading`、`pagination`、`columns`、`data`、`size`、`scroll`、`table-layout-fixed`、`row-selection`、空状态插槽和单元格插槽。
- 搜索表单参考 Arco Design Pro Vue 的 search-table 模式，使用 `a-card` 包裹筛选和表格，筛选项使用 `a-row`、`a-col`、`a-form-item` 组织，查询、重置和表格工具按钮要在同一内容区域内成组对齐。
- 卡片使用 `a-card` 表达独立信息块，卡片头部只放标题、必要副信息和紧密相关操作，禁止把全局页面动作悬空放在内容区上方。
- 标签、徽标和状态点只表达状态，不承载复杂长文案；红色、橙色等高警示颜色要保证文字对比度和可读性。
- 菜单使用 `a-menu` 的选中和展开状态表达当前位置，选中子菜单后父级菜单保持展开。
- 空状态、错误、加载、成功和警告反馈优先使用 Arco 的 `Empty`、`Result`、`Spin`、`Message`、`Notification`、`Alert`、`Modal`、`Drawer` 等组件。
- 弹窗和抽屉只承载创建、编辑、详情、确认等强上下文任务，主要操作放右下或组件默认区域，危险操作必须二次确认。

### Arco 官方仓库对接规范

- `arco-design/arco-design-vue` 是本项目 Arco Vue 组件的代码级主参考，遇到组件行为、Props、插槽、事件、类型和样式变量不确定时，先查 `packages/web-vue/components` 和 `packages/arco-vue-docs`。
- `arco-design/arco-design-pro-vue` 是后台页面模式参考，重点参考 `arco-design-pro-vite/src/layout`、`src/components/menu`、`src/components/tab-bar`、`src/router`、`src/store`、`src/views/list/search-table`、`src/assets/style/global.less`。
- `arco-design/arco-design` 是 React 组件库参考，只用于补充设计行为、组件边界、Storybook 示例和 token 思路，落地到本项目时必须转换成 Vue 和 SaiAdmin 5.x 的实现方式。
- 对接 Arco Pro Vue 时只吸收后台信息架构、布局节奏、搜索表格、菜单展开、主题、暗色模式、Mock、I18n 和配置思路，保留 SaiAdmin 5.x 当前底座、路由体系和业务 URL。
- Arco 官方组件库和 Pro 模板都以 TypeScript、主题 token、CSS 变量、Pinia、Vue Router、组件化页面为主要实践，本项目新增代码应保持同等工程纪律。
- 页面布局可参考 Pro Vue 的 `general-card` 思路，卡片圆角、头部内边距、正文内边距和背景色要统一使用现有 CSS 变量及项目已定义样式。
- 菜单逻辑可参考 Pro Vue 的 `openKeys`、`selectedKey`、`activeMenu`、`auto-open-selected` 处理，隐藏路由进入详情页时应保持父菜单选中和展开。
- 不直接复制 React 仓库组件源码到 Vue 项目；跨仓库迁移只迁移设计语义、组件参数思路和交互模式。

## 业务页面规范

- 页面放在 `src/views` 下，智慧药盒页面统一放入 `src/views/smart-pillbox`。
- 智慧药盒 API 层统一放入 `src/views/plugin/smart-pillbox/api`。
- 页面级弹窗、搜索区、局部组件放在页面同级 `modules` 目录。
- 主列表页优先组合搜索区、`sa-table`、编辑弹窗，不重复实现分页和列状态管理。
- 编辑弹窗使用 `v-model` 控制显示，接收初始数据，提交前执行表单校验。
- 新增、编辑、删除成功后刷新当前列表，并保持合理分页状态。
- 样式优先使用 Arco Design Vue 属性、项目现有 CSS 变量、页面 scoped style。
- 不提交或保留无关构建产物、缓存文件和 `.DS_Store` 变更。

## 页面质量评审规范

- 所有智慧药盒页面样式、字体、间距、组件、状态和按钮位置都要符合 SaiAdmin 5.x、Arco Design Vue 和 Arco Design 设计规范。
- 页面 UI 修改后必须检查受影响页面；若用户要求全面检查，需要覆盖工作台、患者管理、患者详情、新增患者建档、健康数据、用药计划、服药任务、提醒消息、设备管理、对话记录、系统设置和知情同意书设置。
- 每页至少检查 1440x900 桌面视口；涉及响应式、表格、筛选区、左右分栏、长文案时，再检查移动视口。
- 检查项包括导航命名、面包屑、标签页、菜单展开状态、卡片头部、搜索区、表格列、按钮组、图标、标签、图表、空状态、加载状态、错误状态、弹窗、抽屉和分页。
- 间距需要满足信息分组关系：统计卡到下方内容、卡片头到正文、筛选控件到按钮、列表项内部图标到文本、状态标签到标题都要保持稳定间距。
- 禁止标题、副标题、说明文案、按钮、标签、图标、图表刻度和数据文本互相遮挡或重叠。
- 页面级按钮只保留真正控制整页的动作；和某个卡片、表格、患者、设备、任务相关的动作必须放入对应内容区域。
- 数据可视化需要能被扫读，图表坐标、标签、图例、数值和结论要清晰，空间不足时改为列表、进度条或紧凑指标。
- 全面评审时以 98 分以上的专业后台界面为目标，发现视觉粗糙、布局突兀、组件混用、颜色滥用、状态不清和操作分散时，应直接优化。

## 后端与插件规范

- 真实后端接入时按 SaiAdmin 5.x 后端分层组织功能。
- 控制器负责请求入口、参数接收和响应。
- 逻辑层负责业务编排和事务。
- 模型层负责数据表映射和关联。
- 验证器负责新增、更新、状态变更等输入校验。
- 中间件负责认证、权限、日志、跨域等横切逻辑。
- 后端路由遵循 5.x 路由规范，管理后台接口优先放在 `admin` 域。
- 标准接口方法包括 `index`、`save`、`update`、`read`、`changeStatus`、`destroy`、`import`、`export`。
- 当前 `saiadmin-base/mock-api` 是本地联调服务，不作为真实 SaiAdmin 后端分层参考。

## 当前后台约定

- 系统名称为 `智慧药盒后台`。
- 默认首页为 `/doctor/dashboard`。
- 全后台将 `仪表盘` 统一命名为 `工作台`，包含菜单、标签页、面包屑和按钮文案。
- 左侧菜单应展示：工作台、患者管理、用药管理（用药计划、服药任务、提醒消息）、设备记录（设备管理、对话记录）、系统设置。
- 新增患者建档保留页面入口，从工作台或患者管理进入，不作为左侧独立菜单。
- 患者详情、健康数据等流程页通过隐藏路由或二级动作进入。
- 智慧药盒业务页默认不显示独立页面标题和副标题，页面语义由菜单、标签页、面包屑和内容卡片标题承载。
- 原框架示例菜单可以隐藏或移除，避免干扰智慧药盒后台主流程。
- 智慧药盒功能逻辑、字段、状态、流程、校验和接口语义保持稳定。
- 迁移底座时保持现有业务 URL 和 mock API 路径稳定。

## 验证要求

- 修改 `AGENTS.md` 后，先单独检查 diff，并确认没有旧版本底座规范残留。
- 修改前端后至少运行：

```bash
pnpm --dir saiadmin-base/frontend build
```

- 若涉及页面、路由、菜单、登录流程或布局，需要在 `http://localhost:3006` 做浏览器验证。
- 保持 dev 服务运行时，mock API 通常在 `3010`，前端通常在 `3006`。

## 编辑原则

- 保持业务变更范围小，优先贴合 SaiAdmin 5.x 底座风格。
- 不随意重构 SaiAdmin 核心组件。
- 大规模底座迁移要分阶段提交，先更新规范，再迁移前端。
- 若工作区没有 `.git`，先说明当前目录无法用 Git 状态确认变更范围。
