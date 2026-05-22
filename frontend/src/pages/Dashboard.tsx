import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Building2, CalendarCheck, UserCheck, ArrowRight, Clock } from 'lucide-react'
import { getEmployees } from '../api/employees'
import { getDepartments } from '../api/departments'
import { getLeaves } from '../api/leaves'
import { Employee, Department, LeaveRequest } from '../types'
import Header from '../components/Header'
import Badge from '../components/Badge'
import { useAuth } from '../contexts/AuthContext'

interface StatCardProps {
  label: string
  value: number
  icon: React.ElementType
  color: string
  to: string
}

function StatCard({ label, value, icon: Icon, color, to }: StatCardProps) {
  return (
    <Link to={to} className="card p-6 hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="mt-4 flex items-center text-xs text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        View all <ArrowRight className="w-3 h-3 ml-1" />
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const { isHR } = useAuth()
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      isHR ? getEmployees() : Promise.resolve([]),
      isHR ? getDepartments() : Promise.resolve([]),
      isHR ? getLeaves() : Promise.resolve([]),
    ]).then(([e, d, l]) => {
      setEmployees(e)
      setDepartments(d)
      setLeaves(l)
    }).finally(() => setLoading(false))
  }, [isHR])

  const activeEmployees = employees.filter((e) => e.status === 'ACTIVE').length
  const pendingLeaves = leaves.filter((l) => l.status === 'PENDING').length
  const recentLeaves = leaves.slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <Header title="Dashboard" subtitle="Overview of your HR operations" />

      {isHR ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <StatCard label="Total Employees"  value={employees.length}  icon={Users}        color="bg-blue-600"   to="/employees" />
            <StatCard label="Active Employees"  value={activeEmployees}  icon={UserCheck}    color="bg-green-500"  to="/employees" />
            <StatCard label="Departments"        value={departments.length} icon={Building2}  color="bg-violet-500" to="/departments" />
            <StatCard label="Pending Leaves"     value={pendingLeaves}    icon={CalendarCheck} color="bg-amber-500"  to="/leaves" />
          </div>

          {/* Recent leave requests */}
          <div className="card">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" /> Recent Leave Requests
              </h2>
              <Link to="/leaves" className="text-sm text-blue-600 hover:underline font-medium">View all</Link>
            </div>
            {recentLeaves.length === 0 ? (
              <p className="text-sm text-gray-500 px-6 py-8 text-center">No leave requests yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="table-th">Employee</th>
                      <th className="table-th">Period</th>
                      <th className="table-th">Reason</th>
                      <th className="table-th">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentLeaves.map((l) => (
                      <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                        <td className="table-td font-medium">
                          {l.employee.firstName} {l.employee.lastName}
                        </td>
                        <td className="table-td text-gray-500">{l.startDate} → {l.endDate}</td>
                        <td className="table-td text-gray-500 max-w-xs truncate">{l.reason || '—'}</td>
                        <td className="table-td"><Badge value={l.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="card p-8 text-center">
          <CalendarCheck className="w-12 h-12 text-blue-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-800 mb-1">Your HR Portal</h2>
          <p className="text-sm text-gray-500 mb-4">Use the sidebar to navigate to your leave requests.</p>
          <Link to="/leaves" className="btn-primary">View My Leaves</Link>
        </div>
      )}
    </div>
  )
}
