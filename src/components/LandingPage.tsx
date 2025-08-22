import React, { useEffect, useRef } from 'react';
import './LandingPage.css';
import { Target, Calendar, Heart, Sparkles, CheckCircle2, Clock, Brain, LineChart } from 'lucide-react';

interface LandingPageProps {
  isAuthenticated: boolean;
  onGetStarted: () => void;
  onEnterApp: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ isAuthenticated, onGetStarted, onEnterApp }) => {
  const revealRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = revealRef.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll('[data-reveal]')) as HTMLElement[];
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).classList.add('reveal-in');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    items.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="landing-root">
      <div className="gradient-bg" aria-hidden />
      <header className="landing-header">
        <div className="brand">Personal OS</div>
        <nav className="landing-actions">
          {isAuthenticated ? (
            <button className="btn ghost" onClick={onEnterApp}>Enter App</button>
          ) : (
            <button className="btn ghost" onClick={onGetStarted}>Sign in</button>
          )}
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="hero">
          <div className="hero-copy">
            <h1>
              Design your life’s strategy
              <br />
              and execute it weekly
            </h1>
            <p>
              Personal OS aligns your 5-year vision with annual flight plans, 90-day sprints, and weekly execution—so you always know what matters now.
            </p>
            <div className="cta-row">
              {isAuthenticated ? (
                <button className="btn primary" onClick={onEnterApp}>Open Dashboard</button>
              ) : (
                <button className="btn primary" onClick={onGetStarted}>Get started — it’s free</button>
              )}
              <a className="btn link" href="#features">Explore features</a>
            </div>
            <div className="trust-row">
              <CheckCircle2 size={18}/> No fluff. Just clear priorities and momentum.
            </div>
          </div>
          <div className="hero-visual" aria-hidden>
            <div className="card demo one">
              <div className="card-title"><Target size={16}/> Annual Flight Plan</div>
              <div className="bar"><span style={{width: '72%'}}/></div>
              <div className="bar"><span style={{width: '38%'}}/></div>
              <div className="bar"><span style={{width: '90%'}}/></div>
            </div>
            <div className="card demo two">
              <div className="card-title"><Calendar size={16}/> 90-Day Sprint</div>
              <ul>
                <li><span className="badge">KR</span> Ship v1.0 onboarding</li>
                <li><span className="badge high">High</span> Close 5 partnerships</li>
                <li><span className="badge">KR</span> Reduce churn to 3%</li>
              </ul>
            </div>
            <div className="card demo three">
              <div className="card-title"><Clock size={16}/> This Week</div>
              <div className="pill">Design landing page</div>
              <div className="pill">Customer interviews</div>
              <div className="pill">Revenue model review</div>
            </div>
          </div>
        </section>

        {/* Value Props */}
        <section id="features" className="features" ref={revealRef}>
          <div className="features-grid">
            <div className="feature-card" data-reveal>
              <div className="icon"><Heart/></div>
              <h3>Start with a vision</h3>
              <p>Craft life goals that actually mean something—and tie them to annual outcomes.</p>
            </div>
            <div className="feature-card" data-reveal>
              <div className="icon"><Target/></div>
              <h3>Plan the year</h3>
              <p>Define 2–3 flight plans per year to create focus, not overwhelm.</p>
            </div>
            <div className="feature-card" data-reveal>
              <div className="icon"><Calendar/></div>
              <h3>Sprint for 90 days</h3>
              <p>Quarterly OKRs break the big goals into weekly-sized steps.</p>
            </div>
            <div className="feature-card" data-reveal>
              <div className="icon"><Brain/></div>
              <h3>Weekly huddle</h3>
              <p>Review progress, remove roadblocks, and commit to what moves the needle.</p>
            </div>
            <div className="feature-card" data-reveal>
              <div className="icon"><LineChart/></div>
              <h3>Progress you can feel</h3>
              <p>Automatic roll-ups show how weekly wins lift quarterly and annual goals.</p>
            </div>
            <div className="feature-card" data-reveal>
              <div className="icon"><Sparkles/></div>
              <h3>AI suggestions</h3>
              <p>Context-aware ideas become tasks with one click. Accept, snooze, or refine.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta">
          <h2>Make consistency your unfair advantage</h2>
          <p>It takes minutes to plan the week—and it compounds every quarter.</p>
          {isAuthenticated ? (
            <button className="btn primary" onClick={onEnterApp}>Enter your workspace</button>
          ) : (
            <button className="btn primary" onClick={onGetStarted}>Create your account</button>
          )}
        </section>
      </main>

      <footer className="landing-footer">
        <span>© {new Date().getFullYear()} Personal OS</span>
        <span className="dot" />
        <a href="/welcome">Welcome</a>
      </footer>
    </div>
  );
};

export default LandingPage;
