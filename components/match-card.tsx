"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock } from "lucide-react"
import { submitPrediction, getUserPrediction } from "@/app/actions/prediction-actions"
import { useToast } from "@/components/ui/use-toast"

interface MatchProps {
  match: {
    id: string
    homeTeam: string
    homeTeamId: string
    awayTeam: string
    awayTeamId: string
    date: string
    status: "upcoming" | "live" | "completed"
    homeScore: number | null
    awayScore: number | null
  }
  userId?: string
  championshipId: string
}

export default function MatchCard({ match, userId, championshipId }: MatchProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [prediction, setPrediction] = useState({
    homeScore: "",
    awayScore: "",
  })
  const [existingPrediction, setExistingPrediction] = useState<{
    homeScore: number
    awayScore: number
  } | null>(null)

  useEffect(() => {
    // Fetch user's prediction for this match if they're logged in
    if (userId && match.status === "upcoming") {
      const fetchPrediction = async () => {
        const result = await getUserPrediction(match.id)
        if (result) {
          setExistingPrediction({
            homeScore: result.homeScore,
            awayScore: result.awayScore,
          })
          setPrediction({
            homeScore: result.homeScore.toString(),
            awayScore: result.awayScore.toString(),
          })
        }
      }

      fetchPrediction()
    }
  }, [userId, match.id, match.status])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  }

  const handleSubmitPrediction = async () => {
    if (!userId) {
      toast({
        title: "Not logged in",
        description: "You need to be logged in to make predictions",
        variant: "destructive",
      })
      return
    }

    if (!prediction.homeScore || !prediction.awayScore) {
      toast({
        title: "Missing scores",
        description: "Please enter scores for both teams",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    const formData = new FormData()
    formData.append("matchId", match.id)
    formData.append("homeScore", prediction.homeScore)
    formData.append("awayScore", prediction.awayScore)

    const result = await submitPrediction(formData)

    setIsLoading(false)

    if (result.success) {
      setExistingPrediction({
        homeScore: Number.parseInt(prediction.homeScore),
        awayScore: Number.parseInt(prediction.awayScore),
      })

      toast({
        title: "Prediction submitted",
        description: "Your prediction has been saved",
      })
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(match.date)}</span>
          </div>
          {match.status === "upcoming" && (
            <Badge variant="outline" className="text-xs">
              Upcoming
            </Badge>
          )}
          {match.status === "live" && (
            <Badge variant="destructive" className="text-xs">
              Live
            </Badge>
          )}
          {match.status === "completed" && (
            <Badge variant="secondary" className="text-xs">
              Completed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-bold">{match.homeTeam.substring(0, 2)}</span>
              </div>
              <span className="font-medium">{match.homeTeam}</span>
            </div>
            {match.status === "completed" || match.status === "live" ? (
              <span className="text-xl font-bold">{match.homeScore}</span>
            ) : (
              <Input
                type="number"
                min="0"
                className="w-16 text-center"
                value={prediction.homeScore}
                onChange={(e) => setPrediction({ ...prediction, homeScore: e.target.value })}
                placeholder="-"
              />
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs font-bold">{match.awayTeam.substring(0, 2)}</span>
              </div>
              <span className="font-medium">{match.awayTeam}</span>
            </div>
            {match.status === "completed" || match.status === "live" ? (
              <span className="text-xl font-bold">{match.awayScore}</span>
            ) : (
              <Input
                type="number"
                min="0"
                className="w-16 text-center"
                value={prediction.awayScore}
                onChange={(e) => setPrediction({ ...prediction, awayScore: e.target.value })}
                placeholder="-"
              />
            )}
          </div>

          {existingPrediction && match.status === "upcoming" && (
            <div className="text-sm text-muted-foreground mt-2">
              Your prediction: {existingPrediction.homeScore} - {existingPrediction.awayScore}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatTime(match.date)}</span>
        </div>
        {match.status === "upcoming" && (
          <Button
            size="sm"
            onClick={handleSubmitPrediction}
            disabled={isLoading || !prediction.homeScore || !prediction.awayScore}
          >
            {isLoading ? "Submitting..." : existingPrediction ? "Update Prediction" : "Submit Prediction"}
          </Button>
        )}
        {match.status === "completed" && (
          <Button size="sm" variant="outline">
            View Details
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

