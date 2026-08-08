export default function Home() {
  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            数据分析 × 心理学
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            用数据驱动决策，用心理学提升自信与社交技能
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/blog"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              阅读博客
            </a>
            <a
              href="/about"
              className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              了解更多
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 数据分析 */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <div className="text-blue-600 dark:text-blue-400 mb-4">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">数据分析</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Python、SQL、Excel 等工具教程，数据可视化技巧，真实案例分析
            </p>
          </div>

          {/* 心理与自信 */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <div className="text-green-600 dark:text-green-400 mb-4">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">心理与自信</h3>
            <p className="text-gray-600 dark:text-gray-300">
              自信心建设、社交技巧、职场沟通，心理学视角的自我提升
            </p>
          </div>

          {/* 个人成长 */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <div className="text-purple-600 dark:text-purple-400 mb-4">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">个人成长</h3>
            <p className="text-gray-600 dark:text-gray-300">
              学习笔记、职业发展、成长心得，持续进步的记录
            </p>
          </div>
        </div>
      </section>

      {/* Latest Posts Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          最新文章
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                  数据分析
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  文章标题 {i}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  这里是文章的简短描述，展示文章的主要内容...
                </p>
                <a href="#" className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
                  阅读更多 →
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}