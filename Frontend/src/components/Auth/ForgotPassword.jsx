import React, { useState } from 'react'
import { Mail, Loader, ArrowLeft, CheckCircle } from 'lucide-react'
import '../../styles/Auth.css'

function ForgotPassword({ onSwitchToLogin }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) => {
    setEmail(e.target.value)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!email.includes('@')) {
        setError('Please enter a valid email address')
        setLoading(false)
        return
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Mock response
      const response = {
        success: true,
        message: 'Password reset link sent to your email'
      }

      setSubmitted(true)
      setEmail('')

      // Auto redirect after 5 seconds
      setTimeout(() => {
        onSwitchToLogin()
      }, 5000)
    } catch (err) {
      setError(err.message || 'Failed to send reset link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="auth-container">
        <div className="auth-card auth-card-success">
          <div className="success-icon">
            <CheckCircle size={64} />
          </div>
          <div className="auth-header">
            <h1>Check Your Email</h1>
            <p>We've sent a password reset link to your email address</p>
          </div>

          <div className="reset-info">
            <p>Click the link in the email to reset your password. The link will expire in 24 hours.</p>
            <p className="email-display">Email sent to: <strong>{email || 'your email'}</strong></p>
          </div>

          <button
            type="button"
            className="submit-button"
            onClick={onSwitchToLogin}
          >
            Back to Login
          </button>

          <div className="auth-footer">
            <p>Didn't receive the email?</p>
            <button
              type="button"
              className="switch-button"
              onClick={() => setSubmitted(false)}
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Reset Password</h1>
          <p>Enter your email to receive a password reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} />
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleChange}
                placeholder="Enter your registered email"
                disabled={loading}
              />
            </div>
          </div>

          <p className="info-text">
            We'll send you a link to reset your password via email.
          </p>

          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader size={18} className="spinner" />
                Sending...
              </>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <button
            type="button"
            className="back-button"
            onClick={onSwitchToLogin}
            disabled={loading}
          >
            <ArrowLeft size={18} />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
