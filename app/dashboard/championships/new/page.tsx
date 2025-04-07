"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createChampionship } from "@/app/actions/championship-actions"
import DashboardHeader from "@/components/dashboard-header"

export default function NewChampionshipPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [teams, setTeams] = useState<string[]>([])
  const [newTeam, setNewTeam] = useState("")
  const [activeTab, setActiveTab] = useState("details")

  // Form data
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    type: "league",
    pointsCorrectResult: "3",
    pointsExactScore: "5",
    deadline: "kickoff",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    if (teams.length < 2) {
      toast({
        title: "Error",
        description: "You need at least 2 teams to create a championship",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    const form = new FormData()

    // Add form data
    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, value)
    })

    // Add teams data
    form.append("teamsData", JSON.stringify(teams))

    const result = await createChampionship(form)

    if (result && !result.success) {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const addTeam = () => {
    if (newTeam.trim() !== "" && !teams.includes(newTeam.trim())) {
      setTeams([...teams, newTeam.trim()])
      setNewTeam("")
    }
  }

  const removeTeam = (index: number) => {
    setTeams(teams.filter((_, i) => i !== index))
  }

  const goToNextTab = () => {
    if (activeTab === "details") {
      if (!formData.name || !formData.startDate || !formData.endDate) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }
      setActiveTab("teams")
    } else if (activeTab === "teams") {
      if (teams.length < 2) {
        toast({
          title: "Not enough teams",
          description: "You need at least 2 teams to create a championship",
          variant: "destructive",
        })
        return
      }
      setActiveTab("rules")
    }
  }

  const goToPreviousTab = () => {
    if (activeTab === "teams") {
      setActiveTab("details")
    } else if (activeTab === "rules") {
      setActiveTab("teams")
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 p-6 md:p-10">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Create New Championship</h1>
          <p className="text-muted-foreground">Set up your championship details, teams, and prediction rules</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Championship Details</TabsTrigger>
              <TabsTrigger value="teams">Teams & Players</TabsTrigger>
              <TabsTrigger value="rules">Prediction Rules</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Championship Details</CardTitle>
                  <CardDescription>Enter the basic information about your championship</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Championship Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="World Cup 2023"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Describe your championship..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        type="date"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        name="endDate"
                        value={formData.endDate}
                        onChange={handleChange}
                        type="date"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Championship Type</Label>
                    <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                      <SelectTrigger id="type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="league">League (Round Robin)</SelectItem>
                        <SelectItem value="knockout">Knockout Tournament</SelectItem>
                        <SelectItem value="groups">Group Stage + Knockout</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button" onClick={() => router.push("/dashboard")}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={goToNextTab}>
                    Next: Teams & Players
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="teams">
              <Card>
                <CardHeader>
                  <CardTitle>Teams & Players</CardTitle>
                  <CardDescription>Add the teams that will participate in your championship</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="add-team">Add Team</Label>
                    <div className="flex gap-2">
                      <Input
                        id="add-team"
                        placeholder="Team name"
                        value={newTeam}
                        onChange={(e) => setNewTeam(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTeam())}
                      />
                      <Button type="button" onClick={addTeam} variant="secondary">
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Teams ({teams.length})</Label>
                    {teams.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No teams added yet. Add teams above.</p>
                    ) : (
                      <div className="border rounded-md divide-y">
                        {teams.map((team, index) => (
                          <div key={index} className="flex items-center justify-between p-3">
                            <span>{team}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTeam(index)}
                              className="h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                              <span className="sr-only">Remove</span>
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={goToPreviousTab}>
                    Back: Details
                  </Button>
                  <Button type="button" onClick={goToNextTab}>
                    Next: Prediction Rules
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="rules">
              <Card>
                <CardHeader>
                  <CardTitle>Prediction Rules</CardTitle>
                  <CardDescription>Set up how predictions and scoring will work</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pointsCorrectResult">Points for Correct Result</Label>
                    <Input
                      id="pointsCorrectResult"
                      name="pointsCorrectResult"
                      value={formData.pointsCorrectResult}
                      onChange={handleChange}
                      type="number"
                      min="0"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Points awarded for predicting the correct winner or draw
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pointsExactScore">Points for Exact Score</Label>
                    <Input
                      id="pointsExactScore"
                      name="pointsExactScore"
                      value={formData.pointsExactScore}
                      onChange={handleChange}
                      type="number"
                      min="0"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Additional points awarded for predicting the exact score
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Prediction Deadline</Label>
                    <Select value={formData.deadline} onValueChange={(value) => handleSelectChange("deadline", value)}>
                      <SelectTrigger id="deadline">
                        <SelectValue placeholder="Select deadline" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kickoff">At kickoff time</SelectItem>
                        <SelectItem value="15min">15 minutes before kickoff</SelectItem>
                        <SelectItem value="30min">30 minutes before kickoff</SelectItem>
                        <SelectItem value="1hour">1 hour before kickoff</SelectItem>
                        <SelectItem value="day">24 hours before kickoff</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">When predictions will be locked for each match</p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={goToPreviousTab}>
                    Back: Teams
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Creating..." : "Create Championship"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </main>
    </div>
  )
}

