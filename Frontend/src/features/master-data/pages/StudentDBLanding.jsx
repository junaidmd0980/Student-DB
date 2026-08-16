import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Beaker, 
  Users, 
  BarChart3, 
  ShieldCheck, 
  GraduationCap, 
  Briefcase 
} from 'lucide-react';


export default function StudentDbLanding() {
  const navigate = useNavigate();

  return (
    <div className="landing-wrapper">
      
      <header className="navbar">
        <div className="navbar-container">
          <div className="logo-group">
            <div className="logo-icon">
              <GraduationCap />
            </div>
            <div className="logo-text">
              <span className="brand-name">Student DB</span>
              <span className="brand-sub">Student Management System</span>
            </div>
          </div>

          <div className="nav-actions">
            <button 
              type="button"
              className="btn-primary btn-sm"
              onClick={() => navigate('/register')}
            > Sign Up</button>
          </div>
        </div>
      </header>


      <section className="hero-section">
        <div className="hero-container">
          <span className="badge">Version 2.0 Live</span>
          <h1 className="hero-title">
            Streamline Your Academic & <br/>
            <span className="gradient-text">Lab Workflow</span>
          </h1>
          <p className="hero-description">
            An all-in-one central student database engine. Manage real-time schedules, track active lab sessions, and evaluate performance indicators efficiently.
          </p>
          <div className="hero-buttons">
            <button className="btn-primary btn-lg" onClick={() => navigate('/dashboard')}>Access Portal</button>
          </div>
        </div>
      </section>


      <section className="portals-section">
        <div className="section-header">
          <h2 className="section-title">Platform Overview</h2>
          <p className="section-subtitle">Explore the tools available in your academic environment</p>
        </div>
        
        <div className="portals-grid">
          {/* Admin Card */}
          <div className="portal-card">
            <div className="card-icon icon-admin">
              <ShieldCheck />
            </div>
            <h3 className="card-title">System Admins</h3>
            <p className="card-description">
              Configure universal student databases, deploy modules, and analyze institute performance telemetry.
            </p>
          </div>


          <div className="portal-card">
            <div className="card-icon icon-instructor">
              <Briefcase />
            </div>
            <h3 className="card-title">Faculty & Instructors</h3>
            <p className="card-description">
              Create lab sessions, build search filters, update schedules, and track visual status rosters.
            </p>
          </div>


          <div className="portal-card">
            <div className="card-icon icon-student">
              <GraduationCap />
            </div>
            <h3 className="card-title">Students</h3>
            <p className="card-description">
              Check in to active lab queues, monitor assignment feedback, and update system profiles.
            </p>
          </div>
        </div>
      </section>


      <section className="features-section">
        <div className="features-container">
          <div className="features-grid">
            
            <div className="feature-item">
              <div className="feature-icon">
                <Beaker />
              </div>
              <div className="feature-content">
                <h4 className="feature-title">Lab Session Control</h4>
                <p className="feature-description">
                  Spin up dedicated instances, filters, status checks, and session search states in seconds.
                </p>
              </div>
            </div>


            <div className="feature-item">
              <div className="feature-icon">
                <Users />
              </div>
              <div className="feature-content">
                <h4 className="feature-title">Unified Student Directory</h4>
                <p className="feature-description">
                  Clean, structured directories keeping track of status variables across classes.
                </p>
              </div>
            </div>


            <div className="feature-item">
              <div className="feature-icon">
                <BarChart3 />
              </div>
              <div className="feature-content">
                <h4 className="feature-title">Adaptive Dashboards</h4>
                <p className="feature-description">
                  High-contrast visual design focused on utility, performance tracking, and readability.
                </p>
              </div>
            </div>


          </div>
        </div>
      </section>
    </div>
  );
}