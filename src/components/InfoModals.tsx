import React from 'react';

interface InfoModalsProps {
  activeModal: string | null;
  onClose: () => void;
}

const InfoModals: React.FC<InfoModalsProps> = ({ activeModal, onClose }) => {
  if (!activeModal) return null;

  const renderContent = () => {
    switch (activeModal) {
      case 'about':
        return (
          <>
            <h2>About RPS Arena Royale</h2>
            <p>RPS Arena Royale is a free browser-based Rock-Paper-Scissors strategy simulator.</p>
            <ul>
              <li>Users can watch AI-controlled Rock, Paper, and Scissors entities compete in real time.</li>
              <li>Includes multiple simulation modes and customizable settings.</li>
              <li>Supports arena customization and strategic experimentation.</li>
              <li>Provides statistics, live scoreboards, match history, tournament features, and responsive design.</li>
              <li>Built as an educational and entertainment experience for browser users.</li>
            </ul>
          </>
        );
      case 'faq':
        return (
          <>
            <h2>Frequently Asked Questions</h2>
            <div className="faq-container">
              <details>
                <summary>How do I play?</summary>
                <p>Configure your desired settings in the Control Panel (left sidebar) such as entity counts, arena shape, and simulation speed, then press the <strong>Start Battle</strong> button.</p>
              </details>
              <details>
                <summary>Is the game free?</summary>
                <p>Yes, RPS Arena Royale is completely free to play.</p>
              </details>
              <details>
                <summary>Do I need an account?</summary>
                <p>No account or registration is required. All settings are saved locally in your browser.</p>
              </details>
              <details>
                <summary>How does the AI work?</summary>
                <p>Entities follow built-in simulation logic and physics interactions. Advanced AI options allow entities to hunt prey and flee from predators using vector mathematics.</p>
              </details>
              <details>
                <summary>Does the website save my personal data?</summary>
                <p>We do not intentionally collect any unnecessary personal information. Any simulation settings or history are stored only on your local device.</p>
              </details>
              <details>
                <summary>Can I play on mobile?</summary>
                <p>Yes, the interface is fully responsive and supports modern mobile browsers.</p>
              </details>
            </div>
          </>
        );
      case 'privacy':
        return (
          <>
            <h2>Privacy Policy</h2>
            <p>Your privacy is important to us. This policy outlines how we handle data:</p>
            <ul>
              <li>This website may use cookies or similar technologies to enhance your experience and remember your settings.</li>
              <li>Analytics tools may be used to understand how visitors interact with the simulator and to improve performance.</li>
              <li>Third-party advertising providers, such as Google AdSense, may use cookies to serve personalized advertisements based on your visits to this and other websites.</li>
              <li>No unnecessary personally identifiable information is intentionally collected by this application.</li>
              <li>Users may contact the site owner regarding any privacy-related concerns through our GitHub repository.</li>
            </ul>
          </>
        );
      case 'terms':
        return (
          <>
            <h2>Terms of Service</h2>
            <p>By using RPS Arena Royale, you agree to the following terms:</p>
            <ul>
              <li>The simulator is provided strictly for entertainment and educational purposes.</li>
              <li>Users must not abuse, attack, exploit, or interfere with the platform or its underlying infrastructure.</li>
              <li>Features and mechanics may change or improve over time without prior notice.</li>
              <li>The owner is not responsible for any damages or losses arising from the use or inability to use this application.</li>
              <li>Continued use of the website implies acceptance of these terms and any future updates.</li>
            </ul>
          </>
        );
      case 'contact':
        return (
          <>
            <h2>Contact & Feedback</h2>
            <p>We welcome your feedback and suggestions!</p>
            <div className="contact-links">
              <p><strong>GitHub Repository:</strong></p>
              <a
                href="https://github.com/karalapatiphanicharan-cyber/rps-arena-simulator"
                target="_blank"
                rel="noopener noreferrer"
                className="github-link"
              >
                https://github.com/karalapatiphanicharan-cyber/rps-arena-simulator
              </a>
              <p style={{ marginTop: '1.5rem' }}>
                Visitors are welcome to submit suggestions, report bugs, or request features through the Issues section of our GitHub repository.
              </p>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay info-modal-overlay" onClick={onClose}>
      <div className="modal-content info-modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose} aria-label="Close modal">×</button>
        <div className="info-modal-body">
          {renderContent()}
        </div>
        <button className="btn btn-secondary close-bottom-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default InfoModals;
