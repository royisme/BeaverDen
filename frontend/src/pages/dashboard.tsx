import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

// Mock data
const totalBalance = 50000
const assets = 75000
const liabilities = 25000
const monthlySpending = 3000
const monthlyBudget = 4000

const recentTransactions = [
  { id: 1, description: 'Grocery Shopping', amount: -150.75, date: '2023-06-15' },
  { id: 2, description: 'Salary Deposit', amount: 3000, date: '2023-06-01' },
  { id: 3, description: 'Netflix Subscription', amount: -14.99, date: '2023-06-10' },
  { id: 4, description: 'Gas Station', amount: -45.50, date: '2023-06-08' },
]

const accounts = [
  { id: 1, name: 'Checking Account', balance: 5000 },
  { id: 2, name: 'Savings Account', balance: 20000 },
  { id: 3, name: 'Credit Card', balance: -1500 },
]

export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalBalance.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${assets.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${liabilities.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${monthlySpending.toLocaleString()}</div>
            <Progress value={(monthlySpending / monthlyBudget) * 100} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">
              ${monthlySpending.toLocaleString()} of ${monthlyBudget.toLocaleString()} budget
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Transactions and Account Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recentTransactions.map((transaction) => (
                <li key={transaction.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{transaction.date}</p>
                  </div>
                  <span className={transaction.amount >= 0 ? "text-green-600" : "text-red-600"}>
                    ${Math.abs(transaction.amount).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        {/* Account Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Account Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {accounts.map((account) => (
                <li key={account.id} className="flex justify-between items-center">
                  <p className="font-medium">{account.name}</p>
                  <span className={account.balance >= 0 ? "text-green-600" : "text-red-600"}>
                    ${account.balance.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}