import { useEffect, useState } from 'react'
import { MapPin, Mail, Phone, Briefcase, Clock, CheckCircle2, XCircle, LogIn, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import { getMyProfile, getMyTeam } from '../../api/me'
import { checkIn, checkOut, getTodayAttendance } from '../../api/attendance'
import { MyProfile, TeamMember, AttendanceRecord } from '../../types'

function fmtTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'CHECKED_IN') return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full"><CheckCircle2 className="w-3 h-3" />Present</span>
  if (status === 'CHECKED_OUT') return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"><CheckCircle2 className="w-3 h-3" />Done</span>
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full"><XCircle className="w-3 h-3" />Absent</span>
}

export default function EmployeeHome() {
  const [profile, setProfile] = useState<MyProfile | null>(null)
  const [team, setTeam] = useState<TeamMember[]>([])
  const [today, setToday] = useState<AttendanceRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [actioning, setActioning] = useState(false)

  const loadAll = async () => {
    try {
      const [p, t, att] = await Promise.all([getMyProfile(), getMyTeam(), getTodayAttendance()])
      setProfile(p)
      setTeam(t)
      setToday(att)
    } catch {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAll() }, [])

  const handleCheckIn = async () => {
    setActioning(true)
    try {
      const record = await checkIn()
      setToday(record)
      toast.success('Checked in successfully!')
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Failed to check in')
    } finally {
      setActioning(false)
    }
  }

  const handleCheckOut = async () => {
    setActioning(true)
    try {
      const record = await checkOut()
      setToday(record)
      toast.success('Checked out! Have a great day.')
    } catch (e: any) {
      toast.error(e.response?.data?.message ?? 'Failed to check out')
    } finally {
      setActioning(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const canCheckIn = !today || (!today.checkInTime)
  const canCheckOut = today?.checkInTime && !today.checkOutTime

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column */}
      <div className="lg:col-span-1 space-y-5">
        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex flex-col items-center text-center mb-5">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 text-xl font-bold mb-3">
              {profile?.firstName?.[0]}{profile?.lastName?.[0]}
            </div>
            <h2 className="text-lg font-bold text-gray-900">{profile?.fullName}</h2>
            <p className="text-sm text-gray-500">{profile?.jobTitle}</p>
            {profile?.departmentName && (
              <span className="mt-2 inline-block px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                {profile.departmentName}
              </span>
            )}
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5 text-sm text-gray-600">
              <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{profile?.email}</span>
            </div>
            {profile?.phone && (
              <div className="flex items-center gap-2.5 text-sm text-gray-600">
                <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span>{profile.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5 text-sm text-gray-600">
              <Briefcase className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span>{profile?.username}</span>
            </div>
          </div>
        </div>

        {/* Check-in widget */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" /> Today's Attendance
          </h3>

          {today && (
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Check In</span>
                <span className="font-mono font-medium">{fmtTime(today.checkInTime)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Check Out</span>
                <span className="font-mono font-medium">{fmtTime(today.checkOutTime)}</span>
              </div>
              {today.workMinutes != null && (
                <div className="flex justify-between text-gray-600">
                  <span>Hours worked</span>
                  <span className="font-medium text-emerald-600">{Math.floor(today.workMinutes / 60)}h {today.workMinutes % 60}m</span>
                </div>
              )}
            </div>
          )}

          {canCheckIn && (
            <button
              onClick={handleCheckIn}
              disabled={actioning}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              {actioning ? 'Checking in...' : 'Check In'}
            </button>
          )}

          {canCheckOut && (
            <button
              onClick={handleCheckOut}
              disabled={actioning}
              className="w-full flex items-center justify-center gap-2 py-3 bg-slate-700 text-white font-semibold rounded-xl hover:bg-slate-800 disabled:opacity-60 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {actioning ? 'Checking out...' : 'Check Out'}
            </button>
          )}

          {today?.checkOutTime && (
            <div className="flex items-center justify-center gap-2 py-3 text-emerald-600 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" /> Done for today!
            </div>
          )}
        </div>
      </div>

      {/* Right column — team */}
      <div className="lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">My Team</h2>
          <span className="text-sm text-gray-400">{team.length} members</span>
        </div>
        {team.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No teammates in your department yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {team.map((member) => (
              <div key={member.employeeId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 text-sm font-semibold flex-shrink-0">
                    {member.firstName[0]}{member.lastName[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{member.firstName} {member.lastName}</p>
                    <p className="text-xs text-gray-400 truncate">{member.jobTitle}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <StatusBadge status={member.todayStatus} />
                  {member.checkInTime && (
                    <span className="text-xs text-gray-400 font-mono">{fmtTime(member.checkInTime)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
