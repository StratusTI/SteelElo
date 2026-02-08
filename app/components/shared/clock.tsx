'use client'

import { useEffect, useState } from 'react'
import { Muted } from '@/app/components/typography/text/muted'

const formatter = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

const formatNow = () => {
  const parts = formatter.formatToParts(new Date())

  const map = Object.fromEntries(parts.map(p => [p.type, p.value]))

  const weekday =
    map.weekday.charAt(0).toUpperCase() + map.weekday.slice(1)

  const month =
    map.month.charAt(0).toUpperCase() + map.month.slice(1)

  return `${weekday}, ${map.day} de ${month} ${map.hour}:${map.minute}`
}

export default function Clock() {
  const [time, setTime] = useState(() => formatNow())

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    let intervalId: ReturnType<typeof setInterval>

    const scheduleUpdate = () => {
      const now = new Date()
      const msUntilNextMinute =
        (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 1

      timeoutId = setTimeout(() => {
        setTime(formatNow())
        intervalId = setInterval(() => setTime(formatNow()), 60_000)
      }, msUntilNextMinute)
    }

    scheduleUpdate()

    return () => {
      clearTimeout(timeoutId)
      clearInterval(intervalId)
    }
  }, [])

  return <Muted>{time}</Muted>
}
