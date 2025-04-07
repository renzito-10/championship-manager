"use server"

import { redirect } from "next/navigation"
import { prisma } from "@/lib/db"
import { getUserFromCookie, requireAuth } from "@/lib/auth"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const championshipSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().optional(),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid start date",
  }),
  endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid end date",
  }),
  type: z.enum(["league", "knockout", "groups"]),
})

export async function createChampionship(formData: FormData) {
  const user = await requireAuth()

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const startDate = formData.get("startDate") as string
  const endDate = formData.get("endDate") as string
  const type = formData.get("type") as string

  // Teams data
  const teamsData = formData.get("teamsData") as string
  const teams = teamsData ? JSON.parse(teamsData) : []

  // Rules data
  const pointsCorrectResult = Number.parseInt((formData.get("pointsCorrectResult") as string) || "3")
  const pointsExactScore = Number.parseInt((formData.get("pointsExactScore") as string) || "5")
  const deadline = (formData.get("deadline") as string) || "kickoff"

  try {
    // Validate championship data
    const validatedData = championshipSchema.parse({
      name,
      description,
      startDate,
      endDate,
      type,
    })

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (start >= end) {
      return { success: false, message: "End date must be after start date" }
    }

    // Create championship with teams and rules
    const championship = await prisma.championship.create({
      data: {
        name,
        description,
        startDate: start,
        endDate: end,
        type,
        creatorId: user.id,
        teams: {
          create: teams.map((team: string) => ({
            name: team,
            abbreviation: team.substring(0, 2).toUpperCase(),
          })),
        },
        rules: {
          create: {
            pointsCorrectResult,
            pointsExactScore,
            deadline,
          },
        },
        participants: {
          create: {
            userId: user.id,
          },
        },
      },
    })

    revalidatePath("/dashboard")
    redirect(`/dashboard/championships/${championship.id}`)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.flatten().fieldErrors
      const errorMessage = Object.values(fieldErrors)[0]?.[0] || "Invalid form data"
      return { success: false, message: errorMessage }
    }

    console.error("Error creating championship:", error)
    return { success: false, message: "An error occurred while creating the championship" }
  }
}

export async function getChampionships() {
  const user = await getUserFromCookie()

  if (!user) {
    return { active: [], past: [] }
  }

  const now = new Date()

  const activeChampionships = await prisma.championship.findMany({
    where: {
      participants: {
        some: {
          userId: user.id,
        },
      },
      endDate: {
        gte: now,
      },
    },
    include: {
      teams: true,
      matches: {
        where: {
          date: {
            gte: now,
          },
        },
        orderBy: {
          date: "asc",
        },
        take: 1,
        include: {
          homeTeam: true,
          awayTeam: true,
        },
      },
      participants: {
        where: {
          userId: user.id,
        },
      },
    },
    orderBy: {
      startDate: "asc",
    },
  })

  const pastChampionships = await prisma.championship.findMany({
    where: {
      participants: {
        some: {
          userId: user.id,
        },
      },
      endDate: {
        lt: now,
      },
    },
    include: {
      teams: true,
      participants: {
        orderBy: {
          points: "desc",
        },
        take: 1,
        include: {
          user: true,
        },
      },
    },
    orderBy: {
      endDate: "desc",
    },
  })

  return {
    active: activeChampionships.map((c) => ({
      id: c.id,
      name: c.name,
      participants: c.participants.length,
      matches: (c.teams.length * (c.teams.length - 1)) / (c.type === "league" ? 1 : 2),
      nextMatch: c.matches[0] ? `${c.matches[0].homeTeam.name} vs ${c.matches[0].awayTeam.name}` : null,
      nextMatchDate: c.matches[0] ? c.matches[0].date.toISOString() : null,
      image: "/placeholder.svg?height=100&width=200",
    })),
    past: pastChampionships.map((c) => ({
      id: c.id,
      name: c.name,
      participants: c.participants.length,
      matches: (c.teams.length * (c.teams.length - 1)) / (c.type === "league" ? 1 : 2),
      winner: c.participants[0]?.user.name || "Unknown",
      completedDate: c.endDate.toISOString(),
      image: "/placeholder.svg?height=100&width=200",
    })),
  }
}

export async function getChampionshipById(id: string) {
  await requireAuth()

  const championship = await prisma.championship.findUnique({
    where: { id },
    include: {
      teams: true,
      matches: {
        include: {
          homeTeam: true,
          awayTeam: true,
          predictions: true,
        },
      },
      participants: {
        orderBy: {
          points: "desc",
        },
        include: {
          user: true,
        },
      },
      rules: true,
    },
  })

  if (!championship) {
    return null
  }

  return {
    id: championship.id,
    name: championship.name,
    description: championship.description,
    startDate: championship.startDate.toISOString(),
    endDate: championship.endDate.toISOString(),
    participants: championship.participants.length,
    matches: championship.matches.length,
    teams: championship.teams.map((team) => ({
      id: team.id,
      name: team.name,
      abbreviation: team.abbreviation,
    })),
    matchesData: championship.matches.map((match) => ({
      id: match.id,
      homeTeam: match.homeTeam.name,
      homeTeamId: match.homeTeamId,
      awayTeam: match.awayTeam.name,
      awayTeamId: match.awayTeamId,
      date: match.date.toISOString(),
      status: match.status,
      homeScore: match.homeScore,
      awayScore: match.awayScore,
    })),
    leaderboard: championship.participants.map((participant, index) => ({
      rank: index + 1,
      user: participant.user.name,
      points: participant.points,
      correctResults: participant.correctResults,
      exactScores: participant.exactScores,
    })),
    rules: championship.rules,
  }
}

