import { useEffect, useState } from 'react'
import { Plus, Users, UserCheck, UserX, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { getEmployees } from '../../api/employees'
import { getDepartments } from '../../api/departments'
import { createEmployeeUser, deactivateUser } from '../../api/users'
import { Employee, Department, CreateEmployeeUserRequest } from '../../types'
import Modal from '../../components/Modal'

const emptyForm: CreateEmployeeUserRequest = {
  fullName: '', username: '', email: '', password: '', jobTitle: '', phone: '', departmentId: null,
}

export default function HrEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<CreateEmployeeUserRequest>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deactivating, setDeactivating] = useState<number | null>(null)

  const load = async () => {
    try {
      const [emps, depts] = await Promise.all([getEmployees(), getDepartments()])
      setEmployees(emps)
      setDepartments(depts)
    } catch {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!form.fullName || !form.username || !form.email || !form.password || !form.jobTitle) {
      toast.error('Please fill in all required fields')
      return
    }
    setSaving(true)
    try {
      await createEmployeeUser(form)
      toast.success('Employee account created successfully')
      setModalOpen(false)
      setForm(emptyForm)
      load()
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Failed to create employee')
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (emp: Employee) => {
    if (!emp.userId) {
      toast.error('No linked account to deactivate')
      return
    }
    setDeactivating(emp.id)
    try {
      await deactivateUser(emp.userId)
      toast.success('Account deactivated')
      load()
    } catch {
      toast.error('Failed to deactivate account')
    } finally {
      setDeactivating(null)
    }
  }

  const f = (field: keyof CreateEmployeeUserRequest) => ({
    value: form[field] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [field]: e.target.value }),
  })

  const filtered = employees.filter(e =>
    `${e.firstName} ${e.lastName} ${e.email} ${e.jobTitle}`.toLowerCase().includes(search.toLowerCase())
  )

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-50 text-green-700',
    INACTIVE: 'bg-red-50 text-red-600',
    ON_LEAVE: 'bg-yellow-50 text-yellow-700',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-500 text-sm mt-1">{employees.length} employees in your company</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setModalOpen(true) }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search employees..."
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No employees found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Job Title</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Department</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Account</th>
                <th className="px-6 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-sm font-semibold">
                        {emp.firstName[0]}{emp.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-gray-400">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">{emp.jobTitle}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{emp.departmentName ?? '—'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[emp.status]}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {emp.userId ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                        <UserCheck className="w-3.5 h-3.5" /> Linked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-400 font-medium">
                        <UserX className="w-3.5 h-3.5" /> No account
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {emp.userId && (
                      <button
                        onClick={() => handleDeactivate(emp)}
                        disabled={deactivating === emp.id}
                        className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
                      >
                        {deactivating === emp.id ? '...' : 'Deactivate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Employee Account" size="md">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Personal Info</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ahmad Al-Hallaq" {...f('fullName')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+1 555 0100" {...f('phone')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title <span className="text-red-500">*</span></label>
                  <input className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Software Engineer" {...f('jobTitle')} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select
                  value={form.departmentId ?? ''}
                  onChange={e => setForm({ ...form, departmentId: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Login Credentials</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                <input type="email" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ahmad@company.com" {...f('email')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username <span className="text-red-500">*</span></label>
                  <input className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="ahmad_h" {...f('username')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                  <input type="password" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" {...f('password')} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
            <button onClick={handleCreate} disabled={saving} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors">
              {saving ? 'Creating...' : 'Create Employee'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
