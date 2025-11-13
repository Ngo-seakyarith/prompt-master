import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { assessQuizAnswers } from "@/lib/openrouter"
import { z } from "zod"

const submitQuizSchema = z.object({
  quizId: z.string(),
  answers: z.array(z.number().int().min(0)),
  timeSpent: z.number().int().min(0).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { quizId, answers, timeSpent } = submitQuizSchema.parse(body)

    // Get quiz with questions
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    })

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    // Validate answers length
    if (answers.length !== quiz.questions.length) {
      return NextResponse.json(
        { error: "Invalid number of answers" },
        { status: 400 }
      )
    }

    // Calculate score
    let correctCount = 0
    let totalPoints = 0
    const questionsData = quiz.questions.map((q, idx) => {
      const isCorrect = q.correctAnswerIndex === answers[idx]
      if (isCorrect) {
        correctCount += q.points
      }
      totalPoints += q.points
      return {
        questionText: q.questionText,
        correctAnswerIndex: q.correctAnswerIndex,
      }
    })

    // Get AI feedback
    const feedback = await assessQuizAnswers(questionsData, answers, timeSpent)

    // Save attempt
    await prisma.quizAttempt.create({
      data: {
        userId: session.user.id,
        quizId,
        score: correctCount,
        maxScore: totalPoints,
        answers,
        feedback,
        timeSpent,
      },
    })

    // Update module progress if quiz score is high
    if (feedback.percentage >= 70) {
      await prisma.userProgress.upsert({
        where: {
          userId_moduleId: {
            userId: session.user.id,
            moduleId: quiz.moduleId,
          },
        },
        update: {
          isCompleted: true,
          lastAttempt: new Date(),
        },
        create: {
          userId: session.user.id,
          moduleId: quiz.moduleId,
          isCompleted: true,
        },
      })
    }

    return NextResponse.json(feedback)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    console.error("Error submitting quiz:", error)
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    )
  }
}
