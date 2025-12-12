# GTA载具保险库 (GTA Vehicle Vault)

一个基于 Tauri + React + TypeScript 的 GTA 载具管理桌面应用程序，帮助玩家轻松管理和组织他们的车库与载具。

## 功能特性

### 载具管理
- **载具浏览**：按品牌、类型、特性等多种方式筛选和排序载具
- **载具搜索**：支持中英文名称搜索
- **价格排序**：按价格高低排序载具

### 车库管理
- **创建车库**：自定义车库名称、容量和备注
- **添加载具**：将载具添加到指定车库位置
- **移动载具**：在不同车库之间移动载具
- **替换载具**：确认替换已存在的载具
- **删除载具**：从车库中移除载具

## 技术栈

### 前端
- **React 19**：现代化的 UI 框架
- **TypeScript**：类型安全的 JavaScript 超集
- **Vite**：快速的构建工具

### 后端
- **Tauri**：安全、轻量级的桌面应用框架
- **Rust**：高性能的系统编程语言

### 数据库
- **SQLite**：轻量级的嵌入式数据库

## 安装与运行

### 环境要求
- **Node.js**：>= 18.0.0
- **pnpm**：>= 8.0.0
- **Rust**：>= 1.70.0
- **Tauri CLI**：>= 2.0.0

### 安装步骤

1. **克隆仓库**
   ```bash
   git clone https://github.com/real47LEBJ/GTA-Vehicle-Vault.git
   cd GTA-Vehicle-Vault
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **开发模式运行**
   ```bash
   pnpm tauri dev
   ```

4. **构建生产版本**
   ```bash
   pnpm tauri build
   ```

## 项目结构

```
GTA-Vehicle-Vault/
├── src/                    # 前端源代码
│   ├── components/         # React 组件
│   ├── pages/              # 页面组件
│   ├── styles/             # CSS 样式
│   ├── utils/              # 工具函数
│   ├── types.ts            # TypeScript 类型定义
│   └── App.tsx             # 应用入口组件
├── src-tauri/              # Tauri 后端代码
│   ├── src/                # Rust 源代码
│   └── tauri.conf.json     # Tauri 配置文件
├── public/                 # 静态资源
│   ├── gta/                # GTA 载具数据
│   └── logos/              # 品牌标志
├── index.html              # HTML 入口文件
├── package.json            # 前端依赖配置
└── tsconfig.json           # TypeScript 配置
```

## 使用指南

### 1. 车库管理

#### 创建车库
1. 在主页点击"添加车库"按钮
2. 输入车库名称和容量
3. 可选：添加备注信息
4. 点击"确认"创建车库

#### 编辑车库
1. 点击车库卡片上的编辑按钮
2. 修改车库备注信息
3. 点击"保存"更新车库备注信息

#### 删除车库
1. 选择一个或多个车库
2. 点击"删除选中车库"按钮
3. 在确认对话框中点击"确认"删除

### 2. 载具管理

#### 浏览载具
1. 切换到"载具添加"页面
2. 选择品牌查看该品牌的所有载具
3. 使用筛选器按类型、特性等筛选载具
4. 使用搜索框搜索特定载具

#### 添加载具到车库
1. 找到要添加的载具
2. 点击载具卡片的新增按钮
3. 选择目标车库
4. 选择车库中的位置
5. 点击"确认"添加载具

#### 移动载具
1. 在车库中找到要移动的载具
2. 点击载具上的移动按钮
3. 选择目标车库和位置
4. 确认移动

#### 替换载具
1. 添加载具时选择已被占用的位置
2. 系统会提示确认替换
3. 点击"确认"替换现有载具

#### 删除载具
1. 点击载具上的删除按钮
2. 系统会提示是否删除
3. 点击"确认"删除载具

#### 更新载具信息
1. 在主页点击"更新数据"按钮
2. 系统会自动更新所有载具的信息


## 数据说明

### 载具数据
- 包含所有 GTA 载具的详细信息
- 记录载具价格、类型和特性
- 标记不可获取的载具

### 车库数据
- 支持自定义车库容量
- 记录每个车库的载具列表
- 支持车库的备注

## 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目！

### 开发流程
1. Fork 仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 联系方式

如果您有任何问题或建议，请通过以下方式联系我们：

- GitHub Issues: [https://github.com/real47LEBJ/GTA-Vehicle-Vault/issues](https://github.com/real47LEBJ/GTA-Vehicle-Vault/issues)
- Email: real47LEBJ@outlook.com
## 致谢

- [Tauri](https://tauri.app/) - 提供了优秀的桌面应用框架
- [React](https://react.dev/) - 现代化的 UI 开发体验
- Rockstar Games - 创造了 GTA 这个伟大的游戏系列

---

**享受管理您的 GTA 载具收藏！**
