export default {
  common: {
    actions: {
      create: "创建",
      edit: "编辑",
      delete: "删除",
      save: "保存",
      cancel: "取消",
      confirm: "确认",
      back: "返回"
    },
    status: {
      loading: "加载中...",
      error: "出错了",
      success: "成功",
      comingSoon: "即将推出..."
    },
    language: {
      name: "中文",
      select: "选择语言"
    }
  },
  menu: {
    dashboard: "首页",
    transactions: "交易记录",
    budget: "预算管理",
    reports: "财务报表",
    accounts: {
      title: "账户管理",
      bank: "银行账户",
      investment: "投资账户",
      loan: "贷款账户",
      other: "其他账户"
    },
    settings: "系统设置"
  },
  accounts: {
    bankAccounts: {
      title: "银行账户",
      description: "管理您的银行账户",
      addAccount: "添加银行账户"
    },
    investmentAccounts: {
      title: "投资账户",
      description: "管理您的投资账户和投资组合",
      addAccount: "新建投资账户"
    },
    loanAccounts: {
      title: "贷款账户",
      description: "管理您的贷款和还款计划",
      addAccount: "添加贷款账户"
    },
    otherAccounts: {
      title: "其他账户",
      description: "管理其他类型的资产账户",
      addAccount: "添加其他账户"
    }
  },
  budget: {
    title: "预算管理",
    description: "设置和跟踪您的预算目标",
    createBudget: "创建预算",
    editBudget: "编辑预算",
    comingSoon: "预算管理功能即将推出..."
  },
  reports: {
    title: "财务报表",
    description: "查看您的财务分析和报告",
    timeRange: {
      label: "选择时间范围",
      week: "本周",
      month: "本月",
      quarter: "本季度",
      year: "本年度",
      custom: "自定义"
    },
    sections: {
      overview: {
        title: "收支概览",
        income: "收入",
        expenses: "支出",
        netIncome: "净收入",
        comingSoon: "图表功能即将推出..."
      },
      categories: {
        title: "支出分类",
        topCategories: "主要支出类别",
        others: "其他",
        comingSoon: "饼图功能即将推出..."
      },
      trends: {
        title: "趋势分析",
        incomeVsExpenses: "收入与支出趋势",
        netWorth: "净资产趋势",
        savingsRate: "储蓄率趋势",
        comingSoon: "趋势图功能即将推出..."
      }
    },
    filters: {
      accounts: "选择账户",
      categories: "选择类别",
      tags: "选择标签"
    },
    noData: "暂无数据",
    loading: "加载报表中..."
  },
  settings: {
    title: "系统设置",
    description: "管理您的账户和应用程序设置",
    tabs: {
      account: "账户设置",
      preferences: "偏好设置",
      notifications: "通知设置",
      security: "安全设置"
    },
    sections: {
      account: {
        title: "账户信息",
        username: "用户名",
        email: "邮箱",
        updateButton: "更新账户信息",
        comingSoon: "账户设置功能即将推出..."
      },
      preferences: {
        title: "偏好设置",
        comingSoon: "偏好设置功能即将推出..."
      },
      notifications: {
        title: "通知设置",
        comingSoon: "通知设置功能即将推出..."
      },
      security: {
        title: "安全设置",
        comingSoon: "安全设置功能即将推出..."
      }
    }
  }
};
