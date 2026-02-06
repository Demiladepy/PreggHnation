'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { MoodEntry } from '@/lib/api'

interface MoodChartProps {
  entries: MoodEntry[]
}

const MOOD_LABELS: Record<number, string> = {
  1: '😢',
  2: '😔',
  3: '😐',
  4: '🙂',
  5: '😊',
}

export default function MoodChart({ entries }: MoodChartProps) {
  const chartData = useMemo(() => {
    // Sort entries by date and format for chart
    const sorted = [...entries].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )

    return sorted.map((entry) => ({
      date: new Date(entry.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      score: entry.score,
      fullDate: new Date(entry.createdAt).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    }))
  }, [entries])

  const averageScore = useMemo(() => {
    if (entries.length === 0) return 3
    return entries.reduce((sum, e) => sum + e.score, 0) / entries.length
  }, [entries])

  if (entries.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400">
        No data to display
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            domain={[1, 5]}
            ticks={[1, 2, 3, 4, 5]}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            tickLine={false}
            axisLine={{ stroke: '#e5e7eb' }}
            tickFormatter={(value) => MOOD_LABELS[value] || value}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload
                return (
                  <div className="bg-white shadow-lg rounded-lg p-3 border border-gray-100">
                    <p className="text-sm text-gray-500">{data.fullDate}</p>
                    <p className="text-lg font-semibold flex items-center gap-2">
                      <span>{MOOD_LABELS[data.score]}</span>
                      <span className="text-gray-700">{data.score}/5</span>
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <ReferenceLine
            y={averageScore}
            stroke="#c084fc"
            strokeDasharray="5 5"
            strokeWidth={1}
            label={{
              value: 'Avg',
              position: 'right',
              fontSize: 10,
              fill: '#c084fc',
            }}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#d946ef"
            strokeWidth={3}
            dot={{
              fill: '#d946ef',
              strokeWidth: 2,
              stroke: '#fff',
              r: 5,
            }}
            activeDot={{
              fill: '#a21caf',
              strokeWidth: 2,
              stroke: '#fff',
              r: 7,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
