import { useEffect, useState } from 'react'
import { Plus, Search, UserCheck, UserX, ShieldOff, ShieldCheck, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { getEmployees } from '../../api/employees'
import { getDepartments } from '../../api/departments'
import { createEmployeeUser, deactivateUser, activateUser } from '../../api/users'
import { Employee, Department, CreateEmployeeUserRequest } from '../../types'
import Modal from '../../components/Modal'

const emptyForm: CreateEmployeeUserRequest = {
  fullName: '', username: '', email: '', password: '', jobTitle: '', phone: '', departmentId: null,
}

type Filter = 'ALL' | 'ACTIVE' | 'INACTIVE'

function Avatar({ name }: { name: string }) {
  const parts = name.trim().split(' ')
  const initials = parts.length >= 2
    ? parts[0][0] + parts[parts.length - 1][0]
    : name.slice(0, 2)
  const colors = [
    'bg-blue-100 text-blue-700', 'bg-violet-100 text-violet-700',
    'bg-green-100 text-green-700', 'bg-amber-100 text-amber-700',
    'bg-pink-100 text-pink-700', 'bg-cyan-100 text-cyan-700',
  ]
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${color}`}>
      {initials.toUpperCase()}
    </div>
  )
}

export default function HrEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('ALL')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<CreateEmployeeUserRequest>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [showPw, setShowPw] = useState(false)

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
      toast.success('Employee account created')
      setModalOpen(false)
      setForm(emptyForm)
      load()
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Failed to create employee')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (emp: Employee) => {
    if (!emp.userId) return
    setActionLoading(emp.id)
    try {
      if (emp.userActive) {
        await deactivateUser(emp.userId)
        toast.success(`${emp.firstName} deactivated`)
      } else {
        await activateUser(emp.userId)
        toast.success(`${emp.firstName} activated`)
      }
      load()
    } catch {
      toast.error('Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  const f = (field: keyof CreateEmployeeUserRequest) => ({
    value: form[field] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [field]: e.target.value }),
  })

  const filtered = employees.filter(e => {
    const matchSearch = `${e.firstName} ${e.lastName} ${e.email} ${e.jobTitle}`
      .toLowerCase().includes(search.toLowerCase())
    if (!matchSearch) return false
    if (filter === 'ACTIVE') return e.userId !== null && e.userActive === true
    if (filter === 'INACTIVE') return e.userId !== null && e.userActive === false
    return true
  })

  const stats = {
    total: employees.length,
    active: employees.filter(e => e.userId && e.userActive).length,
    inactive: employees.filter(e => e.userId && !e.userActive).length,
    noAccount: employees.filter(e => !e.userId).length,
  }

  const filterTabs: { key: Filter; label: string; count: number }[] = [
    { key: 'ALL', label: 'All', count: stats.total },
    { key: 'ACTIVE', label: 'Active', count: stats.active },
    { key: 'INACTIVE', label: 'Inactive', count: stats.inactive },
  ]

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage your team members and their accounts</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setShowPw(false); setModalOpen(true) }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, color: 'bg-blue-50 text-blue-700 border-blue-100' },
          { label: 'Active Accounts', value: stats.active, color: 'bg-green-50 text-green-700 border-green-100' },
          { label: 'Inactive Accounts', value: stats.inactive, color: 'bg-red-50 text-red-600 border-red-100' },
          { label: 'No Account', value: stats.noAccount, color: 'bg-gray-50 text-gray-600 border-gray-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border px-4 py-3 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-0.5 opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or job title…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                filter === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                filter === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-14 text-center">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <p className="font-medium text-gray-700">No employees found</p>
          <p className="text-sm text-gray-400 mt-1">Try a different search or filter</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Employee</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Job Title</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Department</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Account</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(emp => (
                <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                  {/* Employee */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={`${emp.firstName} ${emp.lastName}`} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {emp.firstName} {emp.lastName}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">{emp.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Job Title */}
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className="text-sm text-gray-700">{emp.jobTitle || '—'}</span>
                  </td>

                  {/* Department */}
                  <td className="px-5 py-4 hidden md:table-cell">
                    {emp.departmentName ? (
                      <span className="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                        {emp.departmentName}
                      </span>
                    ) : (
                      <span className="text-gray-300 text-sm">—</span>
                    )}
                  </td>

                  {/* Account status */}
                  <td className="px-5 py-4">
                    {emp.userId === null ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
                        <UserX className="w-3.5 h-3.5" />
                        No account
                      </span>
                    ) : emp.userActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100">
                        <UserCheck className="w-3.5 h-3.5" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full border border-red-100">
                        <ShieldOff className="w-3.5 h-3.5" />
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4 text-right">
                    {emp.userId !== null && (
                      <button
                        onClick={() => handleToggleActive(emp)}
                        disabled={actionLoading === emp.id}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-50 ${
                          emp.userActive
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-green-200 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {actionLoading === emp.id ? (
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        ) : emp.userActive ? (
                          <><ShieldOff className="w-3 h-3" /> Deactivate</>
                        ) : (
                          <><ShieldCheck className="w-3 h-3" /> Activate</>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/40 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Showing <span className="font-medium text-gray-600">{filtered.length}</span> of{' '}
              <span className="font-medium text-gray-600">{employees.length}</span> employees
            </p>
            {filtered.length > 10 && (
              <button className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                Show more <ChevronDown className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Create Employee Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Employee Account" size="md">
        <div className="space-y-5">

          {/* Personal Info */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Personal Info</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ahmad Al-Hallaq"
                  {...f('fullName')}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                  <input
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 555 0100"
                    {...f('phone')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Software Engineer"
                    {...f('jobTitle')}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                <select
                  value={form.departmentId ?? ''}
                  onChange={e => setForm({ ...form, departmentId: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">No department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-200" />

          {/* Credentials */}
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Login Credentials</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ahmad@company.com"
                  {...f('email')}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ahmad_h"
                    {...f('username')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      className="w-full px-3.5 py-2.5 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="••••••••"
                      {...f('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(s => !s)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <span className="text-xs">{showPw ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm disabled:opacity-60 transition-colors"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating…
                </span>
              ) : 'Create Employee'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
