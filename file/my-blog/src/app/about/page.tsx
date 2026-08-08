export default function About() {
  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">关于我</h1>
        
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div className="mb-12">
            <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto md:mx-0 mb-6"></div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              数据分析师 | 心理学爱好者
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              你好！我是一名数据分析师，同时也对心理学有着浓厚的兴趣。
              我相信数据分析和心理学的结合能够帮助我们更好地理解世界和自己。
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              在这个博客中，我将分享：
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                数据分析技能
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• Python 数据分析 (Pandas, NumPy, Matplotlib)</li>
                <li>• SQL 数据库查询</li>
                <li>• Excel 高级功能</li>
                <li>• 数据可视化 (Tableau, Power BI)</li>
                <li>• 统计学基础</li>
              </ul>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                心理学知识
              </h3>
              <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                <li>• 自信心建设</li>
                <li>• 社交心理学</li>
                <li>• 沟通技巧</li>
                <li>• 情绪管理</li>
                <li>• 职场心理学</li>
              </ul>
            </div>
          </div>

          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              我的目标
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              通过这个博客，我希望能够：
            </p>
            <ul className="space-y-3 text-gray-600 dark:text-gray-300">
              <li className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
                分享实用的数据分析技巧和工具
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
                提供心理学视角的自我提升方法
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
                帮助读者建立自信，提升社交技能
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
                记录自己的学习和成长历程
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              联系我
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              如果你对数据分析或心理学有任何问题，或者想要交流，
              欢迎通过联系方式页面与我取得联系。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}