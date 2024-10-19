import { useState, useEffect } from 'react';

/**
 * Function to create a typewriter effect for displaying text.
 * @param {Object} props - The properties for the typewriter effect.
 * @param {string} props.text - The text to display in typewriter effect.
 * @param {number} props.speed - The speed at which each character is displayed.
 * @returns {JSX.Element} A React component that shows the typewriter effect.
 */
function TypewriterEffect({ text, speed }) {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text.charAt(index));
        setIndex(index + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [index, text, speed]);

  return <div>{displayedText}</div>;
};

export default TypewriterEffect;
