export interface User {
  username: string
  email: string
  role: string
  tenantId: string
  token: string
}

export interface Employee {
  id: number
  firstName: string
  lastName: string
  email: string
  jobTitle: string
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE'
  departmentId: number | null
  departmentName: string | null
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

export interface LeaveRequest {
  id: number
  employee: {
    id: number
    firstName: string
    lastName: string
    email: string
  }
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

export interface DashboardStats {
  totalEmployees: number
  activeEmployees: number
  totalDepartments: number
  pendingLeaves: number
}
