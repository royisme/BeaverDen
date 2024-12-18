import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage(): React.ReactNode {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Welcome to your dashboard!</p>
      </CardContent>
    </Card>
  )
}