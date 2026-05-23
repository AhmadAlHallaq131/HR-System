import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import AdminLayout from './layouts/AdminLayout'
import HrLayout from './layouts/HrLayout'
import EmployeeLayout from './layouts/EmployeeLayout'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminCompanies from './pages/admin/Companies'

// HR pages
import HrDashboard from './pages/hr/Dashboard'
import HrEmployees from './pages/hr/Employees'
import HrDepartments from './pages/hr/Departments'
import HrAttendance from './pages/hr/Attendance'
import HrLeaves from './pages/hr/Leaves'

// Employee pages
import EmployeeHome from './pages/employee/Home'
import EmployeeAttendance from './pages/employee/MyAttendance'
import EmployeeLeaves from './pages/employee/MyLeaves'

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function AppRoutes() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <Spinner />

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Route to the correct app based on role
  if (user.role === 'SUPER_ADMIN') {
    return (
      <Routes>
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/companies" element={<AdminCompanies />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Routes>
    )
  }

  if (user.role === 'HR_MANAGER') {
    return (
      <Routes>
        <Route element={<HrLayout />}>
          <Route path="/hr/dashboard" element={<HrDashboard />} />
          <Route path="/hr/employees" element={<HrEmployees />} />
          <Route path="/hr/departments" element={<HrDepartments />} />
          <Route path="/hr/attendance" element={<HrAttendance />} />
          <Route path="/hr/leaves" element={<HrLeaves />} />
          <Route path="*" element={<Navigate to="/hr/dashboard" replace />} />
        </Route>
      </Routes>
    )
  }

  if (user.role === 'EMPLOYEE') {
    return (
      <Routes>
        <Route element={<EmployeeLayout />}>
          <Route path="/employee/home" element={<EmployeeHome />} />
          <Route path="/employee/attendance" element={<EmployeeAttendance />} />
          <Route path="/employee/leaves" element={<EmployeeLeaves />} />
          <Route path="*" element={<Navigate to="/employee/home" replace />} />
        </Route>
      </Routes>
    )
  }

  // Unknown role — log out
  return <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
