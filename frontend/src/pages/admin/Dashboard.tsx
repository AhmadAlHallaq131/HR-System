import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Building2, Users, TrendingUp, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { getPlatformStats } from '../../api/admin'

export default function AdminDashboard() {
  const [stats, setStats] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPlatformStats()
      .then(setStats)
      .catch(() => toast.error('Failed to load platform stats'))
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    { label: 'Total Companies', value: stats.totalCompanies ?? 0, icon: Building2, color: 'bg-indigo-600', to: '/admin/companies' },
    { label: 'Active Companies', value: stats.activeCompanies ?? 0, icon: TrendingUp, color: 'bg-green-500', to: '/admin/companies' },
    { label: 'Total Employees', value: stats.totalEmployees ?? 0, icon: Users, color: 'bg-blue-500', to: '/admin/companies' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-gray-500 text-sm mt-1">All companies using the HR System</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {cards.map((c) => (
            <Link key={c.label} to={c.to} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{c.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{c.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.color}`}>
                  <c.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                View details <ArrowRight className="w-3 h-3 ml-1" />
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <Link
          to="/admin/companies"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <Building2 className="w-4 h-4" />
          Manage Companies
        </Link>
      </div>
    </div>
  )
}
