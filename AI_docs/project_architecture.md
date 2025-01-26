# BeaverDen Project Architecture

## 1. 技术栈
- 前端：React 18.3.1 + TypeScript
- 桌面框架：Electron
- 后端：Python FastAPI
- 数据库：SQLite with SQLCipher
- UI组件：Shadcn UI
- 状态管理：Zustand + React Query

## 2. 项目结构

### 2.1 前端架构

#### API 层
- 位置：`frontend/src/api/`
- 职责：封装所有与后端的通信
- 特点：
  - 使用 axios 作为 HTTP 客户端
  - 统一的错误处理和响应格式
  - 类型安全（TypeScript）
- 示例文件：
  - `transaction.api.ts`
  - `finance.api.ts`

#### 状态管理
1. React Query
   - 位置：各个 hooks 文件中
   - 用途：处理服务器状态
   - 特点：
     - 自动缓存和重新验证
     - 乐观更新
     - 错误处理和重试

2. Zustand
   - 位置：`frontend/src/stores/`
   - 用途：处理客户端状态
   - 特点：
     - 简单的 API
     - 良好的 TypeScript 支持
     - 模块化状态管理

#### Hooks 层
- 位置：`frontend/src/hooks/`
- 职责：
  - 封装业务逻辑
  - 组合 API 调用和状态管理
  - 提供可重用的功能
- 示例：
  - `useTransactions.ts`
  - `useFinanceAccounts.ts`

### 2.2 后端架构

#### API 端点
- 位置：`backend/app/api/v1/endpoints/`
- 特点：
  - RESTful API 设计
  - 使用 FastAPI 的依赖注入
  - 统一的响应格式（BaseResponse）

#### 服务层
- 位置：`backend/app/services/`
- 职责：
  - 业务逻辑处理
  - 数据库操作封装
  - 事务管理

## 3. 数据流

### 3.1 前端数据流
1. API 调用
   ```typescript
   // API 层
   async function fetchTransactions(): Promise<BaseResponse<Transaction[]>>

   // Hooks 层
   const { data } = useQuery(['transactions'], fetchTransactions)

   // 组件层
   const { transactions, isLoading } = useTransactions()
   ```

2. 状态更新
   ```typescript
   // Zustand store
   const useTransactionStore = create<TransactionState>((set) => ({
     transactions: [],
     addTransaction: async (transaction) => {
       const response = await addTransaction(transaction);
       set((state) => ({ 
         transactions: [...state.transactions, response.data] 
       }));
     }
   }));
   ```

### 3.2 后端数据流
1. 请求处理
   ```python
   @router.get("/transactions", response_model=BaseResponse[List[dict]])
   async def get_transactions(
       current_user: User = Depends(get_current_user),
       session: Session = Depends(get_session)
   ):
       service = TransactionService(session)
       transactions = service.get_transactions(current_user)
       return BaseResponse(data=[t.to_dict() for t in transactions])
   ```

## 4. 最佳实践

### 4.1 API 设计
1. 统一响应格式
   ```typescript
   interface BaseResponse<T> {
     status: number;
     message: string;
     data?: T;
   }
   ```

2. 类型安全
   - 所有 API 函数都有明确的返回类型
   - 使用 TypeScript 接口定义请求和响应数据结构

3. 错误处理
   - API 客户端统一处理错误
   - 使用响应拦截器处理非 200 状态码

### 4.2 状态管理
1. 服务器状态
   - 使用 React Query 处理
   - 自动缓存和重新验证
   - 提供加载和错误状态

2. 客户端状态
   - 使用 Zustand 处理
   - 模块化状态管理
   - 简单直观的 API

### 4.3 代码组织
1. 关注点分离
   - API 层：处理通信
   - Hooks 层：处理业务逻辑
   - 组件层：处理 UI 渲染

2. 可重用性
   - 抽象通用逻辑到 hooks
   - 使用 TypeScript 接口提高代码重用性

3. 可维护性
   - 清晰的项目结构
   - 统一的编码规范
   - 详细的类型定义
