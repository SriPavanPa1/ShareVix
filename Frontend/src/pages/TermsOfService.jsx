import React from 'react'
import { Link } from 'react-router-dom'

const TermsOfService = () => {
  return (
    <div className="container" style={{ padding: '60px 0' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '30px', fontSize: '2.5rem', fontWeight: '800' }}>Terms of Service</h1>
        
        <div style={{ lineHeight: '1.8', color: '#475569' }}>
          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px', fontWeight: '600', color: '#0F172A' }}>1. Agreement to Terms</h2>
          <p>
            By accessing and using ShareVix, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px', fontWeight: '600', color: '#0F172A' }}>2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the materials (information or software) from ShareVix for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '15px' }}>
            <li>Modifying or copying the materials</li>
            <li>Using the materials for any commercial purpose or for any public display</li>
            <li>Attempting to decompile or reverse engineer any software contained on ShareVix</li>
            <li>Removing any copyright or other proprietary notations from the materials</li>
            <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
          </ul>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px', fontWeight: '600', color: '#0F172A' }}>3. Disclaimer</h2>
          <p>
            The materials on ShareVix are provided on an 'as is' basis. ShareVix makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px', fontWeight: '600', color: '#0F172A' }}>4. Limitations</h2>
          <p>
            In no event shall ShareVix or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ShareVix.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px', fontWeight: '600', color: '#0F172A' }}>5. Accuracy of Materials</h2>
          <p>
            The materials appearing on ShareVix could include technical, typographical, or photographic errors. ShareVix does not warrant that any of the materials on the website are accurate, complete, or current. ShareVix may make changes to the materials contained on the website at any time without notice.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px', fontWeight: '600', color: '#0F172A' }}>6. Links</h2>
          <p>
            ShareVix has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by ShareVix of the site. Use of any such linked website is at the user's own risk.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px', fontWeight: '600', color: '#0F172A' }}>7. Modifications</h2>
          <p>
            ShareVix may revise these terms of service for the website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px', fontWeight: '600', color: '#0F172A' }}>8. Governing Law</h2>
          <p>
            These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which ShareVix operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>

          <h2 style={{ fontSize: '1.5rem', marginTop: '30px', marginBottom: '15px', fontWeight: '600', color: '#0F172A' }}>9. Contact Information</h2>
          <p>
            If you have any questions about these Terms of Service, please contact us at <a href="mailto:terms@sharevix.com" style={{ color: '#2563EB', textDecoration: 'underline' }}>terms@sharevix.com</a> or visit the <Link to="/contact" style={{ color: '#2563EB', textDecoration: 'underline' }}>Contact Us</Link> page.
          </p>
        </div>
      </div>
    </div>
  )
}

export default TermsOfService
