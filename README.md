财务自动化工具
================

基于 Python Streamlit + openpyxl + Excel VBA 的财务自动化工具，
提供友好的 Web 界面，让非技术人员也能轻松进行财务数据分析。


功能特点
--------

1. 数据导入
   - 支持多种 CSV 格式和编码（UTF-8、GBK、GB2312 等）
   - 自定义分隔符（逗号、分号、制表符等）
   - 数据验证和错误提示

2. 统计分析
   - 自动生成财务统计指标（均值、总和、标准差等）
   - 支持多列同时分析
   - 详细的统计信息展示

3. 数据可视化
   - 多种图表类型（柱状图、折线图、饼图、箱线图等）
   - 交互式图表，支持缩放和筛选
   - 一键导出图表

4. 报表导出
   - 导出为 Excel 格式
   - 自动生成统计汇总、分类汇总、数据透视表
   - 支持 VBA 模板导出

5. 列映射配置
   - 自定义日期列、金额列、分类列
   - 保存配置供下次使用
   - 灵活适配不同数据格式


环境要求
--------

- Python 3.8+
- pip（Python 包管理器）


安装步骤
--------

1. 克隆项目
   git clone https://github.com/MoQing666/opencode-finacial_tool.git
   cd opencode-finacial_tool/finance_tool

2. 安装依赖
   pip install -r requirements.txt

3. 运行应用
   streamlit run app.py

   或者双击 run.bat（Windows）

4. 访问应用
   浏览器会自动打开 http://localhost:8501
   上传 CSV 文件开始分析


项目结构
--------

finance_tool/
  app.py                  Streamlit 主应用
  data_processor.py       数据处理模块
  excel_handler.py        Excel 处理模块
  config_manager.py       配置管理模块
  desktop.py              桌面启动器
  launcher.py             启动器
  requirements.txt        Python 依赖
  run.bat                 Windows 启动脚本
  build.bat               打包脚本
  data/                   数据文件夹
    sample_data.csv       示例数据
  config/                 配置文件夹
    config.json           配置文件
    column_mapping.json   列映射配置
  output/                 输出文件夹
  vba/                    VBA 模板
    financial_macros.vba  VBA 宏代码


使用指南
--------

1. 上传数据
   点击左侧"上传 CSV 文件"按钮，选择正确的文件编码和分隔符类型。

2. 查看数据
   - 数据预览：查看原始数据
   - 统计分析：查看汇总统计
   - 数据可视化：查看图表

3. 配置列映射
   - 选择日期列（用于时间序列分析）
   - 选择金额列（用于财务统计）
   - 选择分类列（用于分组汇总）

4. 导出报表
   选择导出内容，点击"导出 Excel 报表"。


常见问题
--------

Q: 如何处理中文乱码？
A: 尝试不同的编码格式（GBK、GB2312、UTF-8）

Q: 支持哪些文件格式？
A: 目前支持 CSV 格式。

Q: 数据量有限制吗？
A: 建议单次处理不超过 10 万行数据。


许可证
------

MIT License
