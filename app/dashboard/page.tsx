import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Plus } from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"
import ChampionshipCard from "@/components/championship-card"
import { getChampionships } from "@/app/actions/championship-actions"
import { requireAuth } from "@/lib/auth"

export default async function DashboardPage() {
  const user = await requireAuth()
  const { active: activeChampionships, past: pastChampionships } = await getChampionships()

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />
      <main className="flex-1 p-6 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Manage your championships and predictions</p>
          </div>
          <Link href="/dashboard/championships/new">
            <Button className="mt-4 md:mt-0">
              <Plus className="mr-2 h-4 w-4" />
              New Championship
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Active Championships</TabsTrigger>
            <TabsTrigger value="past">Past Championships</TabsTrigger>
          </TabsList>
          <TabsContent value="active" className="space-y-6">
            {activeChampionships.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No active championships</h3>
                  <p className="text-muted-foreground mb-4 text-center max-w-md">
                    Create your first championship to start predicting matches and competing with friends
                  </p>
                  <Link href="/dashboard/championships/new">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Championship
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {activeChampionships.map((championship) => (
                  <ChampionshipCard key={championship.id} championship={championship} isActive={true} />
                ))}
                <Link href="/dashboard/championships/new" className="block h-full">
                  <Card className="flex flex-col items-center justify-center h-full p-6 border-dashed cursor-pointer hover:border-primary/50 transition-colors">
                    <Plus className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground font-medium">Create New Championship</p>
                  </Card>
                </Link>
              </div>
            )}
          </TabsContent>
          <TabsContent value="past" className="space-y-6">
            {pastChampionships.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No past championships</h3>
                  <p className="text-muted-foreground text-center max-w-md">
                    Your completed championships will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {pastChampionships.map((championship) => (
                  <ChampionshipCard key={championship.id} championship={championship} isActive={false} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

