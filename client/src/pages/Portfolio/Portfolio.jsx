import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import './Portfolio.css';

export default function Portfolio() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/projects')
      .then(res => {
        setProjects(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const defaultProjects = [
    {
      id: 0,
      title: 'E-Commerce Platform',
      description: 'A full-featured online store with cart, checkout, and payment integration.',
      image: null,
      live_url: '#',
      github_url: '#',
      tech_stack: ['React', 'Node.js', 'MongoDB', 'Stripe']
    },
    {
      id: 1,
      title: 'Task Management App',
      description: 'A productivity application for managing tasks, projects, and team collaboration.',
      image: null,
      live_url: '#',
      github_url: '#',
      tech_stack: ['Vue.js', 'Firebase', 'Tailwind']
    },
    {
      id: 2,
      title: 'Portfolio Website',
      description: 'A responsive portfolio website with modern design and animations.',
      image: null,
      live_url: '#',
      github_url: '#',
      tech_stack: ['HTML', 'CSS', 'JavaScript']
    }
  ];

  const displayProjects = projects.length > 0 ? projects : defaultProjects;

  return (
    <section className="portfolio section">
      <div className="container">
        <h2 className="section-title text-center fade-in">My Projects</h2>
        <p className="section-subtitle text-center fade-in">
          A collection of projects I've worked on
        </p>
        
        {loading ? (
          <div className="loading">Loading projects...</div>
        ) : (
          <div className="projects-grid">
            {displayProjects.map((project, index) => (
              <article key={project.id} className="project-card fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="project-image">
                  {project.image ? (
                    <img src={project.image} alt={project.title} />
                  ) : (
                    <div className="project-placeholder">
                      <span>🚀</span>
                    </div>
                  )}
                </div>
                <div className="project-content">
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="project-tech">
                    {(project.tech_stack || []).map((tech, i) => (
                      <span key={i} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                  <div className="project-links">
                    {project.live_url && project.live_url !== '#' && (
                      <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                        Live Demo
                      </a>
                    )}
                    {project.github_url && project.github_url !== '#' && (
                      <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}