import React, { useContext, useState, useEffect } from 'react'
import Login from './component/Auth/login'
import EmployeeDashboard from './component/Auth/Dashboard/EmployeeDashboard'
import AdminDasboard from './component/Auth/Dashboard/AdminDasboard'
import { AuthContext } from './context/authContext'

const App = () => {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useContext(AuthContext)

  // Hydrate user session from localStorage on startup
  useEffect(() => {
    const loggedInUser = localStorage.getItem('loggedInUser')
    if (loggedInUser) {
      setUser(JSON.parse(loggedInUser))
    }
  }, [])

  // Sync user object if userData updates in context (e.g. employee tasks update)
  useEffect(() => {
    if (user && user.role === 'employee' && userData?.employees) {
      const refreshedEmployee = userData.employees.find(emp => emp.id === user.data.id)
      if (refreshedEmployee) {
        const updatedUser = { ...user, data: refreshedEmployee }
        setUser(updatedUser)
        localStorage.setItem('loggedInUser', JSON.stringify(updatedUser))
      }
    }
  }, [userData])

  const handleLogin = (email, password) => {
    // 1. Admin Auth
    if (email === 'admin@me.com' && password === '123') {
      const adminSession = { role: 'admin' }
      setUser(adminSession)
      localStorage.setItem('loggedInUser', JSON.stringify(adminSession))
      return
    }

    // 2. Employee Auth
    if (userData && userData.employees) {
      const employee = userData.employees.find(
        (emp) => emp.email === email && emp.password === password
      )
      if (employee) {
        const employeeSession = { role: 'employee', data: employee }
        setUser(employeeSession)
        localStorage.setItem('loggedInUser', JSON.stringify(employeeSession))
        return
      }
    }

    alert("Invalid credentials. Use employee1@me.com / 123 or admin@me.com / 123")
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('loggedInUser')
  }

  const changeTaskStatus = (taskIndex, action) => {
    if (!user || user.role !== 'employee') return

    const employeeId = user.data.id

    // Update target employee tasks
    const updatedEmployees = userData.employees.map((emp) => {
      if (emp.id === employeeId) {
        const updatedTasks = emp.tasks.map((task, idx) => {
          if (idx === taskIndex) {
            let active = task.active
            let newTask = task.newTask
            let completed = task.completed
            let failed = task.failed

            if (action === 'accept') {
              active = true
              newTask = false
            } else if (action === 'complete') {
              active = false
              completed = true
            } else if (action === 'failed') {
              active = false
              failed = true
            }

            return {
              ...task,
              active,
              newTask,
              completed,
              failed
            }
          }
          return task
        })

        // Re-calculate task counts dynamically
        const counts = { active: 0, newTask: 0, completed: 0, failed: 0 }
        updatedTasks.forEach(t => {
          if (t.active) counts.active++
          if (t.newTask) counts.newTask++
          if (t.completed) counts.completed++
          if (t.failed) counts.failed++
        })

        return {
          ...emp,
          tasks: updatedTasks,
          taskCount: counts
        }
      }
      return emp
    })

    // Set updated data in Context and persist in LocalStorage
    const updatedData = { ...userData, employees: updatedEmployees }
    setUserData(updatedData)
    localStorage.setItem('employees', JSON.stringify(updatedEmployees))
  }

  return (
    <>
      {!user && <Login handleLogin={handleLogin} />}
      {user && user.role === 'admin' && (
        <AdminDasboard logoutHandler={handleLogout} />
      )}
      {user && user.role === 'employee' && (
        <EmployeeDashboard
          data={user.data}
          changeTaskStatus={changeTaskStatus}
          logoutHandler={handleLogout}
        />
      )}
    </>
  )
}

export default App
