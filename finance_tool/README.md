# 💰 财务自动化工具

基于 Python Streamlit + openpyxl + Excel VBA 的财务自动化工具，提供友好的Web界面，让非技术人员也能轻松进行财务数据分析。

## ✨ 功能特点

### 📊 数据导入
- 支持多种CSV格式和编码（UTF-8、GBK、GB2312等）
- 自定义分隔符（逗号、分号、制表符等）
- 数据验证和错误提示

### 📈 统计分析
- 自动生成财务统计指标（均值、总和、标准差等）
- 支持多列同时分析
- 详细的统计信息展示

### 📉 数据可视化
- 多种图表类型（柱状图、折线图、饼图、箱线图等）
- 交互式图表，支持缩放和筛选
- 一键导出图表

### 📤 报表导出
- 导出为Excel格式
- 自动生成统计汇总、分类汇总、数据透视表
- 支持VBA模板导出

### 🔧 列映射配置
- 自定义日期列、金额列、分类列
- 保存配置供下次使用
- 灵活适配不同数据格式

## 🚀 快速开始

### 环境要求
- Python 3.8+
- pip（Python包管理器）

### 安装步骤

1. **克隆或下载项目**
   ```bash
   cd finance_tool
   ```

2. **安装依赖**
   ```bash
   pip install -r requirements.txt
   ```

3. **运行应用**
   ```bash
   streamlit run app.py
   ```
   
   或者双击 `run.bat`（Windows）

4. **访问应用**
   - 浏览器会自动打开 http://localhost:8501
   - 上传CSV文件开始分析

## 📁 项目结构

```
finance_tool/
├── app.py                 # Streamlit主应用
├── data_processor.py      # 数据处理模块
├── excel_handler.py       # Excel处理模块
├── requirements.txt       # Python依赖
├── run.bat               # Windows启动脚本
├── README.md             # 项目说明
├── data/                 # 数据文件夹
│   └── sample_data.csv   # 示例数据
├── output/               # 输出文件夹
└── vba/                  # VBA模板
    └── financial_macros.vba  # VBA宏代码
```

## 📖 使用指南

### 1. 上传数据
- 点击左侧"上传CSV文件"按钮
- 选择正确的文件编码
- 选择分隔符类型

### 2. 查看数据
- 数据预览：查看原始数据
- 统计分析：查看汇总统计
- 数据可视化：查看图表

### 3. 配置列映射
- 选择日期列（用于时间序列分析）
- 选择金额列（用于财务统计）
- 选择分类列（用于分组汇总）

### 4. 导出报表
- 选择导出内容（原始数据、统计汇总等）
- 选择是否包含图表
- 点击"导出Excel报表"

## 📊 示例数据

项目提供了示例CSV文件 `data/sample_data.csv`，包含以下字段：
- 日期
- 部门
- 费用类别
- 金额
- 备注

可以直接使用示例数据体验功能。

## 🔧 VBA模板

VBA模板位于 `vba/financial_macros.vba`，包含以下功能：
- 自动生成财务报表
- 按部门汇总
- 导出为PDF/Excel
- 数据刷新

### 使用VBA模板
1. 打开Excel
2. 按 `Alt + F11` 打开VBA编辑器
3. 导入 `financial_macros.vba` 文件
4. 运行相应的宏

## 💡 常见问题

### Q: 如何处理中文乱码？
A: 尝试不同的编码格式（GBK、GB2312、UTF-8）

### Q: 支持哪些文件格式？
A: 目前支持CSV格式，未来将支持Excel格式

### Q: 如何自定义报表样式？
A: 可以修改 `excel_handler.py` 中的样式定义

### Q: 数据量有限制吗？
A: 建议单次处理不超过10万行数据

## 📝 更新日志

### v1.0.0 (2024-01-01)
- 初始版本发布
- 支持CSV数据导入
- 支持统计分析和可视化
- 支持Excel报表导出
- 支持VBA模板

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交Issue和Pull Request！

## 📧 联系方式

如有问题，请提交Issue或联系开发者。
