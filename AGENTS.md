# AGENTS.md

## 项目范围

本说明适用于 `/Users/regenlau/Desktop/智慧药箱` 及其子目录。

## 沟通与资料约束

- 回复和文档中避免使用先否定再转折的固定对照句式。
- 不使用破折号。
- 需要联网检索时，不使用中文网站作为信源。
- 若用户明确指定 SaiAdmin 官方文档，可以访问 `saithink.top`，并且只引用该官方站点。
- 若需要 Art Design Pro 信息，优先使用官方文档 `artd.pro`。
- SaiAdmin 6.x 版本介绍参考官方文档：https://saithink.top/documents/v6/
- SaiAdmin 安装和环境参考官方文档：https://saithink.top/documents/v6/install.html
- SaiAdmin 内置命令参考官方文档：https://saithink.top/documents/v6/console.html
- SaiAdmin SAI 组件参考官方文档：https://saithink.top/documents/v6/front/sai.html
- SaiAdmin 开发参考官方文档：https://saithink.top/documents/v6/front/develop.html
- SaiAdmin 后端分层参考官方文档：https://saithink.top/documents/v6/back/develop.html
- Art Design Pro 前端底座参考官方文档：https://www.artd.pro/docs/zh/guide/introduce.html
- Art Design Pro 开发必读参考官方文档：https://www.artd.pro/docs/zh/guide/must-read.html
- Art Design Pro 项目结构参考官方文档：https://www.artd.pro/docs/zh/guide/essentials/project-introduce.html
- Art Design Pro 路由和菜单参考官方文档：https://www.artd.pro/docs/zh/guide/essentials/route.html
- Art Design Pro 系统配置参考官方文档：https://www.artd.pro/docs/zh/guide/essentials/settings.html
- Art Design Pro 环境变量参考官方文档：https://www.artd.pro/docs/zh/guide/essentials/env-variables.html
- Art Design Pro 权限管理参考官方文档：https://www.artd.pro/docs/zh/guide/in-depth/permission.html
- Art Design Pro 图标参考官方文档：https://www.artd.pro/docs/zh/guide/essentials/icon.html
- Art Design Pro 构建部署参考官方文档：https://www.artd.pro/docs/zh/guide/essentials/build.html
- Art Design Pro useTable 参考官方文档：https://www.artd.pro/docs/zh/guide/hooks/use-table.html
- Art Design Pro ArtSearchBar 参考官方文档：https://www.artd.pro/docs/zh/guide/components/art-search-bar.html
- Art Design Pro 工程规范参考官方文档：https://www.artd.pro/docs/zh/guide/project/standard.html

## 项目结构

- `saiadmin-base/`：智慧药盒后台的 SaiAdmin v6 原型工程。
- `saiadmin-base/frontend/`：基于 Art Design Pro 的前端应用，技术栈为 Vue 3、TypeScript、Vite、Element Plus、Tailwind CSS、Sass。
- `saiadmin-base/mock-api/`：本地 Express mock API。
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

## SaiAdmin 开发规范

- SaiAdmin 6.x 前端技术栈为 Vue 3、TypeScript、Element Plus、Tailwind CSS，前端底座使用 Art Design Pro。
- 官方推荐 Node.js 22 及以上版本配合 pnpm 管理前端。本项目 `frontend/package.json` 当前要求 Node.js `>=20.19.0`，本地开发至少满足项目 engines，升级环境时优先使用 Node.js 22。
- 业务 CRUD 页面优先使用框架封装：`useTable`、`useSaiAdmin`、`SaSearchBar`、`ArtTable`、`ArtTableHeader`、`SaButton`。
- 表格列配置优先通过 `useTable({ core: { apiFn, columnsFactory } })` 管理。
- `useTable` 负责数据获取、分页、搜索、列配置、排序处理。不要在页面里手写一套重复状态管理。
- `columnsFactory` 支持 `type`、`prop`、`label`、`width`、`fixed`、`saiType`、`saiDict`、`useSlot`。字典列优先使用 `saiType: 'dict'` 和 `saiDict`。
- 主页面标准组合为 `TableSearch`、`ElCard.art-table-card`、`ArtTableHeader`、`ArtTable`、`EditDialog`。
- 搜索区域优先抽为 `modules/table-search.vue`，使用 `SaSearchBar` 和响应式栅格。
- 搜索表单用 `v-model`、`search`、`reset`、`expand` 事件和父页面同步，重置时调用搜索表单 ref 的 `resetFields`。
- 编辑弹窗优先抽为 `modules/edit-dialog.vue`，使用 `v-model`、`initialFormData`、`rules`、`initPage`、`handleSubmit` 模式。
- 编辑弹窗提交时先执行表单校验，再按 `dialogType` 调用 `api.save` 或 `api.update`，成功后 `emit('success')` 并关闭弹窗。
- API 层按模块拆分，标准方法为 `list`、`read`、`save`、`update`、`delete`。
- 前端 API 路径按 `src/views/plugin/{插件名}/api/{模块名}/{功能名}.ts` 组织。当前智慧药盒目录已有原型结构时，可逐步迁移到该模式。
- 标准 API HTTP 语义：`list` 使用 GET 返回分页数据，`read` 使用 GET 返回详情，`save` 使用 POST，`update` 使用 PUT，`delete` 使用 DELETE 并支持批量。
- 后端接口路径格式优先遵循 `/app/{插件名}/admin/{模块名}/{控制器名}/{方法名}`。
- 按钮权限遵循 `v-permission`，权限编码格式使用 `{插件名}:{模块名}:{功能名}:{操作}`。
- 菜单和页面入口优先通过 `src/router/modules` 配置，避免为单个业务直接改框架核心菜单组件。
- 需要调整通用布局时，先确认是否可通过配置、路由元信息或局部业务组件完成。

## Art Design Pro 前端规范

- 本项目 SaiAdmin 前端底座按 Art Design Pro 开源版处理，优先沿用现有目录、组件、Hook、路由和配置体系。
- 通用平台接口放在 `src/api`。SaiAdmin 插件业务接口优先按插件模块放到 `src/views/plugin/{插件名}/api/{模块名}/{功能名}.ts`。智慧药盒业务若已有原型目录，迁移时保持 API 层集中管理。
- 页面放在 `src/views`，业务组件放在 `src/components/business` 或页面同级 `modules`，核心通用组件放在 `src/components/core` 或 `src/components/sai`。
- 可复用逻辑放在 `src/composables` 或 `src/hooks/core`，跨页面状态放在 `src/store/modules`。页面局部状态优先使用 `ref`、`reactive`、`computed`。
- 新页面模板保持单根节点。需要撑满剩余高度时使用 `class="page-content"`。
- 路由和菜单优先通过 `src/router/modules` 或 `src/router/routes/asyncRoutes.ts` 管理，具体路径按当前项目已有结构选择。
- 多级菜单父级组件使用 `/index/index`，页面组件路径使用框架约定的字符串路径，例如 `/dashboard/console`。
- 路由 `meta` 统一承载菜单和标签行为，常用字段包括 `title`、`icon`、`isHide`、`isHideTab`、`keepAlive`、`fixedTab`、`roles`、`authList`、`activePath`、`isIframe`、`link`。
- 需要隐藏菜单、隐藏标签、缓存页面、固定标签、外链内嵌、高亮父级菜单时，优先使用路由 `meta` 字段。
- 默认首页通过 `src/router/index.ts` 的 `HOME_PAGE_PATH` 配置。
- 系统名称通过 `src/config/index.ts` 的 `systemInfo.name` 配置，Logo 图片通过 `src/components/core/base/ArtLogo.vue` 管理。
- 主题、菜单布局、菜单主题、系统主色优先通过 `src/config/index.ts` 和 `src/config/setting.ts` 管理。
- 环境变量放在 `.env`、`.env.development`、`.env.production`。客户端可读取的自定义变量必须使用 `VITE_` 前缀。
- `VITE_ACCESS_MODE` 决定权限模式。`frontend` 模式由前端路由和角色过滤控制菜单，`backend` 模式由后端返回菜单结构并动态注册路由。
- 权限处理先看当前文件所属模块：SaiAdmin 业务页沿用 `v-permission`，Art Design Pro 原生页面沿用 `roles`、`authList`、`hasAuth`、`v-auth`、`v-roles`。
- 列表页优先使用 `useTable` 配合 `ArtTable`，由 `apiFn`、`apiParams`、`columnsFactory` 管理接口、查询、分页和列配置。
- CRUD 操作后的表格刷新优先使用 `refreshCreate`、`refreshUpdate`、`refreshRemove`，保持分页行为与框架一致。
- 搜索栏优先使用 `ArtSearchBar` 或 SaiAdmin 的 `SaSearchBar`，表单项 `key` 必须唯一，组件属性通过 `props` 透传给 Element Plus。
- 图标优先使用 `ArtSvgIcon`，图标集优先使用 Remix Icon，命名形如 `ri:home-line`。
- 样式优先使用项目现有 Tailwind、Sass、CSS 变量和 Element Plus 属性。页面样式放在页面组件 scoped style 或同级样式文件内。
- 代码质量按项目脚本执行，常用命令包括 `pnpm lint`、`pnpm fix`、`pnpm lint:prettier`、`pnpm lint:stylelint`。
- 提交信息类型沿用 Art Design Pro 工程规范，包括 `feat`、`fix`、`docs`、`style`、`refactor`、`perf`、`test`、`build`、`ci`、`revert`、`chore`、`wip`。
- 构建部署前确认 `VITE_BASE_URL`、`VITE_API_URL`、`VITE_API_PROXY_URL` 与目标环境一致。

## SAI 组件使用规范

- SAI 组件已全局注册，模板中可以直接使用。
- 表格操作按钮使用 `SaButton`。常用类型包括 `primary` 新增、`secondary` 编辑、`error` 删除、`info` 更多、`success` 查看。
- 字典输入使用 `SaSelect`、`SaRadio`、`SaCheckbox`，字典展示使用 `SaDict`。
- 字典类组件依赖 `useDictStore`，使用前要确认字典数据已加载。
- 字典类组件需要关注 `valueType`，后端返回字符串且前端需要数字时使用默认数字转换。
- 启用禁用状态优先使用 `SaSwitch`。
- 表单标签说明使用 `SaLabel`。
- 图标选择使用 `SaIconPicker`。
- 富文本使用 `SaEditor`。
- 代码展示使用 `SaCode`。
- 图片选择和上传使用 `SaImagePicker`、`SaImageDialog`、`SaImageUpload`。
- 文件和大文件上传使用 `SaFileUpload`、`SaChunkUpload`。
- Excel 导入导出使用 `SaImport`、`SaExport`。
- 新增 SAI 组件时，命名采用 `Sa` 前缀加驼峰命名，使用 `defineOptions({ name: 'SaXxx' })`，使用 TypeScript Props 接口，优先用 `defineModel` 实现双向绑定，需要透传属性时使用 `inheritAttrs: false` 和 `v-bind="$attrs"`。

## 后端与插件规范

- SaiAdmin 后端基于 Webman 插件架构，真实后端接入时按插件模块组织功能。
- 后端分层优先保持 `controller`、`logic`、`validate`、`model` 分离。
- 管理后台和 API 接口可以分别放在 `admin` 与 `api` 下，业务逻辑进入 `logic`，数据模型进入 `model`。
- 验证器使用场景区分 `save` 和 `update`，常用规则包括 `require`、`max`、`min`、`in`、`email`、`mobile`、`number`、`integer`、`alpha`、`alphaDash`、`url`、`dateFormat`。
- 唯一性校验优先使用 `BaseValidate` 的 `unique` 规则，更新时排除当前记录 ID。
- 后端真实工程可使用 `php webman sai:plugin {插件标识}` 创建插件基础结构。
- 真实工程需要切换 ORM 时使用 `php webman sai:orm`，框架核心升级时使用 `php webman sai:upgrade`。
- 当前 `saiadmin-base/mock-api` 是 Express mock 服务，只用于本地前端联调。不要把 mock 结构当作真实 SaiAdmin 后端分层。

## 当前后台约定

- 系统名称为 `智慧药盒后台`。
- 默认首页为 `/doctor/dashboard`。
- 左侧菜单应直接展示业务入口：医药师工作台、患者管理、新增患者建档、用药计划、服药任务、设备管理、提醒消息、对话记录、系统设置。
- 原 SaiAdmin 示例菜单可以隐藏或移除，避免干扰智慧药盒后台主流程。
- 智慧药盒页面目前存在原型本地数据，正式功能开发时应逐步收敛为 API 层加 `useTable` 的标准结构。

## 验证要求

- 修改前端后至少运行：

```bash
pnpm --dir frontend build
```

- 若涉及页面、路由、菜单、登录流程或布局，需要在 `http://localhost:3006` 做浏览器验证。
- 保持 dev 服务运行时，mock API 通常在 `3010`，前端通常在 `3006`。

## 编辑原则

- 保持变更范围小，优先贴合现有框架风格。
- 不随意重构 SaiAdmin 和 Art Design Pro 核心组件。
- 不提交或保留无关构建产物、缓存文件和 `.DS_Store` 变更。
- 若工作区没有 `.git`，先说明当前目录无法用 Git 状态确认变更范围。
