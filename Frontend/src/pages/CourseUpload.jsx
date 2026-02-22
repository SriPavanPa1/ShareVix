import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AdminLayout from '../components/Admin/AdminLayout'
import { courseAPI } from '../services/api'
import { Upload, X, Check, AlertCircle } from 'lucide-react'
import RichEditor from '../components/RichEditor'
import '../styles/CourseUpload.css'

const CourseUpload = () => {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    courseName: '',
    courseDescription: '',
    instructor: '',
    category: '',
    level: 'Beginner',
    price: '',
    duration: '',
    courseImage: null,
    courseVideo: null,
    courseMaterials: []
  })

  // Add state for RichEditor content since we'll use it instead of textarea value
  const [richContent, setRichContent] = useState('')

  const [previewImage, setPreviewImage] = useState(null)
  const [previewVideo, setPreviewVideo] = useState(null)
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB')
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreviewImage(event.target.result)
        setFormData(prev => ({
          ...prev,
          courseImage: file
        }))
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const handleVideoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 500 * 1024 * 1024) {
        setError('Video size should be less than 500MB')
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreviewVideo(event.target.result)
        setFormData(prev => ({
          ...prev,
          courseVideo: file
        }))
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const handleMaterialsUpload = (e) => {
    const files = Array.from(e.target.files)
    const newMaterials = files.map((file, index) => ({
      id: Date.now() + index,
      name: file.name,
      size: file.size,
      file: file
    }))
    setMaterials([...materials, ...newMaterials])
    setFormData(prev => ({
      ...prev,
      courseMaterials: [...materials, ...newMaterials]
    }))
  }

  const removeMaterial = (id) => {
    const updated = materials.filter(m => m.id !== id)
    setMaterials(updated)
    setFormData(prev => ({
      ...prev,
      courseMaterials: updated
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      if (!formData.courseName || !richContent || !formData.instructor) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      // Build FormData for API call
      const apiFormData = new FormData()
      apiFormData.append('title', formData.courseName)
      apiFormData.append('description', richContent)
      apiFormData.append('instructor_name', formData.instructor)
      apiFormData.append('category', formData.category || '')
      apiFormData.append('level', formData.level || 'Beginner')
      apiFormData.append('price', formData.price || '0')
      apiFormData.append('duration', formData.duration ? `${formData.duration} hours` : '')

      // Add files
      if (formData.courseImage) {
        apiFormData.append('files', formData.courseImage)
      }
      if (formData.courseVideo) {
        apiFormData.append('files', formData.courseVideo)
      }
      materials.forEach(m => {
        apiFormData.append('files', m.file)
      })

      await courseAPI.createWithMedia(apiFormData)

      setSuccess(true)
      setFormData({
        courseName: '',
        courseDescription: '',
        instructor: '',
        category: '',
        level: 'Beginner',
        price: '',
        duration: '',
        courseImage: null,
        courseVideo: null,
        courseMaterials: []
      })
      setPreviewImage(null)
      setPreviewVideo(null)
      setMaterials([])
      setRichContent('')

      setTimeout(() => {
        setSuccess(false)
        navigate('/admin/course-management')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to upload course')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout pageTitle="Upload Course" pageSubtitle="Create and manage your courses">
      {success && (
        <div className="alert alert-success">
          <Check size={20} />
          <span>Course uploaded successfully! Redirecting...</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="course-form">
        <div className="form-section">
          <h2>Basic Information</h2>

          <div className="form-group">
            <label htmlFor="courseName">Course Name *</label>
            <input
              type="text"
              id="courseName"
              name="courseName"
              value={formData.courseName}
              onChange={handleInputChange}
              placeholder="Enter course name"
              disabled={loading}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="instructor">Instructor Name *</label>
              <input
                type="text"
                id="instructor"
                name="instructor"
                value={formData.instructor}
                onChange={handleInputChange}
                placeholder="Enter instructor name"
                disabled={loading}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="">Select a category</option>
                <option value="Trading">Trading</option>
                <option value="Investing">Investing</option>
                <option value="Cryptocurrency">Cryptocurrency</option>
                <option value="Market Fundamentals">Market Fundamentals</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="level">Level</label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="duration">Duration (hours)</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="e.g., 40"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="price">Price (₹)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="e.g., 4999"
                disabled={loading}
                step="0.01"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="courseDescription">Course Description *</label>
            <RichEditor
              content={richContent}
              onChange={setRichContent}
              ownerType="course"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Course Media</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="courseImage">Course Image</label>
              <div className="file-upload-wrapper">
                <input
                  type="file"
                  id="courseImage"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={loading}
                />
                <div className="upload-area" onClick={() => document.getElementById('courseImage').click()}>
                  {previewImage ? (
                    <>
                      <img src={previewImage} alt="Course preview" className="image-preview" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setPreviewImage(null)
                          setFormData(prev => ({ ...prev, courseImage: null }))
                        }}
                        className="remove-btn"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload size={32} />
                      <p>Click to upload course image</p>
                      <span>PNG, JPG, GIF up to 5MB</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="courseVideo">Course Preview Video</label>
              <div className="file-upload-wrapper">
                <input
                  type="file"
                  id="courseVideo"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  disabled={loading}
                />
                <div className="upload-area" onClick={() => document.getElementById('courseVideo').click()}>
                  {previewVideo ? (
                    <>
                      <video width="100%" height="auto" controls className="video-preview">
                        <source src={previewVideo} />
                      </video>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setPreviewVideo(null)
                          setFormData(prev => ({ ...prev, courseVideo: null }))
                        }}
                        className="remove-btn"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload size={32} />
                      <p>Click to upload preview video</p>
                      <span>MP4, WebM up to 500MB</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Course Materials</h2>
          <div className="form-group">
            <label htmlFor="materials">Upload Course Materials (PDFs, Documents, etc.)</label>
            <div className="file-upload-wrapper">
              <input
                type="file"
                id="materials"
                multiple
                onChange={handleMaterialsUpload}
                disabled={loading}
              />
              <div className="upload-area" onClick={() => document.getElementById('materials').click()}>
                <Upload size={32} />
                <p>Click to upload materials</p>
                <span>PDF, DOC, DOCX, etc.</span>
              </div>
            </div>
          </div>

          {materials.length > 0 && (
            <div className="materials-list">
              <h3>Uploaded Materials ({materials.length})</h3>
              <div className="materials-grid">
                {materials.map(material => (
                  <div key={material.id} className="material-item">
                    <div className="material-info">
                      <p className="material-name">{material.name}</p>
                      <p className="material-size">{(material.size / 1024).toFixed(2)} KB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMaterial(material.id)}
                      className="remove-btn"
                      style={{ position: 'static' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={loading}
            onClick={() => {
              setFormData({
                courseName: '',
                courseDescription: '',
                instructor: '',
                category: '',
                level: 'Beginner',
                price: '',
                duration: '',
                courseImage: null,
                courseVideo: null,
                courseMaterials: []
              })
              setPreviewImage(null)
              setPreviewVideo(null)
              setMaterials([])
            }}
          >
            Clear Form
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Course'}
          </button>
        </div>
      </form>
    </AdminLayout>
  )
}

export default CourseUpload
