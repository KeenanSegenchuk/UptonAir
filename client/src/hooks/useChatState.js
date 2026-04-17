import { useState } from 'react';

export function useChatState() {
  const [showChatBox, setShowChatBox] = useState(false);
  const [showPopup, setPopup] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('darkMode') === 'true'
  );

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('darkMode', next.toString());
      document.body.classList.toggle('dark-mode', next);
      return next;
    });
  };

  return {
    showChatBox, setShowChatBox,
    showPopup, setPopup,
    darkMode, toggleDarkMode,
  };
}
