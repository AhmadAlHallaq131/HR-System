import { useEffect, useState } from 'react'
import { CalendarCheck, CheckCircle2, XCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { getLeaves, approveLeave, rejectLeave } from '../../api/leaves'
import { LeaveResponse } from '../../types'

export default function HrLeaves() {
  const [leaves, setLeaves] = useState<LeaveResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')
  const [acting, setActing] = useState<number | null>(null)

  const load = async () => {
    try {
      setLeaves(await getLeaves())
    } catch {
      toast.error('Failed to load leave requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleApprove = async (id: number) => {
    setActing(id)
    try {
      await approveLeave(id)
      toast.success('Leave approved')
      load()
    } catch {
      toast.error('Failed to approve leave')
    } finally {
      setActing(null)
    }
  }

  const handleReject = async (id: number) => {
    setActing(id)
    try {
      await rejectLeave(id)
      toast.success('Leave rejected')
      load()
    } catch {
      toast.error('Failed to reject leave')
    } finally {
      setActing(null)
    }
  }

  const filtered = filter === 'ALL' ? leaves : leaves.filter(l => l.status === filter)

  const statusBadge = (status: string) => {
    if (status === 'APPROVED') return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full"><CheckCircle2 className="w-3 h-3" />Approved</span>
    if (status === 'REJECTED') return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full"><XCircle className="w-3 h-3" />Rejected</span>
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-full"><Clock className="w-3 h-3" />Pending</span>
  }

  const tabs: Array<typeof filter> = ['ALL', 'PENDING', 'APPROVED', 'REJECTED']
  const counts = {
    ALL: leaves.length,
    PENDING: leaves.filter(l => l.status === 'PENDING').length,
    APPROVED: leaves.filter(l => l.status === 'APPROVED').length,
    REJECTED: leaves.filter(l => l.status === 'REJECTED').length,
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Leave Requests</h1>
        <p className="text-gray-500 text-sm mt-1">Review and manage employee leaves</p>
      </div>

      <div className="flex gap-1 mb-6 bg-white border border-gray-100 shadow-sm rounded-xl p-1 w-fit">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === t ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t} {counts[t] > 0 && <span className={`ml-1 text-xs ${filter === t ? 'opacity-75' : 'text-gray-400'}`}>({counts[t]})</span>}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No {filter !== 'ALL' ? filter.toLowerCase() : ''} leave requests.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Period</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Reason</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((lv) => (
                <tr key={lv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-semibold text-gray-900">{lv.employeeFullName}</p>
                    <p className="text-xs text-gray-400">{lv.employeeEmail}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span>{lv.startDate}</span>
                    <span className="text-gray-400 mx-1">→</span>
                    <span>{lv.endDate}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                    <p className="line-clamp-2">{lv.reason}</p>
                  </td>
                  <td className="px-6 py-4">{statusBadge(lv.status)}</td>
                  <td className="px-6 py-4 text-right">
                    {lv.status === 'PENDING' && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(lv.id)}
                          disabled={acting === lv.id}
                          className="text-xs font-medium text-green-600 hover:text-green-800 transition-colors disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => handleReject(lv.id)}
                          disabled={acting === lv.id}
                          className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    {lv.reviewedBy && (
                      <p className="text-xs text-gray-400">by {lv.reviewedBy}</p>
                    )}
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
