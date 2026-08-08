export default function Portfolio() {
  const projects = [
    {
      id: 1,
      title: "销售数据分析仪表板",
      description: "使用 Python 和 Tableau 构建的销售数据分析仪表板，可视化展示销售趋势和关键指标。",
      tools: ["Python", "Pandas", "Tableau"],
      category: "数据分析",
    },
    {
      id: 2,
      title: "客户行为分析",
      description: "分析客户购买行为数据，识别购买模式和客户细分，为营销策略提供数据支持。",
      tools: ["Python", "SQL", "Matplotlib"],
      category: "数据分析",
    },
    {
      id: 3,
      title: "自信心提升计划",
      description: "基于心理学研究设计的自信心提升计划，包括每日练习和进度跟踪。",
      tools: ["心理学", "Excel", "数据分析"],
      category: "心理学",
    },
    {
      id: 4,
      title: "社交媒体情感分析",
      description: "使用自然语言处理技术分析社交媒体上的情感倾向，了解用户反馈。",
      tools: ["Python", "NLP", "Pandas"],
      category: "数据分析",
    },
    {
      id: 5,
      title: "职场沟通技巧研究",
      description: "研究职场中的有效沟通技巧，总结成功案例和失败教训。",
      tools: ["心理学", "研究方法", "数据分析"],
      category: "心理学",
    },
    {
      id: 6,
      title: "个人学习进度追踪",
      description: "构建个人学习进度追踪系统，记录学习时间和技能掌握程度。",
      tools: ["Python", "SQLite", "数据可视化"],
      category: "个人项目",
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">项目展示</h1>
        
        <p className="text-gray-600 dark:text-gray-300 mb-12 max-w-3xl">
          这里展示了我在数据分析和心理学领域的一些项目。
          每个项目都代表了我在特定领域的学习和实践成果。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    {project.category}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {project.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}