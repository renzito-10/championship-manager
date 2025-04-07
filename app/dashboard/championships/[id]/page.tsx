import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Calendar, Trophy, Users, Settings, Share2 } from "lucide-react"
import DashboardHeader from "@/components/dashboard-header"
import MatchCard from "@/components/match-card"
import { getChampionshipById } from "@/app/actions/championship-actions"
import { getUserFromCookie } from "@/lib/auth"
import { notFound } from "next/navigation"

export default async function ChampionshipPage({ params }: { params: { id: string } }) {
  const user = await getUserFromCookie()
  const championship = await getChampionshipById(params.id)

  if (!championship) {
    notFound()
  }

  // Format dates
  const startDate = new Date(championship.startDate).toLocaleDateString()
  const endDate = new Date(championship.endDate).toLocaleDateString()

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />
      <main className="flex-1 p-6 md:p-10">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{championship.name}</h1>
              <p className="text-muted-foreground">{championship.description}</p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="flex flex-row items-center pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mr-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="font-medium">{startDate}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-row items-center pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mr-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">End Date</p>
                <p className="font-medium">{endDate}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-row items-center pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mr-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Participants</p>
                <p className="font-medium">{championship.participants}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-row items-center pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mr-4">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Matches</p>
                <p className="font-medium">{championship.matches}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="matches" className="space-y-6">
          <TabsList>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
          </TabsList>

          <TabsContent value="matches">
            <Card>
              <CardHeader>
                <CardTitle>Matches</CardTitle>
                <CardDescription>View upcoming and past matches, make your predictions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {championship.matchesData.length === 0 ? (
                    <p className="col-span-full text-center text-muted-foreground py-8">
                      No matches have been scheduled yet.
                    </p>
                  ) : (
                    championship.matchesData.map((match) => (
                      <MatchCard key={match.id} match={match} userId={user?.id} championshipId={championship.id} />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>Current standings based on prediction points</CardDescription>
              </CardHeader>
              <CardContent>
                {championship.leaderboard.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No predictions have been made yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Rank</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                        <TableHead className="text-right">Correct Results</TableHead>
                        <TableHead className="text-right">Exact Scores</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {championship.leaderboard.map((entry) => (
                        <TableRow key={entry.rank}>
                          <TableCell className="font-medium">{entry.rank}</TableCell>
                          <TableCell>{entry.user}</TableCell>
                          <TableCell className="text-right">{entry.points}</TableCell>
                          <TableCell className="text-right">{entry.correctResults}</TableCell>
                          <TableCell className="text-right">{entry.exactScores}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams">
            <Card>
              <CardHeader>
                <CardTitle>Teams</CardTitle>
                <CardDescription>Teams participating in this championship</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {championship.teams.map((team) => (
                    <Card key={team.id}>
                      <CardContent className="flex flex-col items-center p-6">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                          <span className="text-xl font-bold">
                            {team.abbreviation || team.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <h3 className="font-medium">{team.name}</h3>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

