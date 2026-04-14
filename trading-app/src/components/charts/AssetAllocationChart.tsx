'use client'

import React from 'react'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend)

interface AssetAllocationChartProps {
  data: {
    sectors: string[]
    values: number[]
    colors: string[]
  }
  height?: number
}

export default function AssetAllocationChart({
  data,
  height = 300,
}: AssetAllocationChartProps) {
  const chartData = {
    labels: data.sectors,
    datasets: [
      {
        data: data.values,
        backgroundColor: data.colors,
        borderWidth: 2,
        borderColor: 'white',
        hoverOffset: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
          generateLabels: (chart: any) => {
            const data = chart.data
            if (data.labels.length && data.datasets.length) {
              const dataset = data.datasets[0]
              const total = dataset.data.reduce((a: number, b: number) => a + b, 0)
              return data.labels.map((label: string, i: number) => {
                const value = dataset.data[i]
                const percentage = ((value / total) * 100).toFixed(1)
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: dataset.backgroundColor[i],
                  hidden: false,
                  index: i,
                }
              })
            }
            return []
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((context.parsed / total) * 100).toFixed(1)
            return `${context.label}: $${context.parsed.toLocaleString()} (${percentage}%)`
          },
        },
      },
    },
    cutout: '60%',
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Asset Allocation
      </h3>
      <div style={{ height }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  )
}
