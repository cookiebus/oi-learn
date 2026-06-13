import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "邮箱和密码不能为空" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "密码至少 6 位" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "该邮箱已注册" }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    await prisma.user.create({
      data: {
        name: name || email.split("@")[0],
        email,
        passwordHash,
        role: "STUDENT",
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "注册失败" }, { status: 500 })
  }
}
