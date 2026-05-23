import { useEffect, useState } from 'react'
import { Calendar, Users, Clock, CheckCircle2, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { getAllAttendance, getTodaySummary } from '../../api/attendance'
import { AttendanceRecord } from '../../types'

function fmt(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function fmtMinutes(m: number | null): string {
  if (m == null) return '—'
  const h = Math.floor(m / 60)
  const min = m % 60
  return h > 0 ? `${h}h ${min}m` : `${min}m`
}

export default function HrAttendance() {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [summary, setSummary] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const load = async (d: string) => {
    setLoading(true)
    try {
      const [recs, sum] = await Promise.all([
        getAllAttendance(d),
        d === today ? getTodaySummary() : Promise.resolve({}),
      ])
      setRecords(recs)
      setSummary(sum)
    } catch {
      toast.error('Failed to load attendance records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(date) }, [date])

  const statusBadge = (status: string) => {
    if (status === 'CHECKED_IN') return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full"><CheckCircle2 className="w-3 h-3" />Checked In</span>
    if (status === 'CHECKED_OUT') return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"><CheckCircle2 className="w-3 h-3" />Checked Out</span>
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full"><XCircle className="w-3 h-3" />Absent</span>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-500 text-sm mt-1">Track daily employee attendance</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {date === today && Object.keys(summary).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Present', value: summary.present ?? 0, icon: Users, color: 'text-blue-600 bg-blue-50' },
            { label: 'Checked In', value: summary.checkedIn ?? 0, icon: Clock, color: 'text-green-600 bg-green-50' },
            { label: 'Checked Out', value: summary.checkedOut ?? 0, icon: CheckCircle2, color: 'text-indigo-600 bg-indigo-50' },
            { label: 'Absent', value: summary.absent ?? 0, icon: XCircle, color: 'text-red-500 bg-red-50' },
          ].map(c => (
            <div key={c.label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${c.color.split(' ')[1]}`}>
                <c.icon className={`w-4 h-4 ${c.color.split(' ')[0]}`} />
              </div>
              <div>
                <p className="text-xs text-gray-500">{c.label}</p>
                <p className="text-xl font-bold text-gray-900">{c.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No attendance records for {date}.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Check In</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Check Out</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Hours</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{r.employeeFullName ?? `Employee #${r.employeeId}`}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{r.departmentName ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-mono">{fmt(r.checkInTime)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-mono">{fmt(r.checkOutTime)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{fmtMinutes(r.workMinutes)}</td>
                  <td className="px-6 py-4">{statusBadge(r.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
