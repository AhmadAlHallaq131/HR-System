import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Home, Clock, CalendarCheck, LogOut, UserCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const nav = [
  { to: '/employee/home', icon: Home, label: 'Home' },
  { to: '/employee/attendance', icon: Clock, label: 'My Attendance' },
  { to: '/employee/leaves', icon: CalendarCheck, label: 'My Leaves' },
]

export default function EmployeeLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-60 bg-emerald-900 flex flex-col z-20">
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-emerald-800">
          <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
            <UserCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">HR Portal</p>
            <p className="text-emerald-400 text-xs">Employee</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-700 text-white'
                    : 'text-emerald-200 hover:bg-emerald-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-emerald-800">
          <div className="px-3 py-2 mb-2">
            <p className="text-white text-sm font-medium truncate">{user?.fullName ?? user?.username}</p>
            <p className="text-emerald-400 text-xs truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-200 hover:bg-emerald-800 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-60 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
