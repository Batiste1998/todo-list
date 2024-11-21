import { createContext, useContext, useState } from "react"
import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")))

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      })

      const { token, data } = response.data
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(data.user))
      setToken(token)
      setUser(data.user)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      }
    }
  }

  const register = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        password,
      })

      const { token, data } = response.data
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(data.user))
      setToken(token)
      setUser(data.user)
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      }
    }
  }

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, null, {
        headers: { Authorization: `Bearer ${token}` },
      })
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      setToken(null)
      setUser(null)
      navigate("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
