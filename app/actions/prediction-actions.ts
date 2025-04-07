"use server"
import { prisma } from "@/lib/db"
import { requireAuth } from "@/lib/auth"
import { z } from "zod"
import { revalidatePath } from "next/cache"

const predictionSchema = z.object({
  matchId: z.string(),
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
})

export async function submitPrediction(formData: FormData) {
  const user = await requireAuth()

  const matchId = formData.get("matchId") as string
  const homeScore = Number.parseInt(formData.get("homeScore") as string)
  const awayScore = Number.parseInt(formData.get("awayScore") as string)

  try {
    // Validate prediction data
    const validatedData = predictionSchema.parse({
      matchId,
      homeScore,
      awayScore,
    })

    // Get match to check if it's still open for predictions
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        championship: {
          include: {
            rules: true,
          },
        },
      },
    })

    if (!match) {
      return { success: false, message: "Match not found" }
    }

    if (match.status !== "upcoming") {
      return { success: false, message: "Match has already started or ended" }
    }

    // Check deadline based on rules
    const now = new Date()
    const matchDate = new Date(match.date)
    const deadlineTime = new Date(matchDate)

    switch (match.championship.rules?.deadline) {
      case "15min":
        deadlineTime.setMinutes(deadlineTime.getMinutes() - 15)
        break
      case "30min":
        deadlineTime.setMinutes(deadlineTime.getMinutes() - 30)
        break
      case "1hour":
        deadlineTime.setHours(deadlineTime.getHours() - 1)
        break
      case "day":
        deadlineTime.setDate(deadlineTime.getDate() - 1)
        break
      // Default is kickoff time
    }

    if (now > deadlineTime) {
      return { success: false, message: "Prediction deadline has passed" }
    }

    // Create or update prediction
    await prisma.prediction.upsert({
      where: {
        userId_matchId: {
          userId: user.id,
          matchId,
        },
      },
      update: {
        homeScore,
        awayScore,
      },
      create: {
        userId: user.id,
        matchId,
        homeScore,
        awayScore,
      },
    })

    revalidatePath(`/dashboard/championships/${match.championshipId}`)
    return { success: true, message: "Prediction submitted successfully" }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.flatten().fieldErrors
      const errorMessage = Object.values(fieldErrors)[0]?.[0] || "Invalid prediction data"
      return { success: false, message: errorMessage }
    }

    console.error("Error submitting prediction:", error)
    return { success: false, message: "An error occurred while submitting your prediction" }
  }
}

export async function getUserPrediction(matchId: string) {
  const user = await requireAuth()

  const prediction = await prisma.prediction.findUnique({
    where: {
      userId_matchId: {
        userId: user.id,
        matchId,
      },
    },
  })

  return prediction
}

