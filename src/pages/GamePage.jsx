import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  Copy, Check, MessageSquare, RotateCw, RotateCcw, 
  Sparkles, AlertCircle, LogOut, BookOpen, Volume2, 
  HelpCircle, Shield, ArrowDownCircle, RefreshCw, Home, PlusCircle, 
  Swords, ShieldAlert, Wifi, WifiOff, Settings, Trophy
} from 'lucide-react';

import UnoCard from '../components/UnoCard';
import CardHand from '../components/CardHand';
import PlayerSeat from '../components/PlayerSeat';
import GameLobby from '../components/GameLobby';
import ColorPickerModal from '../components/ColorPickerModal';
import ScoreboardModal from '../components/ScoreboardModal';
import SettingsModal from '../components/SettingsModal';
import ExitConfirmModal from '../components/ExitConfirmModal';
import GameChat from '../components/GameChat';
import SoundToggle from '../components/SoundToggle';

import { useSoundEffects } from '../hooks/useSoundEffects';
import { getPlayerProfile, updatePlayerStats } from '../services/storage';
import { isValidMove } from '../services/mockUnoEngine';
import { socketService } from '../services/socketService';

export default function GamePage({ onOpenRules }) {
  const { roomCode = '' } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { 
    playClick, playCardPlay, playCardDraw, 
    playUnoCall, playSpecialAction, playTurnAlert, playWin, playError 
  } = useSoundEffects();

  const formattedRoomCode = (roomCode || '').toUpperCase();
  const profile = getPlayerProfile();
  const myPlayerId = socketService.myPlayerId;

  // Room State
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roomError, setRoomError] = useState('');
  const [isServerConnected, setIsServerConnected] = useState(socketService.isConnected);

  // Modals & Extras
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [pendingWildCard, setPendingWildCard] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
  const [isScoreboardManualOpen, setIsScoreboardManualOpen] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(
    localStorage.getItem('uno_rishika_animations') !== 'false'
  );

  // Dynamic Action Animation triggers
  const [isDrawingAnimation, setIsDrawingAnimation] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'System', text: `Welcome to UNO RISHIKA Room ${formattedRoomCode}!` },
  ]);
  const [copied, setCopied] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  const showNotice = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 3500);
  };

  const handleToggleAnimations = () => {
    const nextState = !animationsEnabled;
    setAnimationsEnabled(nextState);
    localStorage.setItem('uno_rishika_animations', nextState);
  };

  // Sync / Initialize Room on Mount
  useEffect(() => {
    let active = true;

    const initializeRoom = async () => {
      setLoading(true);
      setRoomError('');

      if (!formattedRoomCode || formattedRoomCode.length !== 6) {
        setRoomError('Invalid room code format. Room code must be 6 characters.');
        setLoading(false);
        return;
      }

      let currentRoomData = socketService.getRoom(formattedRoomCode);

      if (!currentRoomData) {
        const isHostParam = searchParams.get('host') === 'true';
        if (isHostParam) {
          try {
            currentRoomData = await socketService.createRoom({
              username: profile.username || 'Host',
              avatar: profile.avatar || '🔥',
              maxPlayers: parseInt(searchParams.get('max'), 10) || 4,
            });
            currentRoomData.code = formattedRoomCode;
            socketService.saveRoom(currentRoomData);
          } catch (e) {
            console.error(e);
          }
        }
      }

      if (!currentRoomData) {
        setRoomError(`Room "${formattedRoomCode}" was not found or has expired.`);
        setLoading(false);
        return;
      }

      const inRoom = currentRoomData.players.some((p) => p.id === myPlayerId);
      if (!inRoom) {
        try {
          currentRoomData = await socketService.joinRoom({
            roomCode: formattedRoomCode,
            username: profile.username || 'Player',
            avatar: profile.avatar || '🦊',
          });
        } catch (err) {
          setRoomError(err.message || 'Unable to join this room.');
          setLoading(false);
          return;
        }
      }

      if (active) {
        setRoom(currentRoomData);
        setLoading(false);
      }
    };

    initializeRoom();

    const unsubRoomUpdated = socketService.on('room_updated', (updatedRoom) => {
      if (updatedRoom.code === formattedRoomCode) {
        setRoom(updatedRoom);
      }
    });

    const unsubGameStarted = socketService.on('game_started', (startedRoom) => {
      if (startedRoom.code === formattedRoomCode) {
        setRoom(startedRoom);
        playCardPlay();
        showNotice(`Round ${startedRoom.roundsPlayed || 1} started! Cards dealt!`);
      }
    });

    // Real-Time Game Event Listener for sound effects & visual notices
    const unsubGameEvent = socketService.on('game_event', (eventData) => {
      if (!eventData) return;
      if (eventData.text) showNotice(eventData.text);

      switch (eventData.type) {
        case 'card_played':
          playCardPlay();
          break;
        case 'card_drawn':
          playCardDraw();
          if (animationsEnabled) {
            setIsDrawingAnimation(true);
            setTimeout(() => setIsDrawingAnimation(false), 500);
          }
          break;
        case 'player_skipped':
        case 'direction_reversed':
        case 'color_selected':
          playSpecialAction();
          break;
        case 'uno_declared':
          playUnoCall();
          break;
        case 'game_won':
          playWin();
          break;
        default:
          break;
      }
    });

    const unsubChat = socketService.on('chat_received', (msg) => {
      setChatMessages((prev) => [...prev, msg]);
    });

    const unsubConnection = socketService.on('connection_status', ({ connected }) => {
      setIsServerConnected(connected);
    });

    return () => {
      active = false;
      unsubRoomUpdated();
      unsubGameStarted();
      unsubGameEvent();
      unsubChat();
      unsubConnection();
    };
  }, [formattedRoomCode]);

  // Turn sound alert
  useEffect(() => {
    if (room?.status === 'playing' && room?.players) {
      const current = room.players[room.currentTurnIndex || 0];
      if (current?.id === myPlayerId) {
        playTurnAlert();
      }
    }
  }, [room?.currentTurnIndex, room?.status]);

  // Win stats update
  useEffect(() => {
    if (room?.status === 'ended' && room?.winner) {
      updatePlayerStats({ won: room.winner.id === myPlayerId });
    }
  }, [room?.status, room?.winner]);

  // Host clicks Start Game
  const handleHostStartGame = async () => {
    playClick();
    try {
      await socketService.startGame(formattedRoomCode);
    } catch (err) {
      playError();
      alert(err.message);
    }
  };

  // Play Again (Next Round)
  const handleHostPlayAgain = async () => {
    playClick();
    try {
      if (socketService.socket && socketService.socket.connected) {
        socketService.socket.emit('restart_game', { roomCode: formattedRoomCode });
      } else {
        await socketService.startGame(formattedRoomCode);
      }
    } catch (err) {
      playError();
      alert(err.message);
    }
  };

  const handleAddBot = () => {
    socketService.addBotPlayer(formattedRoomCode);
  };

  // Human plays card
  const handlePlayCard = async (card) => {
    if (!room) return;
    const current = room.players[room.currentTurnIndex || 0];
    if (current?.id !== myPlayerId) {
      playError();
      showNotice("It's not your turn!");
      return;
    }

    if (!isValidMove(card, room.topCard, room.activeColor)) {
      playError();
      showNotice("Invalid card play! Must match color, number, or symbol.");
      return;
    }

    if (card.color === 'wild') {
      setPendingWildCard(card);
      setIsColorPickerOpen(true);
      return;
    }

    executeCardPlay(card, card.color);
  };

  const executeCardPlay = async (card, chosenColor) => {
    try {
      playCardPlay();
      await socketService.playCard(formattedRoomCode, card.id, chosenColor);
    } catch (err) {
      playError();
      showNotice(err.message || 'Cannot play this card.');
    }
  };

  const handleColorSelected = (color) => {
    setIsColorPickerOpen(false);
    if (pendingWildCard) {
      executeCardPlay(pendingWildCard, color);
      setPendingWildCard(null);
    }
  };

  // Draw Card
  const handleHumanDraw = async () => {
    const current = room?.players[room?.currentTurnIndex || 0];
    if (current?.id !== myPlayerId) return;

    try {
      playCardDraw();
      if (animationsEnabled) {
        setIsDrawingAnimation(true);
        setTimeout(() => setIsDrawingAnimation(false), 500);
      }
      await socketService.drawCard(formattedRoomCode);
    } catch (err) {
      playError();
      showNotice(err.message);
    }
  };

  // Pass Turn
  const handlePassTurn = async () => {
    try {
      playClick();
      await socketService.passTurn(formattedRoomCode);
    } catch (err) {
      playError();
      showNotice(err.message);
    }
  };

  // Shout UNO
  const handleCallUno = async () => {
    try {
      playUnoCall();
      await socketService.declareUno(formattedRoomCode);
      showNotice("🔥 You declared UNO! 🔥");
    } catch (err) {
      playError();
    }
  };

  // Catch Opponent who forgot UNO
  const handleCatchUno = async (targetPlayer) => {
    try {
      playClick();
      const res = await socketService.catchUno(formattedRoomCode, targetPlayer.id);
      if (res?.caught) {
        playSpecialAction();
      }
    } catch (err) {
      playError();
    }
  };

  // Wild Draw Four Challenge Decision
  const handleResolveChallenge = async (chooseToChallenge) => {
    try {
      playClick();
      await socketService.resolveChallenge(formattedRoomCode, chooseToChallenge);
    } catch (err) {
      playError();
      showNotice(err.message);
    }
  };

  const confirmExit = () => {
    setIsExitConfirmOpen(false);
    socketService.leaveRoom(formattedRoomCode);
    navigate('/dashboard');
  };

  const handleCopyCode = () => {
    playClick();
    navigator.clipboard.writeText(formattedRoomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendChatMessage = (text) => {
    const msg = socketService.sendChat(formattedRoomCode, text, profile.username || 'You');
    setChatMessages((prev) => [...prev, msg]);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-yellow-400 border-t-transparent animate-spin" />
        <p className="text-sm font-bold text-slate-300">Connecting to UNO Room {formattedRoomCode}...</p>
      </div>
    );
  }

  if (roomError || !room) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 text-center max-w-md mx-auto space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shadow-lg">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-white font-display">Room Error</h2>
          <p className="text-sm text-slate-300">{roomError || 'Room not found.'}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <Link
            to="/dashboard"
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition border border-slate-700 flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider hover:brightness-110 transition shadow-lg flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Create Room
          </button>
        </div>
      </div>
    );
  }

  const isHost = room.hostId === myPlayerId;
  const isMyTurn = room.players[room.currentTurnIndex || 0]?.id === myPlayerId;
  const selfPlayer = room.players.find((p) => p.id === myPlayerId) || {
    ...profile,
    id: myPlayerId,
    cards: [],
  };

  const isTargetOfChallenge = room.pendingChallenge && room.pendingChallenge.targetPlayerId === myPlayerId;

  // LOBBY VIEW
  if (room.status === 'lobby') {
    return (
      <div className="w-full min-h-[85vh] flex items-center justify-center p-4">
        <GameLobby
          roomCode={formattedRoomCode}
          players={room.players.map((p) => ({ ...p, isSelf: p.id === myPlayerId }))}
          isHost={isHost}
          hostName={room.hostName}
          maxPlayers={room.maxPlayers || 4}
          onStartGame={handleHostStartGame}
          onLeaveRoom={() => setIsExitConfirmOpen(true)}
          onAddBot={handleAddBot}
        />

        {/* Exit Confirmation */}
        <ExitConfirmModal
          isOpen={isExitConfirmOpen}
          onCancel={() => setIsExitConfirmOpen(false)}
          onConfirm={confirmExit}
        />
      </div>
    );
  }

  // GAMEPLAY TABLE VIEW
  const opponents = room.players.filter((p) => p.id !== myPlayerId);
  const topOpponent = opponents[0];
  const leftOpponent = opponents[1];
  const rightOpponent = opponents[2];

  return (
    <div className="relative w-full min-h-[calc(100vh-68px)] bg-table-felt flex flex-col justify-between overflow-hidden select-none">
      <div className="absolute inset-0 bg-radial-vignette opacity-80 pointer-events-none" />

      {/* TOP HEADER CONTROLS */}
      <div className="relative z-30 w-full px-4 py-3 flex items-center justify-between glass-panel border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyCode}
            title="Click to copy room code"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 hover:border-yellow-400 text-xs font-mono font-bold text-yellow-400 transition"
          >
            <span>ROOM: {formattedRoomCode}</span>
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
          </button>

          {/* Direction indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/70 border border-slate-800 text-[11px] text-slate-300">
            {room.turnDirection === 1 ? (
              <>
                <RotateCw className="w-3.5 h-3.5 text-yellow-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Clockwise</span>
              </>
            ) : (
              <>
                <RotateCcw className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Counter-Clockwise</span>
              </>
            )}
          </div>

          {/* Connection status pill */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400 font-semibold">
            {isServerConnected ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Live</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Connecting...</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Scoreboard Modal trigger */}
          <button
            onClick={() => {
              playClick();
              setIsScoreboardManualOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition"
            title="Inspect Running Scoreboard"
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden sm:inline">Scoreboard</span>
          </button>

          {/* In-game chat button */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="relative p-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
            title="In-game Chat"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-yellow-400 rounded-full animate-pulse" />
          </button>

          {/* Sound Toggle */}
          <SoundToggle />

          {/* Settings Modal */}
          <button
            onClick={() => {
              playClick();
              setIsSettingsOpen(true);
            }}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Leave Match */}
          <button
            onClick={() => {
              playClick();
              setIsExitConfirmOpen(true);
            }}
            className="p-2 rounded-full bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 transition"
            title="Leave Game"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ACTION NOTICE TOAST */}
      {actionNotice && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-slate-950/95 border border-yellow-400/80 text-yellow-300 text-xs font-bold shadow-2xl animate-bounce">
          {actionNotice}
        </div>
      )}

      {/* TOP OPPONENT */}
      <div className="relative z-20 w-full px-4 pt-2">
        {topOpponent && (
          <div className="flex flex-col items-center">
            <PlayerSeat
              player={topOpponent}
              isCurrentTurn={room.players[room.currentTurnIndex || 0]?.id === topOpponent.id}
              position="top"
            />
            {topOpponent.cardsCount === 1 && topOpponent.unoVulnerable && (
              <button
                onClick={() => handleCatchUno(topOpponent)}
                className="mt-1 px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse shadow-md"
              >
                Catch UNO! (+2)
              </button>
            )}
          </div>
        )}
      </div>

      {/* CENTER PLAYING TABLE */}
      <div className="relative z-10 flex-1 flex items-center justify-between px-2 sm:px-12 my-2">
        <div className="w-24 sm:w-32 flex flex-col items-center">
          {leftOpponent && (
            <>
              <PlayerSeat
                player={leftOpponent}
                isCurrentTurn={room.players[room.currentTurnIndex || 0]?.id === leftOpponent.id}
                position="left"
              />
              {leftOpponent.cardsCount === 1 && leftOpponent.unoVulnerable && (
                <button
                  onClick={() => handleCatchUno(leftOpponent)}
                  className="mt-1 px-2.5 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded-full text-[9px] font-black uppercase shadow"
                >
                  Catch UNO!
                </button>
              )}
            </>
          )}
        </div>

        {/* Central Arena */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center gap-2">
            <span
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-2 border ${
                isMyTurn
                  ? 'bg-yellow-400 text-slate-950 border-yellow-300 animate-pulse ring-2 ring-yellow-400/50'
                  : 'bg-slate-900/80 text-slate-300 border-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isMyTurn ? "IT'S YOUR TURN!" : `${room.players[room.currentTurnIndex || 0]?.name}'s Turn`}
            </span>
          </div>

          <div className="flex items-center gap-6 sm:gap-10">
            {/* Draw Deck */}
            <div className="flex flex-col items-center">
              <button
                onClick={handleHumanDraw}
                disabled={!isMyTurn || room.hasDrawnThisTurn}
                title={isMyTurn ? 'Click to draw a card' : 'Wait for your turn'}
                className={`relative group transition-transform ${
                  isMyTurn && !room.hasDrawnThisTurn
                    ? 'hover:scale-105 active:scale-95 cursor-pointer'
                    : 'cursor-not-allowed opacity-80'
                } ${isDrawingAnimation && animationsEnabled ? 'scale-90 opacity-70' : ''}`}
              >
                <div className="absolute -top-1.5 -left-1.5 w-full h-full rounded-2xl bg-slate-950 border border-slate-700 -rotate-3" />
                <div className="absolute -top-0.5 -left-0.5 w-full h-full rounded-2xl bg-slate-900 border border-slate-700 rotate-2" />
                <UnoCard isBack size="lg" />
              </button>
              <span className="text-[11px] font-bold text-slate-400 mt-2">
                Deck ({room.deckCount || 0})
              </span>
            </div>

            {/* Discard Pile */}
            <div className="flex flex-col items-center">
              <div
                className={`relative transform hover:scale-105 transition-transform duration-300 ${
                  animationsEnabled ? 'animate-card-fly-play' : ''
                }`}
                key={room.topCard?.id}
              >
                {room.topCard && (
                  <UnoCard
                    card={room.topCard}
                    size="lg"
                    className="shadow-2xl"
                  />
                )}
              </div>
              <span className="text-[11px] font-bold text-slate-400 mt-2">
                Discard Pile ({room.discardCount || 1})
              </span>
            </div>
          </div>

          {/* Active Color Indicator */}
          <div className="flex items-center gap-2 bg-slate-950/80 px-4 py-1.5 rounded-full border border-slate-700 text-xs shadow-md">
            <span className="text-slate-400 font-semibold">Active Color:</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`w-3.5 h-3.5 rounded-full shadow ${
                  room.activeColor === 'red'
                    ? 'bg-red-500 shadow-glow-red'
                    : room.activeColor === 'blue'
                    ? 'bg-blue-500 shadow-glow-blue'
                    : room.activeColor === 'green'
                    ? 'bg-emerald-500 shadow-glow-green'
                    : room.activeColor === 'yellow'
                    ? 'bg-yellow-400 shadow-glow-yellow'
                    : 'bg-white'
                }`}
              />
              <span className="font-black uppercase tracking-wider text-white">
                {room.activeColor || 'Any'}
              </span>
            </div>
          </div>
        </div>

        <div className="w-24 sm:w-32 flex flex-col items-center">
          {rightOpponent && (
            <>
              <PlayerSeat
                player={rightOpponent}
                isCurrentTurn={room.players[room.currentTurnIndex || 0]?.id === rightOpponent.id}
                position="right"
              />
              {rightOpponent.cardsCount === 1 && rightOpponent.unoVulnerable && (
                <button
                  onClick={() => handleCatchUno(rightOpponent)}
                  className="mt-1 px-2.5 py-0.5 bg-red-600 hover:bg-red-500 text-white rounded-full text-[9px] font-black uppercase shadow"
                >
                  Catch UNO!
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* WILD DRAW FOUR CHALLENGE POPUP */}
      {isTargetOfChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border-2 border-red-500 rounded-3xl p-6 shadow-2xl text-center space-y-5 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto">
              <Swords className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white font-display">Wild Draw Four Challenge</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                A Wild Draw Four was played on you! Under official rules, Wild Draw 4 is only legal if the player had no card matching the active color.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1 text-left">
              <div>• <strong>Challenge:</strong> If they had matching color, they draw 4 cards! If innocent, you draw 6 cards and lose your turn!</div>
              <div>• <strong>Accept:</strong> Simply draw 4 cards and lose your turn.</div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleResolveChallenge(false)}
                className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition border border-slate-700"
              >
                Accept (+4 Cards)
              </button>
              <button
                onClick={() => handleResolveChallenge(true)}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-1.5"
              >
                <Swords className="w-4 h-4" />
                Challenge Player!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM PLAYER HAND */}
      <div className="relative z-30 w-full flex flex-col items-center pb-2 bg-gradient-to-t from-[#06080D] via-[#090D15]/95 to-transparent pt-3">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={handleCallUno}
            className={`px-6 py-2.5 rounded-2xl font-black text-sm uppercase tracking-wider italic transition transform active:scale-95 shadow-xl flex items-center gap-2 ${
              (selfPlayer.cards?.length || 0) <= 2
                ? 'bg-gradient-to-r from-red-600 via-yellow-400 to-red-600 text-slate-950 animate-bounce ring-4 ring-yellow-400/80'
                : 'bg-red-700/80 hover:bg-red-600 text-yellow-300 border border-red-500'
            }`}
          >
            🔥 UNO!
          </button>

          <button
            onClick={handleHumanDraw}
            disabled={!isMyTurn || room.hasDrawnThisTurn}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-slate-200 border border-slate-700 transition"
          >
            Draw Card
          </button>

          {room.hasDrawnThisTurn && isMyTurn && (
            <button
              onClick={handlePassTurn}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black uppercase tracking-wider transition animate-pulse"
            >
              Pass Turn
            </button>
          )}
        </div>

        <CardHand
          cards={selfPlayer.cards || []}
          topCard={room.topCard}
          activeColor={room.activeColor}
          isMyTurn={isMyTurn}
          onPlayCard={handlePlayCard}
          isValidMove={isValidMove}
        />
      </div>

      {/* COLOR PICKER MODAL */}
      <ColorPickerModal
        isOpen={isColorPickerOpen}
        onSelectColor={handleColorSelected}
      />

      {/* SCOREBOARD MODAL (AUTOMATIC ON ROUND END OR MANUAL INSPECTION) */}
      <ScoreboardModal
        isOpen={room.status === 'ended' || isScoreboardManualOpen}
        winner={room.winner}
        players={room.players.map((p) => ({ ...p, isSelf: p.id === myPlayerId }))}
        scoreboard={room.scoreboard}
        roundsPlayed={room.roundsPlayed || 1}
        isHost={isHost}
        onPlayAgain={handleHostPlayAgain}
        onLeave={() => {
          setIsScoreboardManualOpen(false);
          setIsExitConfirmOpen(true);
        }}
      />

      {/* SETTINGS MODAL */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        animationsEnabled={animationsEnabled}
        onToggleAnimations={handleToggleAnimations}
        onOpenRules={() => {
          setIsSettingsOpen(false);
          onOpenRules?.();
        }}
        onRequestLeave={() => {
          setIsSettingsOpen(false);
          setIsExitConfirmOpen(true);
        }}
      />

      {/* EXIT CONFIRMATION MODAL */}
      <ExitConfirmModal
        isOpen={isExitConfirmOpen}
        onCancel={() => setIsExitConfirmOpen(false)}
        onConfirm={confirmExit}
      />

      {/* IN-GAME CHAT DRAWER */}
      <GameChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={chatMessages}
        onSendMessage={handleSendChatMessage}
        playerName={profile.username || 'You'}
        playerAvatar={profile.avatar || '🔥'}
      />
    </div>
  );
}
