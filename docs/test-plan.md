# 测试计划

## 目标

为 `mspbots-automation` 项目建立一套可复用的测试方案，优先验证该项目作为 MSPBots 全栈应用模板/自动化监控应用的以下能力：

1. 前端页面可正常路由与渲染
2. 后端服务可启动并暴露核心 API
3. 监控模块 API 可访问，基础请求链路可工作
4. 权限与路由控制不存在明显错配
5. 构建流程可执行，具备上线前基本可测性

## 范围

本轮测试范围基于当前仓库可见内容确定：

### 前端
- `pages/Home.tsx`
- `pages/Admin.tsx`
- 基于 `pages/` 的自动路由
- `mspbot.config.ts` 中的系统配置（待进一步读取验证）

### 后端
- `service/server.ts`
- `/api/*` 路由可用性
- 监控相关接口：
  - `POST /api/monitor/run`
  - `GET /api/monitor/status`

### 工程能力
- `pnpm install`
- `pnpm build`
- `pnpm dev` 前置依赖准备
- `.env.development` / `.env.production` 变量完整性检查（只检查键，不泄露敏感值）

## 不在范围

本轮默认不包含以下内容，除非用户明确要求：

1. 真实生产环境压测
2. 邮件发送链路的真实外部投递验证
3. MySQL 数据正确性的深度审计
4. 第三方 MSPBots 平台接口真实性能与可用性 SLA 验证
5. UI 视觉样式细节验收
6. 安全渗透测试

## 环境与前置条件

### 建议环境
- 环境：dev / test
- Node、pnpm、Deno 可用
- 可访问 MSPBots 相关依赖源
- 若执行监控链路测试，需要可用的：
  - MySQL
  - SMTP
  - 目标 tenant API
  - target agent API

### 前置条件
1. 仓库已拉取到本地
2. 安装前端依赖：`pnpm install`
3. 后端依赖通过 `predev` 或手动 `cd service && deno install` 完成
4. 环境变量已配置
5. 若需真实接口联调，测试 token、tenant 上下文、数据库账号均已准备

## 角色矩阵

当前从 README 与页面命名推断，至少存在以下角色模型：

| 角色 | 前端菜单权限 | 前端路由权限 | 后端 API 权限 | 关注点 |
|---|---|---|---|---|
| anonymous | 无/极少 | 登录页或公开页 | 应拒绝访问敏感 API | 未登录访问控制 |
| user | 普通功能页 | 受限管理页不可见 | 非管理 API 最小可用 | 页面可见性与默认访问 |
| admin | 可见 Admin 菜单 | 可访问 Admin 页面 | 可调用管理 API | 菜单、路由、接口一致性 |
| system/monitor | 不走前端 | 不适用 | 允许监控任务执行 | 调度链路与鉴权 |

> 注：角色定义需要在读取 `pages/*.tsx` 与 `service/server.ts` 后进一步实锤。

## 模块清单

1. 页面模块
   - Home
   - Admin
2. 路由与权限模块
   - `meta.menu`
   - `meta.route`
   - `<Permission />`
3. 后端 API 模块
   - 通用 `/api/*`
   - 监控接口 `/api/monitor/*`
4. 调度/监控模块
   - 定时任务
   - 请求日志
   - 告警日志
5. 配置模块
   - `.env.*`
   - `mspbot.config.ts`
   - `service/deno.json`

## API 清单

当前已知 API：

| 方法 | 路径 | 用途 | 优先级 |
|---|---|---|---|
| GET | `/api/monitor/status` | 查看监控状态 | P0 |
| POST | `/api/monitor/run` | 手动触发一次监控 | P0 |

待补充：读取 `service/server.ts` 后补全完整 API 列表。

## 关键业务流

### P0 业务流
1. 应用启动成功
2. 首页可访问
3. 管理页路由权限符合预期
4. 后端服务正常启动
5. 获取监控状态成功
6. 手动触发监控任务成功或返回可解释错误

### P1 业务流
1. 调度器启动后不重复并发运行
2. tenant API 请求失败时记录日志并触发告警
3. agents API 在指定 tenant 下执行请求并落库
4. 空数据/异常响应时系统行为稳定

## 异常场景

1. 未配置必要环境变量
2. MySQL 不可连接
3. SMTP 不可连接
4. tenant API 返回 401/403/500
5. agents API 返回空数组
6. critical tenant 返回空 agents
7. 重复触发 `/api/monitor/run`
8. 路由存在前端放开但后端未保护
9. UI 隐藏管理入口但 API 仍可匿名调用
10. 构建成功但运行时缺少必要配置

## 回归分层（P0/P1/P2）

### P0 smoke
1. `pnpm install` 成功
2. `pnpm build` 成功
3. 前端首页可渲染
4. Admin 页面路由存在且权限配置符合预期
5. `GET /api/monitor/status` 可返回
6. `POST /api/monitor/run` 可返回

### P1 core regression
1. 页面权限矩阵验证
2. 监控接口鉴权与异常处理
3. 调度器单实例执行校验
4. MySQL schema 初始化行为验证
5. 关键 env 键缺失时的错误提示验证

### P2 full regression
1. 邮件告警内容完整性验证
2. 日志表字段完整性验证
3. 多 tenant 数据流正确性验证
4. 前后端异常状态展示一致性验证

## 验收标准

### 基础可交付标准
- 项目依赖可安装
- 项目可构建
- 关键页面可访问或按权限被正确阻止
- 核心 API 有稳定响应
- 关键异常场景返回可解释结果

### 发布建议标准
- P0 全通过
- P1 无阻断缺陷
- 不存在高风险权限漏洞
- 不存在监控任务重复执行/失控问题
- 关键配置项有校验或运行时报错明确

## 下一步执行建议

建议按以下顺序继续：

1. 静态审查 `pages/*.tsx`、`service/server.ts`、`mspbot.config.ts`
2. 补全测试用例文档 `docs/test-cases.md`
3. 安装依赖并执行构建验证
4. 如需真测，再启动本地服务做 API/UI 执行测试
