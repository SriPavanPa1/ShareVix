import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Courses from './pages/Courses'
import Blog from './pages/Blog'
import Contact from './pages/Contact'
import Login from './pages/Login'
import CourseUpload from './pages/CourseUpload'
import BlogUpload from './pages/BlogUpload'
import BlogManagement from './pages/BlogManagement'
import CourseManagement from './pages/CourseManagement'

function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/course-upload" element={<CourseUpload />} />
            <Route path="/admin/blog-upload" element={<BlogUpload />} />
            <Route path="/admin/blog-management" element={<BlogManagement />} />
            <Route path="/admin/course-management" element={<CourseManagement />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}

export default App
