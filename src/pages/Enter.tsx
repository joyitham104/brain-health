import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BigButton from '../components/BigButton';
import { isStaff, setPlayerCode } from '../lib/player';
import { say } from '../lib/speech';

export default function Enter() {
  const [code, setCode] = useState('');
  const nav = useNavigate();

  function press(d: string) {
    if (code.length >= 4) return;
    const next = code + d;
    setCode(next);
    if (next.length === 4) go(next);
  }

  function go(next: string) {
    setPlayerCode(next);
    if (isStaff(next)) {
      say('Staff view');
      nav('/staff');
      return;
    }
    say('Welcome. Pick a game.');
    nav('/menu');
  }

  return (
    <main className="screen">
      <h1>Brain Health</h1>
      <p>Enter your 4-digit player code.</p>
      <div className="code">{code.padEnd(4, '·')}</div>
      <div className="grid-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'Go'].map((k) => (
          <BigButton
            key={k}
            className="pad"
            primary={k === 'Go'}
            onClick={() => {
              if (k === 'C') setCode('');
              else if (k === 'Go') {
                if (code.length === 4) go(code);
              } else press(k);
            }}
          >
            {k === 'C' ? 'Clear' : k}
          </BigButton>
        ))}
      </div>
      <p className="small" style={{ marginTop: 20 }}>
        Staff use code 9999. No name or email is stored.
      </p>
    </main>
  );
}
