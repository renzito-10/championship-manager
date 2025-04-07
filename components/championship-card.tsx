import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy, Calendar, Users, ArrowRight } from "lucide-react"

interface ChampionshipCardProps {
  championship: {
    id: string
    name: string
    participants: number
    matches: number
    image: string
    nextMatch?: string
    nextMatchDate?: string
    winner?: string
    completedDate?: string
  }
  isActive: boolean
}

export default function ChampionshipCard({ championship, isActive }: ChampionshipCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={championship.image || "/placeholder.svg"}
          alt={championship.name}
          className="h-full w-full object-cover"
        />
      </div>
      <CardHeader>
        <CardTitle>{championship.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{championship.participants} participants</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <span>{championship.matches} matches</span>
          </div>
          {isActive && championship.nextMatch && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span>Next: {championship.nextMatch}</span>
                <span className="text-xs text-muted-foreground">{championship.nextMatchDate}</span>
              </div>
            </div>
          )}
          {!isActive && championship.winner && (
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-primary" />
              <div className="flex flex-col">
                <span>Winner: {championship.winner}</span>
                <span className="text-xs text-muted-foreground">Completed: {championship.completedDate}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/dashboard/championships/${championship.id}`} className="w-full">
          <Button className="w-full" variant={isActive ? "default" : "outline"}>
            {isActive ? "View & Predict" : "View Results"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

