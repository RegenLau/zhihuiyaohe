# AGENTS.md

## 项目范围

本说明适用于 `/Users/regenlau/Desktop/智慧药箱` 及其子目录。

## 沟通与资料约束

- 回复和文档中避免使用先否定再转折的固定对照句式。
- 不使用破折号。
- 需要联网检索时，不使用中文网站作为信源。
- 若用户明确指定 SaiAdmin 官方文档，可以访问 `saithink.top`，并且只引用该官方站点。
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

## 业务页面规范

- 页面放在 `src/views` 下，智慧药盒页面统一放入 `src/views/smart-pillbox`。
- 智慧药盒 API 层统一放入 `src/views/plugin/smart-pillbox/api`。
- 页面级弹窗、搜索区、局部组件放在页面同级 `modules` 目录。
- 主列表页优先组合搜索区、`sa-table`、编辑弹窗，不重复实现分页和列状态管理。
- 编辑弹窗使用 `v-model` 控制显示，接收初始数据，提交前执行表单校验。
- 新增、编辑、删除成功后刷新当前列表，并保持合理分页状态。
- 样式优先使用 Arco Design Vue 属性、项目现有 CSS 变量、页面 scoped style。
- 不提交或保留无关构建产物、缓存文件和 `.DS_Store` 变更。

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
- 左侧菜单应展示：工作台、患者管理、用药管理（用药计划、服药任务、提醒消息）、设备记录（设备管理、对话记录）、系统设置。
- 新增患者建档保留页面入口，从工作台或患者管理进入，不作为左侧独立菜单。
- 患者详情、健康数据等流程页通过隐藏路由或二级动作进入。
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
