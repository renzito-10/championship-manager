import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "./db"
import bcrypt from "bcryptjs"

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10)
}

export async function comparePasswords(plainPassword: string, hashedPassword: string) {
  return await bcrypt.compare(plainPassword, hashedPassword)
}

export async function createUser(name: string, email: string, password: string) {
  const hashedPassword = await hashPassword(password)

  return await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  })
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  })
}

export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
  })
}

export async function setUserCookie(userId: string) {
  cookies().set("userId", userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })
}

export async function getUserFromCookie() {
  const userId = cookies().get("userId")?.value

  if (!userId) {
    return null
  }

  return await getUserById(userId)
}

export async function clearUserCookie() {
  cookies().delete("userId")
}

export async function requireAuth() {
  const user = await getUserFromCookie()

  if (!user) {
    redirect("/login")
  }

  return user
}

