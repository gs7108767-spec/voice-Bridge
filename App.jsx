import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import NoteEditor from './components/NoteEditor';
import AIPanel from './components/AIPanel';
import LoginView from './components/LoginView';
import HostView from './components/HostView';
import AudienceView from './components/AudienceView';
import ErrorBoundary from './components/ErrorBoundary'; // Added for debugging
import { AnimatePresence, motion } from 'framer-motion'; // Added motion
import { io } from 'socket.io-client';
import { WifiOff } from 'lucide-react'; // Added icon

// Initialize socket outside component to prevent multiple connections, 
// OR inside useEffect if we want dynamic URL.
// For "other device", we need the Host's IP.
// Since we don't know it, we assume we are running locally or the user configured it.
// Ideally: const socket = io(window.location.hostname + ':3000');
// BUT: Vite is on 5173, Server on 3000.
// We'll try to guess port 3000 on the same hostname.
const SOCKET_URL = `http://${window.location.hostname}:3000`;

function App() {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('voice-notes-data');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);

  // Bridge State
  const [userRole, setUserRole] = useState(null); // 'host' | 'audience' | 'guest' (traditional)
  const [socket, setSocket] = useState(null);
  const [roomCode, setRoomCode] = useState(null);

  // Specific state for Audience AI Context
  const [audienceText, setAudienceText] = useState("");
  const [currentSessionText, setCurrentSessionText] = useState(""); // Shared host text

  // Connectivity State
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    localStorage.setItem('voice-notes-data', JSON.stringify(notes));
  }, [notes]);

  // Connectivity Listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const createNote = (initialContent = '') => {
    const newNote = {
      id: Date.now().toString(),
      title: initialContent ? initialContent.slice(0, 30) + (initialContent.length > 30 ? '...' : '') : 'New Note',
      content: initialContent,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setNotes([newNote, ...notes]);
    setActiveNoteId(newNote.id);
    return newNote.id;
  };

  const updateNote = (updatedNote) => {
    const newNotes = notes.map(n => n.id === updatedNote.id ? { ...updatedNote, updatedAt: Date.now() } : n);
    setNotes(newNotes);
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
    if (activeNoteId === id) {
      setActiveNoteId(null);
    }
  };

  // --- Bridge Logic ---

  const initSocket = () => {
    if (!socket) {
      const newSocket = io(SOCKET_URL);
      setSocket(newSocket);
      return newSocket;
    }
    return socket;
  };

  const handleJoinAsHost = () => {
    const s = initSocket();
    s.emit('create_room');
    s.on('room_created', (code) => {
      setRoomCode(code);
      setUserRole('host');
      // Create a note to save this session
      createNote(`Live Session ${code}`);
    });
  };

  const handleJoinAsAudience = (code) => {
    const s = initSocket();
    s.emit('join_room', code);
    s.on('room_joined', (connectedCode) => {
      setRoomCode(connectedCode);
      setUserRole('audience');
    });
    s.on('error', (msg) => alert(msg));
  };

  const handleLogout = () => {
    if (socket) socket.disconnect();
    setSocket(null);
    setUserRole(null);
    setRoomCode(null);
  };

  // --- Import / Export ---
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "voice_notes_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (e) => {
    const fileReader = new FileReader();
    fileReader.readAsText(e.target.files[0], "UTF-8");
    fileReader.onload = (e) => {
      try {
        const importedNotes = JSON.parse(e.target.result);
        if (Array.isArray(importedNotes)) {
          setNotes([...notes, ...importedNotes]);
          alert("Notes imported successfully!");
        }
      } catch (err) {
        alert("Invalid JSON file");
      }
    };
  };

  // When Host updates (from HostView), we save to the active note
  const handleHostUpdate = (text) => {
    setCurrentSessionText(text); // Always keep AI in sync
    if (activeNote) {
      updateNote({ ...activeNote, content: text });
    }
  };

  // Main Render Logic
  const renderMainView = () => {
    // Audience AI needs 'liveText' (from socket) as context. 
    // BUT, liveText is inside AudienceView state. 
    // We need to lift that state up OR (easier) let AudienceView handle the socket text 
    // and maybe we pass a ref? 
    // Actually, simplest is to lift 'liveText' to App, so we can pass it to AIPanel.
    // But AIPanel is rendered here in App.

    // Let's create a shared state for 'audienceContext'

    const commonAI = (
      <AnimatePresence>
        {isAIPanelOpen && (
          <AIPanel
            isOpen={isAIPanelOpen}
            onClose={() => setIsAIPanelOpen(false)}
            // Context strategy: 
            // If Host, activeNote?.content (which we update via onUpdate)
            // If Audience, we need the live text.
            // If Normal, activeNote?.content
            noteContent={userRole === 'audience' ? audienceText : (currentSessionText || activeNote?.content || "")}
          />
        )}
      </AnimatePresence>
    );

    if (userRole === 'host') {
      return (
        <ErrorBoundary>
          <HostView
            roomCode={roomCode}
            socket={socket}
            onUpdate={handleHostUpdate}
            onToggleAI={() => setIsAIPanelOpen(!isAIPanelOpen)}
            initialContent={activeNote?.content || ''}
            noteId={activeNote?.id}
          />
          {commonAI}
        </ErrorBoundary>
      );
    }
    if (userRole === 'audience') {
      return (
        <>
          <AudienceView
            roomCode={roomCode}
            socket={socket}
            onToggleAI={() => setIsAIPanelOpen(!isAIPanelOpen)}
            onTextUpdate={setAudienceText} // Lift state up
          />
          {commonAI}
        </>
      );
    }

    if (activeNoteId) {
      return (
        <>
          <NoteEditor
            note={activeNote}
            onUpdate={updateNote}
            onToggleAI={() => setIsAIPanelOpen(!isAIPanelOpen)}
          />
          {commonAI}
        </>
      );
    }

    return <LoginView onJoinAsHost={handleJoinAsHost} onJoinAsAudience={handleJoinAsAudience} />;
  };

  return (
    <div className="flex h-screen bg-dark-900 text-gray-100 overflow-hidden font-sans relative">
      {/* Offline Warning */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="absolute top-0 left-0 right-0 z-[100] bg-red-600 text-white flex items-center justify-center p-2 font-medium shadow-lg"
          >
            <WifiOff size={18} className="mr-2" />
            No Internet Connection. Some features may be unavailable.
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar
        notes={notes}
        currentNoteId={activeNoteId}
        onSelectNote={setActiveNoteId}
        onCreateNote={() => createNote('')}
        onDeleteNote={deleteNote}
        onLogout={handleLogout}
        userRole={userRole}
        onImport={handleImport}
        onExport={handleExport}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {renderMainView()}
      </div>
    </div>
  );
}

export default App;
