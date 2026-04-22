import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import './About.css';

export default function About() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.get('/profile').then(res => setProfile(res.data)).catch(console.error);
  }, []);

  const defaultSkills = ['JavaScript', 'React', 'Node.js', 'HTML', 'CSS', 'Python', 'MongoDB', 'SQL'];
  const skills = profile?.skills || defaultSkills;

  return (
    <section className="about section">
      <div className="container">
        <div className="about-grid">
          <div className="about-image slide-up">
            <div className="image-wrapper">
              <div className="placeholder-avatar">
                {profile?.avatar ? (
                  <img src={profile.avatar} alt="Profile" />
                ) : (
                  <span>👨‍💻</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="about-content">
            <h2 className="section-title fade-in">About Me</h2>
            <p className="about-bio fade-in">
              {profile?.bio || "A passionate web developer with experience in building modern web applications. I love creating clean, efficient, and user-friendly solutions that make a difference."}
            </p>
            
            <div className="skills-section fade-in">
              <h3>Skills & Technologies</h3>
              <div className="skills-grid">
                {skills.map((skill, index) => (
                  <div key={index} className="skill-tag" style={{ animationDelay: `${index * 0.05}s` }}>
                    {skill}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="experience-section fade-in">
              <h3>Experience</h3>
              <div className="timeline">
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h4>Senior Web Developer</h4>
                    <p className="timeline-date">2022 - Present</p>
                    <p className="timeline-desc">Building modern web applications and leading development teams.</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h4>Web Developer</h4>
                    <p className="timeline-date">2020 - 2022</p>
                    <p className="timeline-desc">Developed responsive websites and web applications for various clients.</p>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h4>Junior Developer</h4>
                    <p className="timeline-date">2018 - 2020</p>
                    <p className="timeline-desc">Started my journey in web development, learning modern technologies.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}