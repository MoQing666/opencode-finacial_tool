"""
Firecrawl 配置文件
用于跨境电商数据采集
"""

import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# Firecrawl API 配置
FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY", "fc-YOUR_API_KEY")

# 常用配置
DEFAULT_CONFIG = {
    "formats": ["markdown"],  # 输出格式
    "only_main_content": True,  # 只提取主要内容
    "timeout": 30000,  # 超时时间(毫秒)
}

# 跨境电商常用目标网站
ECOMMERCE_TARGETS = {
    "1688": "https://www.1688.com",
    "alibaba": "https://www.alibaba.com",
    "amazon": "https://www.amazon.com",
    "ebay": "https://www.ebay.com",
    "shopify_stores": "https://www.shopify.com",
}

# 采集规则
SCRAPE_RULES = {
    "respect_robots_txt": True,  # 遵守robots.txt
    "delay_between_requests": 2,  # 请求间隔(秒)
    "max_pages_per_site": 100,  # 每站最大页数
}
