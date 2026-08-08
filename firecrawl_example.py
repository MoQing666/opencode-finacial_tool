"""
Firecrawl 使用示例
跨境电商数据采集
"""

from firecrawl import Firecrawl
from firecrawl_config import FIRECRAWL_API_KEY, DEFAULT_CONFIG

def init_firecrawl():
    """初始化 Firecrawl 客户端"""
    return Firecrawl(api_key=FIRECRAWL_API_KEY)

def scrape_product_page(url: str):
    """采集产品页面"""
    app = init_firecrawl()
    result = app.scrape(url, formats=["markdown"])
    return result

def search_products(query: str, limit: int = 5):
    """搜索产品"""
    app = init_firecrawl()
    results = app.search(query, limit=limit)
    return results

def crawl_website(url: str, limit: int = 10):
    """爬取整个网站"""
    app = init_firecrawl()
    job = app.crawl(url, limit=limit, scrape_options={"formats": ["markdown"]})
    return job

if __name__ == "__main__":
    # 示例：搜索跨境电商产品
    print("搜索示例...")
    # results = search_products("1688 supplier electronics", limit=3)
    # print(results)
    
    print("配置完成！请设置 FIRECRAWL_API_KEY 后使用")
