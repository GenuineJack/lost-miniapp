
import { useEffect, useState, useRef } from 'react';
import { sdk } from '@farcaster/frame-sdk';

const LOST_CODE = [4, 8, 15, 16, 23, 42];
const START_TIME = 108 * 60; // 108 minutes in seconds
const ENTRY_WINDOW = 4 * 60; // 4 minutes in seconds

export default function LostTimer() {
  const [timeLeft, setTimeLeft] = useState(START_TIME);
  const [input, setInput] = useState('');
  const [failed, setFailed] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    sdk.actions.ready();
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          triggerFailure();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const triggerFailure = () => {
    setFailed(true);
    const audio = new Audio('/system_failure.mp3');
    audio.loop = true;
    audio.play();
  };

  const resetTimer = () => {
    setTimeLeft(START_TIME);
    setInput('');
    setFailed(false);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
  };

  const handleSubmit = () => {
    if (input.split(',').map(Number).join(',') === LOST_CODE.join(',')) {
      resetTimer();
    } else {
      triggerFailure();
    }
  };

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const seconds = (timeLeft % 60).toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      {!failed ? (
        <>
          <h1 className="text-2xl font-bold mb-4">LOST Terminal</h1>
          <div className="text-6xl font-mono mb-4">{minutes}:{seconds}</div>
          {timeLeft <= ENTRY_WINDOW && (
            <>
              <input
                className="p-2 border rounded mb-2 text-center"
                placeholder="4,8,15,16,23,42"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button onClick={handleSubmit} className="bg-blue-600 text-white p-2 rounded">
                Enter Code
              </button>
            </>
          )}
        </>
      ) : (
        <div className="text-center">
          <div className="text-red-700 text-3xl mb-4">System Failure</div>
          <img src="/hieroglyphs.png" alt="Hieroglyphs" className="w-60 h-auto mx-auto" />
        </div>
      )}
    </div>
  );
}
