import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { getMyAttendanceHistory } from '../../api/attendance'
import { AttendanceRecord } from '../../types'

function fmtTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function fmtMinutes(m: number | null): string {
  if (m == null) return '—'
  const h = Math.floor(m / 60)
  const min = m % 60
  return h > 0 ? `${h}h ${min}m` : `${min}m`
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

export default function EmployeeAttendance() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)

  const load = async (y: number, m: number) => {
    setLoading(true)
    try {
      setRecords(await getMyAttendanceHistory(y, m))
    } catch {
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(year, month) }, [year, month])

  const prev = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }

  const next = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const daysPresent = records.filter(r => r.status !== 'ABSENT').length
  const totalMinutes = records.reduce((sum, r) => sum + (r.workMinutes ?? 0), 0)

  const statusColor = (s: string) => {
    if (s === 'CHECKED_IN') return 'bg-green-50 text-green-700'
    if (s === 'CHECKED_OUT') return 'bg-blue-50 text-blue-700'
    return 'bg-red-50 text-red-500'
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-gray-500 text-sm mt-1">Your check-in and check-out history</p>
      </div>

      {/* Month nav */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={prev} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <span className="text-lg font-semibold text-gray-900 w-44 text-center">{MONTHS[month - 1]} {year}</span>
        <button onClick={next} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors">
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Summary */}
      {!loading && records.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{daysPresent}</p>
            <p className="text-xs text-gray-500 mt-1">Days Present</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{records.length - daysPresent}</p>
            <p className="text-xs text-gray-500 mt-1">Days Absent</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{Math.round(totalMinutes / 60 * 10) / 10}h</p>
            <p className="text-xs text-gray-500 mt-1">Total Hours</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No records for {MONTHS[month - 1]} {year}.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Check In</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Check Out</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Duration</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-mono">{fmtTime(r.checkInTime)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-mono">{fmtTime(r.checkOutTime)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{fmtMinutes(r.workMinutes)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(r.status)}`}>
                      {r.status === 'CHECKED_IN' ? 'Present' : r.status === 'CHECKED_OUT' ? 'Completed' : 'Absent'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
