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
          {right ? 
		<div>	
		   <span className="button-text">{text}</span>
          	   <span className="button-icon">{'→'}</span>
		</div>
	   :
		<div>
          	   <span className="button-icon">{'←'}</span>
		   <span className="button-text">{" " + text}</span>
		</div>
	  }
          <span className="hover-effect"></span>
        </a>
      ) : (
        <Link 
          to={href} 
          className={classNames}
        >
          {right ? 
		<div>	
		   <span className="button-text">{text}</span>
          	   <span className="button-icon">{'→'}</span>
		</div>
	   :
		<div>
          	   <span className="button-icon">{'←'}</span>
		   <span className="button-text">{" " + text}</span>
		</div>
	  }
          <span className="hover-effect"></span>
        </Link>
      )}
    </>
  );
};

export default LinkButton;