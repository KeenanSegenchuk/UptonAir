import React from 'react';
import { Link } from 'react-router-dom';
import '../DeepseekCSSorcery/LinkButton.css';

const LinkButton = ({ href, text, external = false, right = true, pulse = false }) => {
  const classNames = `modern-link-button ${pulse ? 'pulse-effect' : ''} ${right ? 'rightLinkButton' : 'leftLinkButton'}`;
  
  return (
    <>
      {external ? (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className={classNames}
        >
          <span className="button-text">{text}</span>
          <span className="button-icon">{right ? '→' : '←'}</span>
          <span className="hover-effect"></span>
        </a>
      ) : (
        <Link 
          to={href} 
          className={classNames}
        >
          <span className="button-text">{text}</span>
          <span className="button-icon">{right ? '→' : '←'}</span>
          <span className="hover-effect"></span>
        </Link>
      )}
    </>
  );
};

export default LinkButton;