import { useEffect, useState } from 'react'
import { Plus, Check, X, CalendarCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { getLeaves, getMyLeaves, approveLeave, rejectLeave, submitLeave } from '../api/leaves'
import { getEmployees } from '../api/employees'
import { LeaveRequest, LeaveRequestDto, Employee } from '../types'
import Header from '../components/Header'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import { useAuth } from '../contexts/AuthContext'

const emptyForm: LeaveRequestDto = { startDate: '', endDate: '', reason: '' }

export default function Leaves() {
  const { isHR, user } = useAuth()
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<LeaveRequestDto>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const load = async () => {
    try {
      const [l, e] = await Promise.all([
        isHR ? getLeaves() : getMyLeaves(),
        getEmployees().catch(() => []),
      ])
      setLeaves(l)
      setEmployees(e)
    } catch {
      toast.error('Failed to load leave requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [isHR])

  const myEmployee = employees.find((e) => e.email === user?.email)

  const handleSubmit = async () => {
    if (!myEmployee) {
      toast.error('No employee record found for your account')
      return
    }
    setSaving(true)
    try {
      await submitLeave(myEmployee.id, form)
      toast.success('Leave request submitted')
      setModalOpen(false)
      setForm(emptyForm)
      load()
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Failed to submit leave')
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async (id: number) => {
    setActionLoading(id)
    try {
      await approveLeave(id)
      toast.success('Leave approved')
      load()
    } catch {
      toast.error('Failed to approve leave')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id: number) => {
    setActionLoading(id)
    try {
      await rejectLeave(id)
      toast.success('Leave rejected')
      load()
    } catch {
      toast.error('Failed to reject leave')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <Header
        title={isHR ? 'Leave Requests' : 'My Leave Requests'}
        subtitle={isHR ? `${leaves.length} total requests` : 'Track your leave submissions'}
      />

      <div className="card">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex gap-2 text-xs font-medium text-gray-500">
            <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full">
              {leaves.filter((l) => l.status === 'PENDING').length} Pending
            </span>
            <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full">
              {leaves.filter((l) => l.status === 'APPROVED').length} Approved
            </span>
          </div>
          {!isHR && (
            <button onClick={() => { setForm(emptyForm); setModalOpen(true) }} className="btn-primary">
              <Plus className="w-4 h-4" /> Request Leave
            </button>
          )}
        </div>

        {/* Table */}
        {leaves.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <CalendarCheck className="w-10 h-10 mb-2" />
            <p className="text-sm">No leave requests</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {isHR && <th className="table-th">Employee</th>}
                  <th className="table-th">Start Date</th>
                  <th className="table-th">End Date</th>
                  <th className="table-th">Reason</th>
                  <th className="table-th">Status</th>
                  {isHR && <th className="table-th">Reviewed By</th>}
                  {isHR && <th className="table-th text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                    {isHR && (
                      <td className="table-td font-medium">
                        {l.employee.firstName} {l.employee.lastName}
                      </td>
                    )}
                    <td className="table-td">{l.startDate}</td>
                    <td className="table-td">{l.endDate}</td>
                    <td className="table-td text-gray-500 max-w-xs truncate">{l.reason || '—'}</td>
                    <td className="table-td"><Badge value={l.status} /></td>
                    {isHR && <td className="table-td text-gray-500">{l.reviewedBy || '—'}</td>}
                    {isHR && (
                      <td className="table-td">
                        {l.status === 'PENDING' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(l.id)}
                              disabled={actionLoading === l.id}
                              className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(l.id)}
                              disabled={actionLoading === l.id}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Submit leave modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Request Leave" size="sm">
        <div className="space-y-4">
          <div>
            <label className="label">Start Date</label>
            <input className="input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </div>
          <div>
            <label className="label">End Date</label>
            <input className="input" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <div>
            <label className="label">Reason <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Describe the reason for your leave…"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSubmit} disabled={saving || !form.startDate || !form.endDate} className="btn-primary">
              {saving ? 'Submitting…' : 'Submit Request'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
