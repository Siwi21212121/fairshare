import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const icons = {
  split: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3v7a2 2 0 0 0 4 0V3M8 10v11M16 3c-2 0-3 2-3 4s1 4 3 4v10" />
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 3 14h8l-1 8 10-12h-8z" />
    </svg>
  ),
  explain: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 1-1 1.7" />
      <path d="M12 17h.01" />
    </svg>
  ),
  play: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
};

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [videoOpen, setVideoOpen] = useState(false);
  const workspaceRef = useRef(null);

  function handleStartSplitting() {
    if (user) {
      navigate('/new-split');
      return;
    }
    // Not logged in yet: scroll to the interactive workspace preview first,
    // exactly like the approved landing design, then continue to signup.
    workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => navigate('/signup'), 650);
  }

  return (
    <div>
      <div className="container">
        <nav className="nav-bar">
          <Logo />
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#demo">Demo</a>
          </div>
          <div className="nav-cta">
            {user ? (
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Log in
                </Button>
                <Button size="sm" onClick={() => navigate('/signup')}>
                  Sign up
                </Button>
              </>
            )}
          </div>
        </nav>

        <section className="hero">
          <h1>
            Split money.
            <br />
            Keep friendships.
          </h1>
          <p className="sub">
            FairShare makes group expenses effortless. Track who paid, calculate everyone's share, and settle up
            without the awkward math.
          </p>
          <div className="hero-ctas">
            <Button onClick={handleStartSplitting}>Start Splitting</Button>
            <Button variant="ghost" onClick={() => setVideoOpen(true)}>
              {icons.play} Watch demo
            </Button>
          </div>

          <div className="float-stage">
            <div className="float-card card" style={{ top: 0, left: '4%', animationDelay: '0s' }}>
              <div className="fc-title">🏖 Goa Trip · Hotel</div>
              <div className="fc-amt">₹30,000</div>
            </div>
            <div className="float-card card" style={{ top: 55, left: '58%', animationDelay: '1.2s' }}>
              <div className="fc-title">🎟 Concert Tickets</div>
              <div className="fc-amt">₹1,500 each</div>
            </div>
            <div className="float-card card" style={{ top: 130, left: '20%', animationDelay: '2.1s' }}>
              <div className="fc-title">Person A → Person B</div>
              <div className="fc-amt" style={{ color: 'var(--accent)' }}>
                ₹5,050
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="section" id="features">
        <div className="container">
          <div className="section-head">
            <h2>Built for the messy, real-world split</h2>
            <p>Not everyone pays the same amount, orders the same food, or shares every expense. FairShare handles it.</p>
          </div>
          <div className="features-grid">
            <div className="feature-card card">
              <div className="f-icon">{icons.split}</div>
              <h3>Flexible splits</h3>
              <p>Equal splits, exact custom amounts, or separate groups within one expense — your call, every time.</p>
            </div>
            <div className="feature-card card">
              <div className="f-icon">{icons.bolt}</div>
              <h3>Fewest payments, automatically</h3>
              <p>FairShare simplifies every debt in a group down to the minimum number of payments needed to settle up.</p>
            </div>
            <div className="feature-card card">
              <div className="f-icon">{icons.explain}</div>
              <h3>Explain this split</h3>
              <p>Click any payment to see exactly which expenses it's made of — no more "wait, why do I owe this?"</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="how-it-works">
        <div className="container">
          <div className="section-head">
            <h2>How it works</h2>
            <p>Three steps from a pile of receipts to a settled group.</p>
          </div>
          <div className="how-steps">
            <div className="how-step card">
              <div className="n">01</div>
              <h3>Add your expenses</h3>
              <p>Log what was spent, who paid, and exactly who it was for — even if it's only some of the group.</p>
            </div>
            <div className="how-step card">
              <div className="n">02</div>
              <h3>We calculate the real shares</h3>
              <p>Equal, custom amounts, or separate groups — FairShare works out each person's true share.</p>
            </div>
            <div className="how-step card">
              <div className="n">03</div>
              <h3>Get one settlement, fully explained</h3>
              <p>Every payment is simplified, and every number can be clicked to see exactly why.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="demo">
        <div className="container">
          <div className="demo-panel card">
            <div className="demo-copy">
              <div className="eyebrow-badge" style={{ alignSelf: 'flex-start' }}>
                2 minute walkthrough
              </div>
              <h2 style={{ fontSize: 24 }}>See FairShare in action</h2>
              <p>Watch a full trip — from creating a group to seeing exactly who pays whom — in under two minutes.</p>
              <Button onClick={() => setVideoOpen(true)}>{icons.play} Watch demo</Button>
            </div>
            <div className="demo-thumb" onClick={() => setVideoOpen(true)}>
              <div className="play-btn">{icons.play}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" ref={workspaceRef}>
        <div className="container">
          <div className="section-head">
            <h2>Try the workspace</h2>
            <p>This is what a real group looks like inside FairShare.</p>
          </div>
          <div className="workspace-panel card">
            <div className="chip">🏖 Goa Trip · 10 people</div>
            <div className="ws-people">
              {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].map((n) => (
                <div key={n} className="avatar sm">
                  {n}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20 }}>
              <Button onClick={handleStartSplitting}>Create your own split</Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer container">
        <Logo size={16} />
        <span>© {new Date().getFullYear()} FairShare</span>
      </footer>

      {videoOpen && (
        <div className="video-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && setVideoOpen(false)}>
          <div className="video-modal-box">
            <button className="video-modal-close" onClick={() => setVideoOpen(false)} aria-label="Close video">
              ×
            </button>
            <video src="/videos/fairshare-demo.mp4" controls autoPlay />
          </div>
        </div>
      )}
    </div>
  );
}
