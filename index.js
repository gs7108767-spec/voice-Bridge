import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import dotenv from 'dotenv';
import os from 'os';

dotenv.config();


// Global Error Handlers to prevent crash
process.on('uncaughtException', (err) => {
    console.error('CRITICAL ERROR:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for long transcripts

// Initialize Local AI
let generator = null;
console.log("Loading Local AI Model...");
import { pipeline } from '@xenova/transformers';

(async () => {
    try {
        // Reverting to LaMini-Flan-T5-783M (Stable & Fast)
        // Phi-3 and Qwen were too heavy for this environment.
        generator = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-783M');
        console.log("✅ Local AI Brain (LaMini 783M - Logic Optimized) Loaded!");
    } catch (err) {
        console.error("Failed to load local model:", err);
    }
})();

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow all origins for local testing/LAN
        methods: ["GET", "POST"]
    }
});

// Endpoint to get Network IP
app.get('/api/network-ip', (req, res) => {
    const nets = os.networkInterfaces();
    let networkIp = 'localhost';

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                networkIp = net.address;
                // Break after finding the first one (usually the main one)
                // We prefer 192.168.x.x or 10.x.x.x
                if (networkIp.startsWith('192') || networkIp.startsWith('10')) {
                    break;
                }
            }
        }
    }
    res.json({ ip: networkIp });
});

// Endpoint for Local AI Chat
app.post('/api/chat', async (req, res) => {
    if (!generator) {
        return res.status(503).json({ error: "AI model is still loading... Please wait a moment." });
    }

    const { messages, context } = req.body;
    const userMessage = messages[messages.length - 1]; // Last message

    try {
        console.log(`[DEBUG] Received Context (${context ? context.length : 0} chars):`, context ? context.slice(-100) : "NULL");

        // Knowledge-First Prompt (AI Independent)
        // We permit the AI to answer ANY question, using context only as a reference.
        const instruction = "Answer the question truthfully and in full sentences. You may use the provided reference text if it is relevant to the question, but you should primarily rely on your own general knowledge to give a complete and helpful answer.";
        let prompt = `Instruction: ${instruction}\n\nReference Text: "${context || 'No context.'}"\n\nQuestion: ${userMessage.text}\n\nAnswer:`;

        const result = await generator(prompt, {
            max_new_tokens: 300,
            temperature: 0.6,
            do_sample: true,
            repetition_penalty: 1.2, // Lowered from 2.0 to prevent overly terse answers
            no_repeat_ngram_size: 3
        });

        const text = result[0].generated_text;
        res.json({ text });
    } catch (error) {
        console.error("Local AI Error:", error);
        res.status(500).json({ error: "Failed to generate response." });
    }
});


const rooms = new Map(); // Store active rooms

const generateRoomCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('create_room', () => {
        const roomCode = generateRoomCode();
        rooms.set(roomCode, { host: socket.id, audience: new Set() });
        socket.join(roomCode);
        socket.emit('room_created', roomCode);
        console.log(`Room created: ${roomCode} by ${socket.id}`);
    });

    socket.on('join_room', (roomCode) => {
        if (rooms.has(roomCode)) {
            socket.join(roomCode);
            rooms.get(roomCode).audience.add(socket.id);
            socket.emit('room_joined', roomCode);
            console.log(`User ${socket.id} joined room ${roomCode}`);
        } else {
            socket.emit('error', 'Room not found');
        }
    });

    socket.on('send_transcript', ({ roomCode, text }) => {
        // Broadcast to everyone in the room except sender (Host)
        // Actually, broadcast to everyone in room including sender? No, sender has it.
        // "to(roomCode)" sends to everyone in room.
        socket.to(roomCode).emit('receive_transcript', text);
    });

    socket.on('disconnect', () => {
        // Handle cleanup if needed
        console.log('User disconnected:', socket.id);
    });
});

const PORT = 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
