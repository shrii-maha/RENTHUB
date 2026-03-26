import { createContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Logic to determine initial theme
  const getInitialTheme = () => {
    // 1. Check localStorage first for manual override
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;

    // 2. Otherwise, check current time (10 PM to 6 AM is dark)
    const hour = new Date().getHours();
    return (hour >= 22 || hour < 6) ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Toggle theme manually
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  // Sync theme with HTML body class
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
    }
  }, [theme]);

  // Optional: Update theme automatically when time crosses 10 PM or 6 AM
  useEffect(() => {
    const interval = setInterval(() => {
      const hour = new Date().getHours();
      const isNight = hour >= 22 || hour < 6;
      
      // Only auto-update if the user hasn't set a manual override in the current session
      // (Simplified: only update if current theme doesn't match the time-based theme and no override in localStorage)
      const shouldBeDark = isNight;
      const currentIsDark = theme === 'dark';
      
      // If there is no manual override in localStorage, then we can auto-switch
      if (!localStorage.getItem('theme')) {
        if (shouldBeDark && !currentIsDark) {
          setTheme('dark');
        } else if (!shouldBeDark && currentIsDark) {
          setTheme('light');
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
