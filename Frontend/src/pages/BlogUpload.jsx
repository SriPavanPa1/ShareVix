import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AdminLayout from '../components/Admin/AdminLayout'
import { blogAPI } from '../services/api'
import RichEditor from '../components/RichEditor'
import { Upload, X, Check, AlertCircle } from 'lucide-react'
import '../styles/BlogUpload.css'

const BlogUpload = () => {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    blogTitle: '',
    blogCategory: '',
    blogDescription: '',
    blogContent: '',
    featuredImage: null,
    tags: []
  })

  const [previewImage, setPreviewImage] = useState(null)
  const [currentTag, setCurrentTag] = useState('')
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

  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      blogContent: content
    }))
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size should be less than 10MB')
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        setPreviewImage(event.target.result)
        setFormData(prev => ({
          ...prev,
          featuredImage: file
        }))
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const handleAddTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }))
      setCurrentTag('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      if (!formData.blogTitle || !formData.blogDescription || !formData.blogContent) {
        setError('Please fill in all required fields')
        setLoading(false)
        return
      }

      if (formData.blogContent.replace(/<[^>]*>/g, '').trim().length < 50) {
        setError('Blog content should be at least 50 characters long')
        setLoading(false)
        return
      }

      // Build FormData for API call
      const apiFormData = new FormData()
      apiFormData.append('title', formData.blogTitle)
      apiFormData.append('content', formData.blogContent)
      apiFormData.append('description', formData.blogDescription)
      apiFormData.append('category', formData.blogCategory || '')
      apiFormData.append('tags', formData.tags.join(','))
      apiFormData.append('is_published', 'true')

      if (formData.featuredImage) {
        apiFormData.append('featured_image', formData.featuredImage)
      }

      await blogAPI.createWithMedia(apiFormData)

      setSuccess(true)
      setFormData({
        blogTitle: '',
        blogCategory: '',
        blogDescription: '',
        blogContent: '',
        featuredImage: null,
        tags: []
      })
      setPreviewImage(null)
      setCurrentTag('')

      setTimeout(() => {
        setSuccess(false)
        navigate('/admin/blog-management')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to create blog post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout pageTitle="Create Blog Post" pageSubtitle="Write and publish your articles">
      {success && (
        <div className="alert alert-success">
          <Check size={20} />
          <span>Blog post created successfully! Redirecting...</span>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="blog-form">
        <div className="form-section">
          <h2>Blog Information</h2>

          <div className="form-group">
            <label htmlFor="blogTitle">Blog Title *</label>
            <input
              type="text"
              id="blogTitle"
              name="blogTitle"
              value={formData.blogTitle}
              onChange={handleInputChange}
              placeholder="Enter a compelling blog title"
              disabled={loading}
              required
            />
            <p className="char-count">{formData.blogTitle.length}/100</p>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="blogCategory">Category</label>
              <select
                id="blogCategory"
                name="blogCategory"
                value={formData.blogCategory}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="">Select a category</option>
                <option value="Trading Tips">Trading Tips</option>
                <option value="Market Analysis">Market Analysis</option>
                <option value="Crypto News">Crypto News</option>
                <option value="Education">Education</option>
                <option value="Health & Fitness">Health & Fitness</option>
                <option value="Medical">Medical</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="blogDescription">Short Description *</label>
            <textarea
              id="blogDescription"
              name="blogDescription"
              value={formData.blogDescription}
              onChange={handleInputChange}
              placeholder="Write a brief description (will appear in blog list)"
              rows="3"
              disabled={loading}
              required
            ></textarea>
            <p className="char-count">{formData.blogDescription.length}/500</p>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <div className="tag-input-wrapper">
              <div className="tag-input-field">
                <input
                  type="text"
                  id="tags"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add tags (press Enter)"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="add-tag-btn"
                  disabled={loading || !currentTag.trim()}
                >
                  Add Tag
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="tags-display">
                  {formData.tags.map(tag => (
                    <span key={tag} className="tag-badge">
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="tag-remove"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Featured Image</h2>
          <div className="form-group">
            <label htmlFor="featuredImage">Upload Featured Image</label>
            <div className="file-upload-wrapper">
              <input
                type="file"
                id="featuredImage"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={loading}
              />
              <div className="upload-area" onClick={() => document.getElementById('featuredImage').click()}>
                {previewImage ? (
                  <>
                    <img src={previewImage} alt="Featured preview" className="image-preview" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPreviewImage(null)
                        setFormData(prev => ({ ...prev, featuredImage: null }))
                      }}
                      className="remove-btn"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <>
                    <Upload size={32} />
                    <p>Click to upload featured image</p>
                    <span>PNG, JPG, GIF up to 10MB</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2>Blog Content</h2>
          <div className="form-group">
            <label>Content * (Similar to Word Document)</label>
            <p className="helper-text">
              Use the toolbar below to format your text, add images, videos, and create a professional blog post.
            </p>
            <RichEditor
              content={formData.blogContent}
              onChange={handleContentChange}
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={loading}
            onClick={() => {
              setFormData({
                blogTitle: '',
                blogCategory: '',
                blogDescription: '',
                blogContent: '',
                featuredImage: null,
                tags: []
              })
              setPreviewImage(null)
              setCurrentTag('')
            }}
          >
            Clear Form
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Publishing...' : 'Publish Blog'}
          </button>
        </div>
      </form>
    </AdminLayout>
  )
}

export default BlogUpload
