import React, { useState } from 'react'
import LoginComponent from '../components/Auth/Login'
import SignUpComponent from '../components/Auth/SignUp'
import ForgotPasswordComponent from '../components/Auth/ForgotPassword'

function Login() {
  const [authMode, setAuthMode] = useState('login') // 'login', 'signup', 'forgot'

  const switchToSignUp = () => setAuthMode('signup')
  const switchToLogin = () => setAuthMode('login')
  const switchToForgotPassword = () => setAuthMode('forgot')

  return (
    <div>
      {authMode === 'login' && (
        <LoginComponent 
          onSwitchToSignUp={switchToSignUp}
          onSwitchToForgotPassword={switchToForgotPassword}
        />
      )}
      {authMode === 'signup' && (
        <SignUpComponent 
          onSwitchToLogin={switchToLogin}
        />
      )}
      {authMode === 'forgot' && (
        <ForgotPasswordComponent 
          onSwitchToLogin={switchToLogin}
        />
      )}
    </div>
  )
}

export default Login
