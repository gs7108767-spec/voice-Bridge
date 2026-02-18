import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, Menu, Settings, History, ChevronLeft, LogOut, Upload, Download } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = ({ notes, currentNoteId, onSelectNote, onCreateNote, onDeleteNote, onLogout, userRole, onImport, onExport }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className={clsx(
            "flex flex-col h-full bg-dark-950 transition-all duration-300 ease-in-out border-r border-dark-900",
            isCollapsed ? "w-16" : "w-72"
        )}>
            {/* Header / Toggle */}
            <div className="p-4 flex items-center justify-between">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 text-gray-400 hover:text-gray-200 hover:bg-dark-800 rounded-full transition-colors"
                >
                    <Menu size={20} />
                </button>
                {!isCollapsed && (
                    <span className="font-semibold text-gray-200 tracking-wide">VoiceNotes</span>
                )}
            </div>

            {/* New Chat Button */}
            <div className="px-4 mb-4">
                <button
                    onClick={onCreateNote}
                    className={clsx(
                        "w-full flex items-center gap-3 bg-dark-850 hover:bg-dark-800 text-gray-200 py-3 rounded-full transition-all border border-transparent hover:border-dark-700 shadow-sm",
                        isCollapsed ? "justify-center px-0" : "px-4"
                    )}
                >
                    <Plus size={20} className="text-gray-400" />
                    {!isCollapsed && <span className="text-sm font-medium">New chat</span>}
                </button>
            </div>

            {/* Recent Section */}
            {!isCollapsed && (
                <div className="px-6 py-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Recent</span>
                </div>
            )}

            <div className="flex-1 overflow-y-auto px-2 space-y-1 scrollbar-thin scrollbar-thumb-dark-800">
                {notes.length === 0 ? (
                    !isCollapsed && (
                        <div className="text-center text-gray-600 mt-10 text-sm p-4">
                            No recents.
                        </div>
                    )
                ) : (
                    notes.map((note) => (
                        <div
                            key={note.id}
                            onClick={() => onSelectNote(note.id)}
                            className={clsx(
                                "group flex items-center gap-3 p-2 rounded-full cursor-pointer transition-colors relative",
                                note.id === currentNoteId
                                    ? "bg-brand-500/10 text-brand-400"
                                    : "text-gray-400 hover:bg-dark-850 hover:text-gray-200",
                                isCollapsed ? "justify-center" : ""
                            )}
                        >
                            <MessageSquare size={18} className="shrink-0" />
                            {!isCollapsed && (
                                <>
                                    <span className="truncate text-sm font-medium flex-1">
                                        {note.title || "Untitled Chat"}
                                    </span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }}
                                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity p-1"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Bottom Actions */}
            <div className="p-2 border-t border-dark-900 mt-auto flex flex-col gap-1">
                {userRole && (
                    <button
                        onClick={onLogout}
                        className={clsx(
                            "w-full flex items-center gap-3 p-3 mb-2 rounded-lg text-red-400 hover:bg-dark-850 hover:text-red-300 transition-colors",
                            isCollapsed ? "justify-center" : ""
                        )}
                        title="Leave Session"
                    >
                        <LogOut size={20} />
                        {!isCollapsed && <span className="text-sm">Leave</span>}
                    </button>
                )}

                {/* Import / Export - Only show if not collapsed for layout simplicity, or show icons */}
                <div className={clsx("flex gap-1", isCollapsed ? "flex-col" : "flex-row")}>
                    <label className={clsx(
                        "flex-1 flex items-center gap-3 p-3 rounded-lg text-gray-400 hover:bg-dark-850 hover:text-gray-200 transition-colors cursor-pointer",
                        isCollapsed ? "justify-center" : "justify-center"
                    )} title="Import">
                        <Upload size={20} />
                        <input type="file" className="hidden" accept=".json" onChange={onImport} />
                    </label>
                    <button
                        onClick={onExport}
                        className={clsx(
                            "flex-1 flex items-center gap-3 p-3 rounded-lg text-gray-400 hover:bg-dark-850 hover:text-gray-200 transition-colors",
                            isCollapsed ? "justify-center" : "justify-center"
                        )}
                        title="Export"
                    >
                        <Download size={20} />
                    </button>
                </div>

                <button className={clsx(
                    "w-full flex items-center gap-3 p-3 rounded-lg text-gray-400 hover:bg-dark-850 hover:text-gray-200 transition-colors",
                    isCollapsed ? "justify-center" : ""
                )} title="Settings">
                    <Settings size={20} />
                    {!isCollapsed && <span className="text-sm">Settings</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
