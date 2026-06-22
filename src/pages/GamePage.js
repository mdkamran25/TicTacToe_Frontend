import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const EMPTY_BOARD = Array(9).fill('');

// Individual cell component
const Cell = ({ value, index, onClick, isWinning, disabled, mySymbol }) => {
  const isX = value === 'X';
  const isO = value === 'O';

  return (
    <motion.button
      onClick={() => onClick(index)}
      disabled={disabled || !!value}
      whileHover={!value && !disabled ? { scale: 1.05, backgroundColor: 'rgba(255,255,255,0.06)' } : {}}
      whileTap={!value && !disabled ? { scale: 0.95 } : {}}
      style={{
        aspectRatio: '1',
        background: isWinning
          ? 'rgba(99, 102, 241, 0.15)'
          : 'rgba(255, 255, 255, 0.03)',
        border: isWinning
          ? '2px solid var(--accent)'
          : '2px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        cursor: !value && !disabled ? 'pointer' : 'default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: isWinning ? '0 0 20px var(--accent-glow)' : 'none',
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease',
      }}
    >
      <AnimatePresence>
        {value && (
          <motion.div
            key={value}
            initial={{ scale: 0, rotate: -30, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="font-display"
            style={{
              fontSize: 'clamp(1.8rem, 5vw, 3rem)',
              fontWeight: 900,
              color: isX ? 'var(--x-color)' : 'var(--o-color)',
              textShadow: isX
                ? '0 0 20px var(--x-glow)'
                : '0 0 20px var(--o-glow)',
              lineHeight: 1,
            }}
          >
            {value}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// Turn timer bar
const TimerBar = ({ timeLeft, currentTurn, mySymbol }) => {
  const isMyTurn = currentTurn === mySymbol;
  const pct = (timeLeft / 60) * 100;
  const color = timeLeft <= 10 ? 'var(--danger)' : timeLeft <= 20 ? 'var(--warning)' : isMyTurn ? 'var(--accent)' : 'var(--text-secondary)';

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {isMyTurn ? '⚡ Your turn' : '⏳ Opponent thinking...'}
        </span>
        <span style={{
          fontSize: 13,
          fontWeight: 600,
          color,
          fontFamily: 'Orbitron, monospace',
          animation: timeLeft <= 10 ? 'pulse-glow 0.5s ease-in-out infinite' : 'none',
        }}>
          {timeLeft}s
        </span>
      </div>
      <div style={{ height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'linear' }}
          style={{ height: '100%', background: color, borderRadius: 2 }}
        />
      </div>
    </div>
  );
};

// Result modal
const ResultModal = ({ result, mySymbol, onPlayAgain, onDashboard }) => {
  const isWin = result?.winnerSymbol === mySymbol;
  const isDraw = result?.winnerSymbol === 'draw';

  const emoji = isDraw ? '🤝' : isWin ? '🎉' : '💀';
  const title = isDraw ? 'Match Draw' : isWin ? 'You Won!' : 'You Lost';
  const color = isDraw ? 'var(--warning)' : isWin ? 'var(--success)' : 'var(--danger)';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
      }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="glass-card"
        style={{ padding: '48px 40px', textAlign: 'center', maxWidth: 380, width: '90%', borderColor: color + '40' }}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ fontSize: '4rem', marginBottom: 20 }}
        >
          {emoji}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="font-display"
          style={{ fontSize: '1.8rem', fontWeight: 900, color, marginBottom: 12 }}
        >
          {title}
        </motion.h2>

        {result?.reason === 'timeout' && (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
            {isWin ? 'Opponent ran out of time!' : 'You ran out of time!'}
          </p>
        )}

        {result?.reason === 'player_left' && (
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
            Opponent left the game.
          </p>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ display: 'flex', gap: 12, flexDirection: 'column' }}
        >
          <button onClick={onPlayAgain} className="btn-primary" style={{ fontSize: 15, padding: '14px' }}>
            🔄 Play Again
          </button>
          <button onClick={onDashboard} className="btn-secondary" style={{ fontSize: 15, padding: '14px' }}>
            🏠 Return to Dashboard
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default function GamePage() {
  const { roomCode } = useParams();
  const { socket } = useSocket();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [board, setBoard] = useState(EMPTY_BOARD);
  const [mySymbol, setMySymbol] = useState(null);
  const [currentTurn, setCurrentTurn] = useState('X');
  const [players, setPlayers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameResult, setGameResult] = useState(null);
  const [winningCells, setWinningCells] = useState([]);
  const [opponentLeft, setOpponentLeft] = useState(false);
  const [gameStatus, setGameStatus] = useState('active');

  useEffect(() => {
    if (!socket) return;

    socket.emit('join_room', { roomCode });

    socket.on('room_joined', (data) => {
      setMySymbol(data.symbol);
      setBoard(data.game.board);
      setCurrentTurn(data.game.currentTurn);
      setPlayers(data.game.players);
      setGameStatus(data.game.status);
    });

    socket.on('game_started', (data) => {
      setPlayers(data.players);
      setCurrentTurn(data.currentTurn);
      setBoard(data.board);
      setGameStatus('active');
    });

    socket.on('move_updated', (data) => {
      setBoard([...data.board]);
      if (data.currentTurn) setCurrentTurn(data.currentTurn);
    });

    socket.on('timer_update', (data) => {
      setTimeLeft(data.timeLeft);
      setCurrentTurn(data.currentTurn);
    });

    socket.on('game_over', (data) => {
      setBoard([...data.board]);
      if (data.winningCells) setWinningCells(data.winningCells);
      setGameResult(data);
      setGameStatus('completed');
      refreshUser(); // refresh stats
    });

    socket.on('game_restarted', (data) => {
      setBoard([...data.board]);
      setCurrentTurn(data.currentTurn);
      setWinningCells([]);
      setGameResult(null);
      setOpponentLeft(false);
      setGameStatus('active');
      setTimeLeft(60);
    });

    socket.on('player_left', (data) => {
      setOpponentLeft(true);
      setGameResult({ winnerSymbol: mySymbol, reason: 'player_left' });
      setGameStatus('abandoned');
    });

    socket.on('error', (data) => {
      console.error('Socket error:', data.message);
    });

    return () => {
      socket.off('room_joined');
      socket.off('game_started');
      socket.off('move_updated');
      socket.off('timer_update');
      socket.off('game_over');
      socket.off('game_restarted');
      socket.off('player_left');
      socket.off('error');
    };
  }, [socket, roomCode, mySymbol]);

  const handleCellClick = useCallback((index) => {
    if (!socket || currentTurn !== mySymbol || board[index] || gameStatus !== 'active') return;
    socket.emit('player_move', { roomCode, cellIndex: index });
  }, [socket, currentTurn, mySymbol, board, gameStatus, roomCode]);

  const handlePlayAgain = () => {
    socket?.emit('restart_game', { roomCode });
  };

  const handleDashboard = () => {
    socket?.emit('leave_game', { roomCode });
    navigate('/dashboard');
  };

  const myPlayer = players.find((p) => p.symbol === mySymbol);
  const opponent = players.find((p) => p.symbol !== mySymbol);
  const isMyTurn = currentTurn === mySymbol;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      gap: '20px',
    }}>
      {/* Ambient glows */}
      <div style={{ position: 'fixed', top: '10%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'var(--x-glow)', filter: 'blur(100px)', opacity: 0.2, pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '10%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'var(--o-glow)', filter: 'blur(100px)', opacity: 0.2, pointerEvents: 'none' }} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: 480 }}
      >
        <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Player X */}
          <div style={{ textAlign: 'center', minWidth: 100 }}>
            <div className="font-display" style={{ fontSize: '1.4rem', color: 'var(--x-color)', fontWeight: 900 }}>X</div>
            <p style={{ fontSize: 13, color: mySymbol === 'X' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              {players.find(p => p.symbol === 'X')?.name || '...'}
              {mySymbol === 'X' && <span style={{ color: 'var(--accent-bright)', fontSize: 11 }}> (you)</span>}
            </p>
          </div>

          {/* Turn indicator */}
          <div style={{ textAlign: 'center' }}>
            <motion.div
              key={currentTurn}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="font-display"
              style={{
                fontSize: '0.75rem',
                color: currentTurn === 'X' ? 'var(--x-color)' : 'var(--o-color)',
                letterSpacing: '0.1em',
                padding: '4px 10px',
                background: currentTurn === 'X' ? 'rgba(244, 114, 182, 0.1)' : 'rgba(56, 189, 248, 0.1)',
                borderRadius: 6,
                border: `1px solid ${currentTurn === 'X' ? 'rgba(244, 114, 182, 0.3)' : 'rgba(56, 189, 248, 0.3)'}`,
              }}
            >
              {isMyTurn ? 'YOUR TURN' : `${currentTurn}'S TURN`}
            </motion.div>
            <div className="font-display" style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 4, letterSpacing: '0.1em' }}>
              {roomCode}
            </div>
          </div>

          {/* Player O */}
          <div style={{ textAlign: 'center', minWidth: 100 }}>
            <div className="font-display" style={{ fontSize: '1.4rem', color: 'var(--o-color)', fontWeight: 900 }}>O</div>
            <p style={{ fontSize: 13, color: mySymbol === 'O' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              {players.find(p => p.symbol === 'O')?.name || 'Waiting...'}
              {mySymbol === 'O' && <span style={{ color: 'var(--accent-bright)', fontSize: 11 }}> (you)</span>}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Timer */}
      {gameStatus === 'active' && mySymbol && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ width: '100%', maxWidth: 480 }}
        >
          <TimerBar timeLeft={timeLeft} currentTurn={currentTurn} mySymbol={mySymbol} />
        </motion.div>
      )}

      {/* Game Board */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        style={{ width: '100%', maxWidth: 480 }}
      >
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
          padding: 16,
          background: 'rgba(255,255,255,0.02)',
          borderRadius: 20,
          border: '1px solid var(--border)',
        }}>
          {board.map((cell, i) => (
            <Cell
              key={i}
              value={cell}
              index={i}
              onClick={handleCellClick}
              isWinning={winningCells.includes(i)}
              disabled={!isMyTurn || gameStatus !== 'active'}
              mySymbol={mySymbol}
            />
          ))}
        </div>
      </motion.div>

      {/* Your symbol indicator */}
      {mySymbol && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            fontSize: 13,
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          You are playing as{' '}
          <span className="font-display" style={{ color: mySymbol === 'X' ? 'var(--x-color)' : 'var(--o-color)', fontWeight: 700 }}>
            {mySymbol}
          </span>
        </motion.div>
      )}

      {/* Leave button */}
      <button
        onClick={handleDashboard}
        className="btn-secondary"
        style={{ fontSize: 13, padding: '8px 20px' }}
      >
        🚪 Leave Game
      </button>

      {/* Result modal */}
      <AnimatePresence>
        {gameResult && (
          <ResultModal
            result={gameResult}
            mySymbol={mySymbol}
            onPlayAgain={handlePlayAgain}
            onDashboard={handleDashboard}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
