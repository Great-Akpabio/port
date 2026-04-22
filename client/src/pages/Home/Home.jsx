import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <section className="home">
      <div className="hero-bg"></div>
      <div className="container">
        <div className="hero">
          <div className="hero-content fade-in">
            <p className="hero-greeting">Hello, I'm</p>
            <h1 className="hero-name">
              <span className="gradient-text">Web Developer</span>
            </h1>
            <p className="hero-tagline">
              Building beautiful, functional, and user-friendly web experiences
              that help businesses grow and users succeed.
            </p>
            <div className="hero-cta">
              <Link to="/portfolio" className="btn btn-primary">
                View My Work
              </Link>
              <Link to="/contact" className="btn btn-secondary">
                Get In Touch
              </Link>
            </div>
          </div>
          <div className="scroll-indicator">
            <span>Scroll down</span>
            <div className="scroll-arrow"></div>
          </div>
        </div>
      </div>
    </section>
  );
}