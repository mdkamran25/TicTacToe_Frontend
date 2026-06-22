import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function LobbyPage() {
  const { roomCode } = useParams();
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [gameData, setGameData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [opponentJoined, setOpponentJoined] = useState(false);
  const [status, setStatus] = useState('waiting'); // waiting | joined | starting
  const [error, setError] = useState('');
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!socket) return;

    // Emit join_room to register socket in the room
    socket.emit('join_room', { roomCode });

    socket.on('room_joined', (data) => {
      setGameData(data.game);
      // If 2 players already present (e.g. re-join)
      if (data.game.players.length >= 2) {
        setOpponentJoined(true);
      }
    });

    socket.on('player_joined', (data) => {
      if (data.name !== user?.name) {
        setOpponentJoined(true);
        setStatus('joined');
      }
    });

    socket.on('game_started', () => {
      setStatus('starting');
      setTimeout(() => navigate(`/game/${roomCode}`), 1500);
    });

    socket.on('error', (data) => setError(data.message));

    return () => {
      socket.off('room_joined');
      socket.off('player_joined');
      socket.off('game_started');
      socket.off('error');
    };
  }, [socket, roomCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/join/${roomCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeave = () => {
    socket?.emit('leave_game', { roomCode });
    navigate('/dashboard');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{ position: 'fixed', top: '20%', left: '20%', width: 300, height: 300, borderRadius: '50%', background: 'var(--accent-glow)', filter: 'blur(100px)', opacity: 0.2, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '20%', right: '20%', width: 300, height: 300, borderRadius: '50%', background: 'var(--o-glow)', filter: 'blur(100px)', opacity: 0.2, pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 480, textAlign: 'center' }}
      >
        {error && (
          <motion.div className="glass-card" style={{ padding: '20px', marginBottom: 20, borderColor: 'var(--danger)' }}>
            <p style={{ color: 'var(--danger)' }}>{error}</p>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary" style={{ marginTop: 12, fontSize: 13 }}>Back to Dashboard</button>
          </motion.div>
        )}

        <div className="glass-card" style={{ padding: '40px 36px' }}>
          {/* Logo */}
          <div className="font-display" style={{
            fontSize: '1.4rem',
            fontWeight: 900,
            background: 'linear-gradient(135deg, var(--x-color), var(--accent), var(--o-color))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: 32,
          }}>
            XTOE
          </div>

          <AnimatePresence mode="wait">
            {status === 'starting' ? (
              <motion.div key="starting" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                <div style={{ fontSize: '4rem', marginBottom: 16 }}>🚀</div>
                <h2 className="font-display" style={{ fontSize: '1.6rem', color: 'var(--success)', marginBottom: 8 }}>Game Starting!</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Get ready to play...</p>
              </motion.div>
            ) : opponentJoined ? (
              <motion.div key="opponent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                  style={{ fontSize: '3rem', marginBottom: 16 }}
                >
                  👥
                </motion.div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: 8, color: 'var(--success)' }}>Opponent Connected!</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Starting game...</p>
              </motion.div>
            ) : (
              <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Animated dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ y: [0, -12, 0], opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
                      style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--accent)' }}
                    />
                  ))}
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: 8 }}>Waiting for opponent...</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>Share the room code or link below</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Room code */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid var(--border-accent)',
            borderRadius: 12,
            padding: '16px 24px',
            marginBottom: 20,
          }}>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.1em' }}>ROOM CODE</p>
            <div className="font-display" style={{ fontSize: '2.2rem', fontWeight: 900, letterSpacing: '0.3em', color: 'var(--accent-bright)' }}>
              {roomCode}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <button
              onClick={handleCopy}
              className="btn-secondary"
              style={{ flex: 1, fontSize: 13 }}
            >
              {copied ? '✓ Copied!' : '📋 Copy Code'}
            </button>
            <button
              onClick={handleCopyLink}
              className="btn-secondary"
              style={{ flex: 1, fontSize: 13 }}
            >
              🔗 Share Link
            </button>
          </div>

          {/* Player info */}
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '16px 0', borderTop: '1px solid var(--border)' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', color: 'var(--x-color)', fontFamily: 'Orbitron, monospace', fontWeight: 900 }}>X</div>
              <p style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 4 }}>{user?.name}</p>
              <p style={{ fontSize: 11, color: 'var(--success)' }}>● Connected</p>
            </div>
            <div style={{ alignSelf: 'center', color: 'var(--text-secondary)', fontSize: '1.2rem' }}>vs</div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', color: 'var(--o-color)', fontFamily: 'Orbitron, monospace', fontWeight: 900 }}>O</div>
              <p style={{ fontSize: 13, color: opponentJoined ? 'var(--text-primary)' : 'var(--text-secondary)', marginTop: 4 }}>
                {opponentJoined ? 'Opponent' : 'Waiting...'}
              </p>
              <p style={{ fontSize: 11, color: opponentJoined ? 'var(--success)' : 'var(--text-secondary)' }}>
                {opponentJoined ? '● Connected' : '○ Not joined'}
              </p>
            </div>
          </div>

          <button onClick={handleLeave} className="btn-secondary" style={{ width: '100%', marginTop: 20, fontSize: 13 }}>
            Leave Room
          </button>
        </div>
      </motion.div>
    </div>
  );
}
