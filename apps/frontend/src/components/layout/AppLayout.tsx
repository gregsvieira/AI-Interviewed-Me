import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth.store'
import { useHeaderStore } from '@/stores/header.store'
import { History, Home, LogOut, MessageSquare, Settings } from 'lucide-react'
import { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuthStore()
  const title = useHeaderStore((state) => state.title)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="border-b border-zinc-800 bg-zinc-900">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/home" className="text-xl font-bold text-zinc-100">
            {title}
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">{user?.name}</span>
            <nav className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/home')}
                className="text-zinc-400 hover:text-zinc-100"
              >
                <Home className="w-4 h-4 mr-1" />
                Home
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/config')}
                className="text-zinc-400 hover:text-zinc-100"
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Interview
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/history')}
                className="text-zinc-400 hover:text-zinc-100"
              >
                <History className="w-4 h-4 mr-1" />
                History
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className="text-zinc-400 hover:text-zinc-100"
              >
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-zinc-400 hover:text-zinc-100"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>
      <main>
      {children}
      </main>
    </div>
  )
}
