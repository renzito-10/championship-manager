"use server"

import { redirect } from "next/navigation"
import { comparePasswords, createUser, getUserByEmail, setUserCookie, clearUserCookie } from "@/lib/auth"
import { z } from "zod"

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  try {
    // Validate form data
    const validatedData = registerSchema.parse({
      name,
      email,
      password,
      confirmPassword,
    })

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return { success: false, message: "User with this email already exists" }
    }

    // Create new user
    const user = await createUser(name, email, password)

    // Set user cookie
    await setUserCookie(user.id)

    redirect("/dashboard")
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.flatten().fieldErrors
      const errorMessage = Object.values(fieldErrors)[0]?.[0] || "Invalid form data"
      return { success: false, message: errorMessage }
    }

    return { success: false, message: "An error occurred during registration" }
  }
}

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    // Validate form data
    loginSchema.parse({ email, password })

    // Get user by email
    const user = await getUserByEmail(email)
    if (!user) {
      return { success: false, message: "Invalid email or password" }
    }

    // Compare passwords
    const passwordMatch = await comparePasswords(password, user.password)
    if (!passwordMatch) {
      return { success: false, message: "Invalid email or password" }
    }

    // Set user cookie
    await setUserCookie(user.id)

    redirect("/dashboard")
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.flatten().fieldErrors
      const errorMessage = Object.values(fieldErrors)[0]?.[0] || "Invalid form data"
      return { success: false, message: errorMessage }
    }

    return { success: false, message: "An error occurred during login" }
  }
}

export async function logoutUser() {
  await clearUserCookie()
  redirect("/")
}

