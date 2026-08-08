export default function Blog() {
  const categories = [
    { name: "全部", count: 12 },
    { name: "数据分析", count: 6 },
    { name: "心理与自信", count: 4 },
    { name: "个人成长", count: 2 },
  ];

  const posts = [
    {
      id: 1,
      title: "Python 数据分析入门指南",
      category: "数据分析",
      date: "2024-01-15",
      excerpt: "学习如何使用 Python 进行数据分析，包括 Pandas、NumPy 等常用库的使用方法...",
    },
    {
      id: 2,
      title: "如何建立自信心：5个实用技巧",
      category: "心理与自信",
      date: "2024-01-10",
      excerpt: "自信心是成功的关键因素之一。本文将分享5个经过验证的建立自信心的实用技巧...",
    },
    {
      id: 3,
      title: "SQL 查询优化技巧",
      category: "数据分析",
      date: "2024-01-05",
      excerpt: "优化 SQL 查询可以显著提高数据库性能。本文介绍一些常用的 SQL 优化技巧...",
    },
    {
      id: 4,
      title: "职场沟通的艺术",
      category: "心理与自信",
      date: "2024-01-01",
      excerpt: "良好的职场沟通能力是职业发展的关键。本文探讨如何提升职场沟通技巧...",
    },
    {
      id: 5,
      title: "数据可视化最佳实践",
      category: "数据分析",
      date: "2023-12-28",
      excerpt: "好的数据可视化能够清晰地传达信息。本文介绍数据可视化的最佳实践...",
    },
    {
      id: 6,
      title: "我的学习笔记：2023年回顾",
      category: "个人成长",
      date: "2023-12-25",
      excerpt: "回顾2023年的学习历程，总结经验教训，为新的一年制定计划...",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">博客</h1>

        {/* Categories */}
        <div className="flex flex-wrap gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category.name}
              className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>

        {/* Blog Posts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    {post.category}
                  </span>
                  <time className="text-sm text-gray-500 dark:text-gray-400">
                    {post.date}
                  </time>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  <a href={`/blog/${post.id}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                    {post.title}
                  </a>
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {post.excerpt}
                </p>
                <a
                  href={`/blog/${post.id}`}
                  className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                >
                  阅读更多 →
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}