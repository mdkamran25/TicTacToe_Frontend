import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ label, value, color, icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{ scale: 1.03, y: -4 }}
    className="glass-card"
    style={{ padding: '20px 24px', cursor: 'default', borderColor: `${color}30` }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
      <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
    </div>
    <div
      className="font-display"
      style={{ fontSize: '2.2rem', fontWeight: 700, color }}
    >
      {value}
    </div>
  </motion.div>
);

export default function DashboardPage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    refreshUser();
  }, []);

  const handleCreateRoom = async () => {
    setCreateLoading(true);
    try {
      const { data } = await axios.post('/api/game/create-room');
      navigate(`/lobby/${data.roomCode}`);
    } catch (err) {
      console.error('Create room error:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setJoinError('');
    if (!joinCode.trim()) return setJoinError('Enter a room code');

    setJoinLoading(true);
    try {
      await axios.post('/api/game/join-room', { roomCode: joinCode.trim() });
      navigate(`/lobby/${joinCode.trim().toUpperCase()}`);
    } catch (err) {
      setJoinError(err.response?.data?.message || 'Room not found');
    } finally {
      setJoinLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const { data } = await axios.get('/api/game/history');
      setHistory(data.games);
      setShowHistory(true);
    } catch {}
  };

  const stats = user?.stats || {};

  return (
    <div style={{ minHeight: '100vh', padding: '24px' }}>
      {/* Ambient glow */}
      <div style={{ position: 'fixed', top: 0, left: '30%', width: 500, height: 300, background: 'var(--accent-glow)', filter: 'blur(150px)', opacity: 0.15, pointerEvents: 'none' }} />

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}
        >
          <div>
            <div className="font-display" style={{ fontSize: '1.6rem', fontWeight: 900, background: 'linear-gradient(135deg, var(--x-color), var(--accent), var(--o-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              XTOE
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Welcome back, {user?.name}</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={loadHistory} className="btn-secondary" style={{ fontSize: 13, padding: '8px 16px' }}>
              📜 History
            </button>
            <button onClick={logout} className="btn-secondary" style={{ fontSize: 13, padding: '8px 16px' }}>
              Sign Out
            </button>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 40 }}>
          <StatCard label="Games Played" value={stats.gamesPlayed || 0} color="var(--accent-bright)" icon="🎮" delay={0.1} />
          <StatCard label="Wins" value={stats.wins || 0} color="var(--success)" icon="🏆" delay={0.15} />
          <StatCard label="Losses" value={stats.losses || 0} color="var(--danger)" icon="💀" delay={0.2} />
          <StatCard label="Draws" value={stats.draws || 0} color="var(--warning)" icon="🤝" delay={0.25} />
          <StatCard label="Abandoned" value={stats.abandoned || 0} color="var(--text-secondary)" icon="🚪" delay={0.3} />
        </div>

        {/* Game actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Create Room */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card"
            style={{ padding: '32px', textAlign: 'center', borderColor: 'rgba(244, 114, 182, 0.2)' }}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontSize: '3rem', marginBottom: 16 }}
            >
              ✕
            </motion.div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 8 }}>Create Game</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
              Start a new room and invite a friend to play against you
            </p>
            <button
              className="btn-primary"
              onClick={handleCreateRoom}
              disabled={createLoading}
              style={{ width: '100%', background: 'linear-gradient(135deg, #db2777, #9333ea)' }}
            >
              {createLoading ? 'Creating...' : 'Create New Game'}
            </button>
          </motion.div>

          {/* Join Room */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card"
            style={{ padding: '32px', textAlign: 'center', borderColor: 'rgba(56, 189, 248, 0.2)' }}
          >
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              style={{ fontSize: '3rem', marginBottom: 16 }}
            >
              ○
            </motion.div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: 8 }}>Join Game</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
              Enter a room code or use a shared invite link
            </p>
            <form onSubmit={handleJoinRoom}>
              <input
                type="text"
                className="input-field"
                placeholder="Room code (e.g. AB3X7K)"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                style={{ marginBottom: 12, textAlign: 'center', fontSize: '1.1rem', letterSpacing: '0.2em', fontFamily: 'Orbitron, monospace' }}
              />
              {joinError && <p className="error-message" style={{ marginBottom: 10 }}>{joinError}</p>}
              <button
                type="submit"
                className="btn-primary"
                disabled={joinLoading}
                style={{ width: '100%', background: 'linear-gradient(135deg, #0284c7, #7c3aed)' }}
              >
                {joinLoading ? 'Joining...' : 'Join Game'}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Match History */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="glass-card"
              style={{ marginTop: 24, padding: '24px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontWeight: 600 }}>Match History</h3>
                <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 18 }}>×</button>
              </div>
              {history.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>No games yet. Play your first match!</p>
              ) : (
                history.map((game, i) => {
                  const myPlayer = game.players.find(p => p.userId?._id === user?.id || p.userId === user?.id);
                  const isWin = game.winner?._id === user?.id || game.winner === user?.id;
                  const isDraw = game.winnerSymbol === 'draw';
                  const result = isDraw ? 'Draw' : isWin ? 'Win' : game.status === 'abandoned' ? 'Abandoned' : 'Loss';
                  const resultColor = isDraw ? 'var(--warning)' : isWin ? 'var(--success)' : 'var(--danger)';

                  return (
                    <div key={game._id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: i < history.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      <div>
                        <span className="font-display" style={{ fontSize: 12, color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>{game.roomCode}</span>
                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                          vs {game.players.find(p => (p.userId?._id || p.userId) !== user?.id)?.name || 'Unknown'}
                        </div>
                      </div>
                      <span style={{ color: resultColor, fontWeight: 600, fontSize: 14 }}>{result}</span>
                    </div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
