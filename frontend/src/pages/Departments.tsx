import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '../api/departments'
import { getEmployees } from '../api/employees'
import { Department, DepartmentRequest, Employee } from '../types'
import Header from '../components/Header'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { useAuth } from '../contexts/AuthContext'

const emptyForm: DepartmentRequest = { name: '', description: '' }

export default function Departments() {
  const { isHR, isAdmin } = useAuth()
  const [departments, setDepartments] = useState<Department[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Department | null>(null)
  const [form, setForm] = useState<DepartmentRequest>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    try {
      const [d, e] = await Promise.all([getDepartments(), getEmployees()])
      setDepartments(d)
      setEmployees(e)
    } catch {
      toast.error('Failed to load departments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const countEmployees = (deptId: number) =>
    employees.filter((e) => e.departmentId === deptId).length

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (d: Department) => {
    setEditing(d)
    setForm({ name: d.name, description: d.description ?? '' })
    setModalOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing) {
        await updateDepartment(editing.id, form)
        toast.success('Department updated')
      } else {
        await createDepartment(form)
        toast.success('Department created')
      }
      setModalOpen(false)
      load()
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Failed to save department')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteDepartment(deleteTarget.id)
      toast.success('Department deleted')
      setDeleteTarget(null)
      load()
    } catch {
      toast.error('Failed to delete department')
    } finally {
      setDeleting(false)
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
      <Header title="Departments" subtitle={`${departments.length} departments`} />

      <div className="card">
        {/* Toolbar */}
        {isHR && (
          <div className="flex justify-end px-6 py-4 border-b border-gray-200">
            <button onClick={openCreate} className="btn-primary">
              <Plus className="w-4 h-4" /> Add Department
            </button>
          </div>
        )}

        {/* Table */}
        {departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Building2 className="w-10 h-10 mb-2" />
            <p className="text-sm">No departments yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="table-th">Department</th>
                  <th className="table-th">Description</th>
                  <th className="table-th">Employees</th>
                  {isHR && <th className="table-th text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                          <Building2 className="w-4 h-4 text-violet-600" />
                        </div>
                        {dept.name}
                      </div>
                    </td>
                    <td className="table-td text-gray-500">{dept.description || '—'}</td>
                    <td className="table-td">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                        {countEmployees(dept.id)} employees
                      </span>
                    </td>
                    {isHR && (
                      <td className="table-td">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(dept)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => setDeleteTarget(dept)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Department' : 'Add Department'}>
        <div className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="input resize-none"
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Department"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
      />
    </div>
  )
}
