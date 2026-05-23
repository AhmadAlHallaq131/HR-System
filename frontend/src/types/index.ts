export interface User {
  username: string
  fullName: string | null
  email: string
  role: string
  tenantId: string
  employeeId: number | null
  token: string
}

export interface Employee {
  id: number
  firstName: string
  lastName: string
  email: string
  jobTitle: string
  phone: string | null
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'
  departmentId: number | null
  departmentName: string | null
  userId: number | null
  userActive: boolean | null
  createdAt: string
  updatedAt: string
}

export interface EmployeeRequest {
  firstName: string
  lastName: string
  email: string
  jobTitle: string
  status: string
  departmentId: number | null
}

export interface CreateEmployeeUserRequest {
  fullName: string
  username: string
  email: string
  password: string
  jobTitle: string
  phone: string
  departmentId: number | null
}

export interface Department {
  id: number
  name: string
  description: string
  employeeCount?: number
}

export interface DepartmentRequest {
  name: string
  description: string
}

export interface LeaveResponse {
  id: number
  employeeId: number
  employeeFullName: string
  employeeEmail: string
  startDate: string
  endDate: string
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  reviewedBy: string | null
}

export interface LeaveRequestDto {
  startDate: string
  endDate: string
  reason: string
}

export interface AttendanceRecord {
  id: number
  employeeId: number
  employeeFullName: string | null
  departmentName: string | null
  date: string
  checkInTime: string | null
  checkOutTime: string | null
  status: 'CHECKED_IN' | 'CHECKED_OUT' | 'ABSENT'
  workMinutes: number | null
}

export interface Company {
  id: number
  name: string
  tenantId: string
  createdAt: string
  active: boolean
  employeeCount: number
  hrName: string | null
  hrEmail: string | null
  hrUsername: string | null
}

export interface CreateCompanyRequest {
  companyName: string
  hrFullName: string
  hrEmail: string
  hrUsername: string
  hrPassword: string
}

export interface TeamMember {
  employeeId: number
  firstName: string
  lastName: string
  jobTitle: string
  todayStatus: 'CHECKED_IN' | 'CHECKED_OUT' | 'ABSENT'
  checkInTime: string | null
  checkOutTime: string | null
}

export interface MyProfile {
  employeeId: number
  firstName: string
  lastName: string
  fullName: string
  email: string
  phone: string | null
  jobTitle: string
  status: string
  departmentId: number | null
  departmentName: string | null
  username: string
}
