import { useEffect, useState } from 'react';

const LINE_ONE = 'Membaca ekonomi';
const LINE_TWO = 'dari pola konsumsi.';

export default function TypewriterTitle() {
  const [displayedLine1, setDisplayedLine1] = useState('');
  const [displayedLine2, setDisplayedLine2] = useState('');
  const [cursorLine, setCursorLine] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer;

    if (!isDeleting) {
      if (displayedLine1.length < LINE_ONE.length) {
        setCursorLine(1);
        timer = setTimeout(() => {
          setDisplayedLine1(LINE_ONE.slice(0, displayedLine1.length + 1));
        }, 70 + Math.random() * 25);
      } else if (displayedLine2.length < LINE_TWO.length) {
        setCursorLine(2);
        timer = setTimeout(() => {
          setDisplayedLine2(LINE_TWO.slice(0, displayedLine2.length + 1));
        }, 65 + Math.random() * 20);
      } else {
        setCursorLine(2);
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 8000);
      }
    } else {
      if (displayedLine2.length > 0) {
        setCursorLine(2);
        timer = setTimeout(() => {
          setDisplayedLine2(displayedLine2.slice(0, -1));
        }, 28);
      } else if (displayedLine1.length > 0) {
        setCursorLine(1);
        timer = setTimeout(() => {
          setDisplayedLine1(displayedLine1.slice(0, -1));
        }, 28);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(false);
        }, 650);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedLine1, displayedLine2, isDeleting]);

  const handleQuickComplete = () => {
    if (displayedLine1 !== LINE_ONE || displayedLine2 !== LINE_TWO) {
      setDisplayedLine1(LINE_ONE);
      setDisplayedLine2(LINE_TWO);
      setIsDeleting(false);
      setCursorLine(2);
    } else {
      setDisplayedLine1('');
      setDisplayedLine2('');
      setIsDeleting(false);
      setCursorLine(1);
    }
  };

  return (
    <h1
      className="typewriter-heading"
      aria-label={`${LINE_ONE} ${LINE_TWO}`}
      onClick={handleQuickComplete}
      title="Klik untuk menyelesaikan / memutar ulang teks"
      style={{ cursor: 'pointer' }}
    >
      <span>{displayedLine1}</span>
      {cursorLine === 1 && <span className="typewriter-cursor" aria-hidden="true" />}
      {(displayedLine1.length >= LINE_ONE.length || displayedLine2.length > 0) && <br />}
      {(displayedLine1.length >= LINE_ONE.length || displayedLine2.length > 0) && (
        <em>
          {displayedLine2}
          {cursorLine === 2 && <span className="typewriter-cursor" aria-hidden="true" />}
        </em>
      )}
    </h1>
  );
}

