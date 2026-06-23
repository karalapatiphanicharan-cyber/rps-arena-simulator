import React from 'react';

interface FooterProps {
  onOpenModal: (modal: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenModal }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="global-footer">
      <div className="footer-links">
        <button onClick={() => onOpenModal('about')} className="footer-link-btn">About</button>
        <button onClick={() => onOpenModal('faq')} className="footer-link-btn">FAQ</button>
        <button onClick={() => onOpenModal('privacy')} className="footer-link-btn">Privacy Policy</button>
        <button onClick={() => onOpenModal('terms')} className="footer-link-btn">Terms of Service</button>
        <button onClick={() => onOpenModal('contact')} className="footer-link-btn">Contact</button>
      </div>
      <div className="footer-info">
        <p>RPS Arena Royale © {currentYear} • All Rights Reserved</p>
      </div>
    </footer>
  );
};

export default Footer;
