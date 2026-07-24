"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function getTicketTrends(month: number, year: number) {
  const session = await auth()
  if (!session?.user) throw new Error("Unauthorized")

  // Generate an array of days for the selected month
  const daysInMonth = new Date(year, month, 0).getDate()
  
  // Calculate previous month and year
  let prevMonth = month - 1
  let prevYear = year
  if (prevMonth === 0) {
    prevMonth = 12
    prevYear = year - 1
  }
  const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate()

  // Get start and end dates
  const startOfCurrentMonth = new Date(year, month - 1, 1)
  const endOfCurrentMonth = new Date(year, month, 1) // 1st of next month

  const startOfPrevMonth = new Date(prevYear, prevMonth - 1, 1)
  const endOfPrevMonth = new Date(prevYear, prevMonth, 1)

  // Fetch all tickets for these two months (usually well within limits for memory aggregation)
  const [currentMonthTickets, prevMonthTickets] = await Promise.all([
    prisma.ticket.findMany({
      where: {
        createdAt: {
          gte: startOfCurrentMonth,
          lt: endOfCurrentMonth
        }
      },
      select: { createdAt: true }
    }),
    prisma.ticket.findMany({
      where: {
        createdAt: {
          gte: startOfPrevMonth,
          lt: endOfPrevMonth
        }
      },
      select: { createdAt: true }
    })
  ])

  // Aggregate current month
  const currentMonthData = Array(daysInMonth).fill(0)
  currentMonthTickets.forEach(t => {
    const day = t.createdAt.getDate()
    currentMonthData[day - 1] += 1
  })

  // Aggregate previous month
  const prevMonthData = Array(daysInPrevMonth).fill(0)
  prevMonthTickets.forEach(t => {
    const day = t.createdAt.getDate()
    prevMonthData[day - 1] += 1
  })

  // Combine data into a structured format for Recharts
  // We align them by day number (1-31). If current month has 31 days and prev has 30, day 31 of prev will just be 0/null.
  const maxDays = Math.max(daysInMonth, daysInPrevMonth)
  const chartData = []

  for (let i = 0; i < maxDays; i++) {
    chartData.push({
      day: (i + 1).toString(),
      current: i < daysInMonth ? currentMonthData[i] : null,
      previous: i < daysInPrevMonth ? prevMonthData[i] : null
    })
  }

  // Calculate totals for quick stats
  const totalCurrent = currentMonthTickets.length
  const totalPrev = prevMonthTickets.length
  const percentageChange = totalPrev === 0 
    ? (totalCurrent > 0 ? 100 : 0) 
    : Math.round(((totalCurrent - totalPrev) / totalPrev) * 100)

  return {
    chartData,
    totalCurrent,
    totalPrev,
    percentageChange
  }
}
