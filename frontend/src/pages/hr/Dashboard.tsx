import { useEffect, useState } from 'react'
import { Users, Clock, CalendarCheck, UserX, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { getTodaySummary } from '../../api/attendance'
import { getLeaves } from '../../api/leaves'
import { LeaveResponse } from '../../types'

export default function HrDashboard() {
  const [summary, setSummary] = useState<Record<string, number>>({})
  const [leaves, setLeaves] = useState<LeaveResponse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getTodaySummary(), getLeaves()])
      .then(([s, l]) => {
        setSummary(s)
        setLeaves(l.filter(lv => lv.status === 'PENDING').slice(0, 5))
      })
      .catch(() => toast.error('Failed to load dashboard data'))
      .finally(() => setLoading(false))
  }, [])

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const cards = [
    { label: 'Present Today', value: summary.present ?? 0, icon: Users, color: 'bg-blue-500' },
    { label: 'Checked In', value: summary.checkedIn ?? 0, icon: Clock, color: 'bg-green-500' },
    { label: 'Checked Out', value: summary.checkedOut ?? 0, icon: CalendarCheck, color: 'bg-indigo-500' },
    { label: 'Absent', value: summary.absent ?? 0, icon: UserX, color: 'bg-red-400' },
  ]

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-50 text-yellow-700',
    APPROVED: 'bg-green-50 text-green-700',
    REJECTED: 'bg-red-50 text-red-600',
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">{today}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {cards.map((c) => (
              <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{c.label}</p>
                    <p className="mt-1 text-3xl font-bold text-gray-900">{c.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.color}`}>
                    <c.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500" />
              <h2 className="text-base font-semibold text-gray-900">Pending Leave Requests</h2>
            </div>
            {leaves.length === 0 ? (
              <p className="px-6 py-8 text-center text-sm text-gray-400">No pending leave requests</p>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">From</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">To</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {leaves.map((lv) => (
                    <tr key={lv.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3.5">
                        <p className="text-sm font-medium text-gray-900">{lv.employeeFullName}</p>
                        <p className="text-xs text-gray-400">{lv.employeeEmail}</p>
                      </td>
                      <td className="px-6 py-3.5 text-sm text-gray-600">{lv.startDate}</td>
                      <td className="px-6 py-3.5 text-sm text-gray-600">{lv.endDate}</td>
                      <td className="px-6 py-3.5 text-sm text-gray-600 max-w-xs truncate">{lv.reason}</td>
                      <td className="px-6 py-3.5">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[lv.status]}`}>
                          {lv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  )
}
