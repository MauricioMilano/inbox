'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LogOut, Settings, Inbox } from 'lucide-react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()
  const router = useRouter()

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Inbox className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-lg text-slate-900 dark:text-white">
                Milano Inbox
              </span>
            </Link>

            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-ghost text-slate-600 dark:text-slate-300"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 bg-slate-50 dark:bg-slate-900">
        {children}
      </main>
    </div>
  )
}
