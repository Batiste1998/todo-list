import { useState, useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_URL

export default function Dashboard() {
  const { token, user, logout } = useAuth()
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    status: "pending",
  })
  const [editingTask, setEditingTask] = useState(null)
  const [allTasks, setAllTasks] = useState({})

  useEffect(() => {
    if (user.role === "admin") {
      fetchAllTasks()
    } else {
      fetchTasks()
    }
  }, [user.role])

  const fetchAllTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const tasksByUser = response.data.data.tasks.reduce((acc, task) => {
        const userId = task.created_by._id
        if (!acc[userId]) {
          acc[userId] = {
            email: task.created_by.email,
            tasks: [],
          }
        }
        acc[userId].tasks.push(task)
        return acc
      }, {})
      setAllTasks(tasksByUser)
    } catch (error) {
      console.error("Error fetching all tasks:", error)
    }
  }

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setTasks(response.data.data.tasks)
    } catch (error) {
      console.error("Error fetching tasks:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE_URL}/tasks`, newTask, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setNewTask({ title: "", description: "", status: "pending" })
      if (user.role === "admin") {
        fetchAllTasks()
      } else {
        fetchTasks()
      }
    } catch (error) {
      console.error("Error creating task:", error)
    }
  }

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (user.role === "admin") {
        fetchAllTasks()
      } else {
        fetchTasks()
      }
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  const startEditing = (task) => {
    setEditingTask({
      id: task._id,
      title: task.title,
      description: task.description,
      status: task.status,
    })
  }

  const updateTask = async (e) => {
    e.preventDefault()
    try {
      await axios.patch(
        `${API_BASE_URL}/tasks/${editingTask.id}`,
        {
          title: editingTask.title,
          description: editingTask.description,
          status: editingTask.status,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setEditingTask(null)
      if (user.role === "admin") {
        fetchAllTasks()
      } else {
        fetchTasks()
      }
    } catch (error) {
      console.error("Error updating task:", error)
    }
  }

  const renderTaskItem = (task) => (
    <div key={task._id} className="p-4 hover:bg-gray-50">
      {editingTask?.id === task._id ? (
        <form onSubmit={updateTask} className="space-y-4">
          <input
            type="text"
            value={editingTask.title}
            onChange={(e) =>
              setEditingTask({ ...editingTask, title: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <textarea
            value={editingTask.description}
            onChange={(e) =>
              setEditingTask({ ...editingTask, description: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows="3"
          />
          <select
            value={editingTask.status}
            onChange={(e) =>
              setEditingTask({ ...editingTask, status: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditingTask(null)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">{task.title}</h3>
            <p className="mt-1 text-sm text-gray-600">{task.description}</p>
            <div className="mt-2 flex items-center text-sm text-gray-500">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
               ${
                 task.status === "completed"
                   ? "bg-green-100 text-green-800"
                   : task.status === "in-progress"
                   ? "bg-yellow-100 text-yellow-800"
                   : "bg-gray-100 text-gray-800"
               }`}
              >
                {task.status}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => startEditing(task)}
              className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
            >
              Edit
            </button>
            {(user.role === "admin" || task.created_by._id === user._id) && (
              <button
                onClick={() => deleteTask(task._id)}
                className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-md hover:bg-red-100"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <h1 className="flex items-center font-semibold text-xl">
              Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">{user.email}</span>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Add New Task</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              <textarea
                placeholder="Description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows="3"
              />
              <select
                value={newTask.status}
                onChange={(e) =>
                  setNewTask({ ...newTask, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Add Task
              </button>
            </form>
          </div>
        </div>

        {user.role === "admin" ? (
          Object.entries(allTasks).map(([userId, userData]) => (
            <div
              key={userId}
              className="bg-white shadow rounded-lg overflow-hidden mb-6"
            >
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                <h3 className="text-sm font-medium text-gray-900">
                  Tasks by {userData.email}
                </h3>
              </div>
              <div className="divide-y divide-gray-200">
                {userData.tasks.map((task) => renderTaskItem(task))}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
              {tasks.map((task) => renderTaskItem(task))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
