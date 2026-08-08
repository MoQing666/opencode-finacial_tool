export default function BlogPost({ params }: { params: { id: string } }) {
  // Mock data - in real app, this would come from database
  const post = {
    id: params.id,
    title: "Python 数据分析入门指南",
    category: "数据分析",
    date: "2024-01-15",
    author: "DA Blog",
    content: `
      <p>Python 是数据分析领域最流行的编程语言之一。本文将介绍如何使用 Python 进行数据分析。</p>
      
      <h2>为什么选择 Python？</h2>
      <p>Python 有以下优势：</p>
      <ul>
        <li>语法简洁易学</li>
        <li>丰富的数据分析库</li>
        <li>强大的社区支持</li>
        <li>与其他工具的良好集成</li>
      </ul>
      
      <h2>常用数据分析库</h2>
      <p>以下是 Python 数据分析中最常用的库：</p>
      <ul>
        <li><strong>Pandas</strong>: 数据处理和分析</li>
        <li><strong>NumPy</strong>: 数值计算</li>
        <li><strong>Matplotlib</strong>: 数据可视化</li>
        <li><strong>Seaborn</strong>: 统计可视化</li>
        <li><strong>Scikit-learn</strong>: 机器学习</li>
      </ul>
      
      <h2>入门示例</h2>
      <p>下面是一个简单的数据分析示例：</p>
      <pre><code>
import pandas as pd
import numpy as np

# 创建数据
data = {
    'Name': ['Alice', 'Bob', 'Charlie'],
    'Age': [25, 30, 35],
    'Score': [85, 90, 95]
}

# 创建 DataFrame
df = pd.DataFrame(data)

# 查看数据
print(df.describe())
      </code></pre>
      
      <h2>下一步学习</h2>
      <p>掌握基础后，你可以：</p>
      <ul>
        <li>学习更复杂的数据处理技术</li>
        <li>探索机器学习算法</li>
        <li>实践真实项目</li>
      </ul>
    `,
  };

  return (
    <div className="bg-white dark:bg-gray-900">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm text-blue-600 dark:text-blue-400">
              {post.category}
            </span>
            <time className="text-sm text-gray-500 dark:text-gray-400">
              {post.date}
            </time>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {post.title}
          </h1>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {post.author}
              </p>
            </div>
          </div>
        </header>

        {/* Content */}
        <div
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            标签
          </h3>
          <div className="flex flex-wrap gap-2">
            {["Python", "数据分析", "Pandas", "NumPy"].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Related Posts */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            相关文章
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
              >
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                  相关文章标题 {i}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  文章简短描述...
                </p>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}