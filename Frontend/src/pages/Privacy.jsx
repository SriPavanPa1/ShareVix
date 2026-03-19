import React from 'react'
import { Link } from 'react-router-dom'

const Privacy = () => {
  return (
    <div className="container" style={{ padding: '60px 0' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '30px', fontSize: '2.5rem', fontWeight: '800' }}>Privacy Policy</h1>
        
        <div style={{ lineHeight: '1.8', color: '#475569' }}>
          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px', fontWeight: '600', color: '#0F172A' }}>1. Introduction</h2>
          <p>
            ShareVix ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px', fontWeight: '600', color: '#0F172A' }}>2. Information We Collect</h2>
          <p>
            We may collect information about you in a variety of ways. The information we may collect on the site includes:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li>Personal identification information (name, email address, phone number, etc.)</li>
            <li>Payment information (credit card details, billing address)</li>
            <li>Usage data (pages visited, time spent, etc.)</li>
            <li>Device information (IP address, browser type, operating system)</li>
          </ul>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px', fontWeight: '600', color: '#0F172A' }}>3. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li>Provide, maintain, and improve our services</li>
            <li>Process your transactions and send related information</li>
            <li>Send marketing emails and promotional communications</li>
            <li>Respond to your inquiries and provide customer support</li>
            <li>Analyze usage patterns to improve user experience</li>
          </ul>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px', fontWeight: '600', color: '#0F172A' }}>4. Information Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties without your consent, except as required by law or to provide services you've requested.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px', fontWeight: '600', color: '#0F172A' }}>5. Security</h2>
          <p>
            We implement industry-standard security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px', fontWeight: '600', color: '#0F172A' }}>6. Your Rights</h2>
          <p>
            You have the right to access, update, or delete your personal information. You can do this by contacting us at privacy@sharevix.com.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px', fontWeight: '600', color: '#0F172A' }}>7. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at <a href="mailto:privacy@sharevix.com" style={{ color: '#2563EB', textDecoration: 'underline' }}>privacy@sharevix.com</a> or visit the <Link to="/contact" style={{ color: '#2563EB', textDecoration: 'underline' }}>Contact Us</Link> page.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Privacy
