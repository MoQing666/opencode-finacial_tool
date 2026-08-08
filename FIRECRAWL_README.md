# Firecrawl 跨境电商数据采集工具

## 安装状态
✅ 已安装 `firecrawl-py 4.34.0`

## 文件说明
- `firecrawl_config.py` - 配置文件
- `firecrawl_example.py` - 使用示例
- `.env` - 环境变量（API密钥）
- `requirements.txt` - 依赖列表

## 快速开始

### 1. 获取API密钥
访问 https://firecrawl.dev 注册并获取API密钥

### 2. 配置API密钥
编辑 `.env` 文件，替换 `FIRECRAWL_API_KEY`:
```
FIRECRAWL_API_KEY=fc-你的实际密钥
```

### 3. 使用示例

```python
from firecrawl import Firecrawl

app = Firecrawl(api_key="fc-你的密钥")

# 采集单个页面
result = app.scrape("https://example.com")
print(result.markdown)

# 搜索产品
results = app.search("1688 electronics supplier", limit=5)
print(results)

# 爬取网站
job = app.crawl("https://example.com", limit=10)
print(job)
```

## 跨境电商应用场景
- 竞品价格监控
- 产品信息采集
- 市场趋势分析
- 供应商信息收集

## 注意事项
- 遵守目标网站的robots.txt规则
- 控制请求频率，避免被封
- 仅用于合法数据采集用途
