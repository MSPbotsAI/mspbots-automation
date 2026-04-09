# 测试报告

## 测试范围

本轮针对 `mspbots-automation` 项目进行了首轮可运行性与关键链路测试，覆盖范围如下：

### 工程与构建
- `pnpm install`
- `pnpm build`
- `pnpm dev`

### 静态检查
- `mspbot.config.ts`
- `pages/Home.tsx`
- `pages/Admin.tsx`
- `service/server.ts`
- `.env.development` 键完整性

### API Smoke Test
- `GET /api/hello`
- `GET /api/admin-only`
- `GET /api/monitor/status`
- `POST /api/monitor/run`

## 环境信息

- 项目目录：`/home/mspbots/.openclaw/workspace/code/mspbots-automation`
- 测试时间：`2026-03-20 UTC`
- 运行模式：本地开发环境
- 前端地址：`http://localhost:5173/`
- 后端地址：`http://localhost:46845/`
- 后端运行时：Deno 2.6.7
- 包管理器：pnpm 10.30.3

## 角色/账号

本轮未使用真实登录账号，主要验证匿名态与静态权限设计：

- anonymous：用于访问通用接口与受限接口
- admin/test：通过静态代码检查验证其权限逻辑一致性

## 执行结果概览

| 类别 | 项目 | 结果 | 说明 |
|---|---|---|---|
| 工程 | `pnpm install` | 通过 | 依赖安装成功 |
| 工程 | `pnpm build` | 通过 | 前后端均构建成功 |
| 工程 | `pnpm dev` | 通过 | 前后端本地服务启动成功 |
| API | `GET /api/hello` | 通过 | 基础后端链路正常 |
| API | `GET /api/admin-only` 匿名访问 | 部分通过 | 业务逻辑拒绝成功，但 HTTP 状态码不规范 |
| API | `GET /api/monitor/status` | 失败 | MySQL 连接拒绝 |
| API | `POST /api/monitor/run` | 失败 | MySQL 连接拒绝 |
| 权限 | `pages/Admin.tsx` 菜单/路由一致性 | 失败 | `menu` 与 `route` 条件不一致 |

## 通过项

### 1. 依赖安装成功
执行 `pnpm install` 成功完成，项目依赖可被正常解析与安装。

### 2. 构建成功
执行 `pnpm build` 成功，前端产物与后端产物均正常输出到 `dist/`。

### 3. 本地开发服务可启动
执行 `pnpm dev` 后：
- 前端服务启动成功
- 后端服务启动成功
- 本地接口可被访问

### 4. 基础接口可用
`GET /api/hello` 返回正常 JSON，说明：
- 应用基础路由工作正常
- 后端运行链路可用
- 请求参数透传逻辑基本正常

### 5. 受限接口具备基础权限判断
匿名访问 `GET /api/admin-only` 时，响应中包含：
- `error: "Forbidden"`
- `message: "Admin access required"`

说明接口逻辑层面已经具备最基础的权限拒绝能力。

## 失败项

### 1. 监控状态接口失败
接口：`GET /api/monitor/status`

返回结果：
```json
{"success":false,"message":"connect ECONNREFUSED 127.0.0.1:3306"}
```

结论：当前运行环境下 MySQL 不可达，导致监控状态接口不可用。

### 2. 手动触发监控任务失败
接口：`POST /api/monitor/run`

返回结果：
```json
{"success":false,"message":"connect ECONNREFUSED 127.0.0.1:3306"}
```

结论：监控任务依赖数据库，当前数据库连接失败导致该功能不可执行。

### 3. Admin 页面权限规则不一致
文件：`pages/Admin.tsx`

当前配置：
```ts
export const meta = {
  label: 'Admin',
  icon: 'Lock',
  order: 2,
  menu: ['admin'],
  route: (roles) => roles.includes('test'),
}
```

问题：
- `menu` 使用 `admin`
- `route` 使用 `test`

结论：前端菜单展示与路由访问控制不一致，存在权限行为错配。

## 风险项

### 1. 后端未授权接口返回 200
虽然 `GET /api/admin-only` 在业务语义上拒绝了匿名访问，但从服务日志看，该请求仍以 HTTP 200 返回。

风险：
- 前端可能按 HTTP 状态码误判为成功
- 调用方不易统一处理权限错误
- 与 REST 语义不一致

建议：
- 未授权时返回 HTTP 403

### 2. 监控模块在服务启动时自动初始化
`service/server.ts` 中服务启动即执行监控调度初始化。

风险：
- 非监控场景下启动日志会被环境问题污染
- 本地开发时数据库未准备就绪会持续报错
- 启动阶段职责耦合偏重

建议：
- 增加更清晰的启动开关或降级策略

### 3. 前端构建包体偏大
构建日志显示存在超过 500 kB 的 chunk。

影响：
- 不是阻断问题
- 但会影响首屏加载与后续性能优化空间

## 阻断项

### 阻断 1：监控核心能力不可用
当前项目的核心业务之一是监控/调度能力，但监控相关核心接口在当前环境下均失败。

直接影响：
- 无法查看监控状态
- 无法手动执行监控任务
- 无法完成监控模块验收

这属于明确阻断项。

## 证据

### 关键接口返回

#### `GET /api/monitor/status`
```json
{"success":false,"message":"connect ECONNREFUSED 127.0.0.1:3306"}
```

#### `POST /api/monitor/run`
```json
{"success":false,"message":"connect ECONNREFUSED 127.0.0.1:3306"}
```

#### `GET /api/hello`
返回 `Hello World!` 与时间戳，接口可用。

#### `GET /api/admin-only`
匿名访问返回 `Forbidden` 错误体，但 HTTP 状态码仍为 200。

### 运行日志
开发日志中明确出现：

```text
[monitor] Monitor configuration error: connect ECONNREFUSED 127.0.0.1:3306
```

## 是否建议发布

**结论：当前不建议发布。**

原因：
1. 监控模块核心接口不可用
2. Admin 权限控制存在前端规则不一致问题
3. 权限失败未返回标准 403，接口契约不够稳健

## 后续建议

### 必修复（P0）
1. 修复 MySQL 连接问题，确保监控模块可运行
2. 重新验证：
   - `GET /api/monitor/status`
   - `POST /api/monitor/run`

### 高优先修复（P1）
1. 修复 `pages/Admin.tsx` 中 `menu` / `route` 权限条件不一致问题
2. 修复 `GET /api/admin-only` 未授权响应为 HTTP 403

### 后续增强（P2）
1. 增补测试用例文档
2. 补充权限与异常路径自动化回归
3. 评估前端 chunk 拆分与性能优化
