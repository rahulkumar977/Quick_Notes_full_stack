const jwt = require('jsonwebtoken');
const Meeting = require('../models/Meeting');

// Parse cookie string into an object
const parseCookies = (cookieHeader) => {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim();
      cookies[key] = decodeURIComponent(val);
    }
  });
  return cookies;
};

// roomId -> Map(socketId -> { socketId, userId, name, isAudioMuted, isVideoOff, isScreenSharing, isHandRaised })
const roomParticipants = new Map();

const initializeMeetingSocket = (io) => {
  // Socket.IO authentication middleware
  io.use((socket, next) => {
    try {
      let token = null;

      // Check auth header or handshake token first
      if (socket.handshake.auth && socket.handshake.auth.token) {
        token = socket.handshake.auth.token;
      }

      // Check cookie header
      if (!token && socket.handshake.headers.cookie) {
        const cookies = parseCookies(socket.handshake.headers.cookie);
        token = cookies.accessToken;
      }

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
          socket.user = {
            userId: decoded.userId,
            role: decoded.role
          };
        } catch (jwtErr) {
          // Token expired or invalid, socket.user remains null
          socket.user = null;
        }
      }

      // Allow connection - guest identification will happen in join-room if user is not in token
      next();
    } catch (err) {
      console.error('Socket auth middleware error:', err);
      next();
    }
  });

  io.on('connection', (socket) => {
    let currentRoomId = null;

    // Join Meeting Room
    socket.on('join-room', async ({ roomId, user }) => {
      if (!roomId) return;

      currentRoomId = roomId;
      socket.join(roomId);

      const participantInfo = {
        socketId: socket.id,
        userId: user?.userId || user?.id || socket.user?.userId || socket.id,
        name: user?.name || 'Student',
        isAudioMuted: false,
        isVideoOff: false,
        isScreenSharing: false,
        isHandRaised: false
      };

      if (!roomParticipants.has(roomId)) {
        roomParticipants.set(roomId, new Map());
      }

      const roomMap = roomParticipants.get(roomId);

      // Collect existing participants to send to the newly joined peer
      const existingList = Array.from(roomMap.values());

      // Store new participant
      roomMap.set(socket.id, participantInfo);

      // Send existing participants list to newly joined peer
      socket.emit('existing-participants', {
        participants: existingList,
        yourSocketId: socket.id
      });

      // Notify all other peers in the room that a new user joined
      socket.to(roomId).emit('user-joined', {
        participant: participantInfo
      });

      // Update participant in MongoDB meeting model if available
      try {
        if (participantInfo.userId && participantInfo.userId.length === 24) {
          await Meeting.findOneAndUpdate(
            { roomCode: roomId },
            {
              $push: {
                participants: {
                  user: participantInfo.userId,
                  name: participantInfo.name,
                  joinedAt: new Date()
                }
              }
            }
          );
        }
      } catch (dbErr) {
        // Silently continue
      }
    });

    // WebRTC Signaling: Offer
    socket.on('send-offer', ({ toSocketId, offer, callerInfo }) => {
      io.to(toSocketId).emit('receive-offer', {
        fromSocketId: socket.id,
        offer,
        callerInfo
      });
    });

    // WebRTC Signaling: Answer
    socket.on('send-answer', ({ toSocketId, answer }) => {
      io.to(toSocketId).emit('receive-answer', {
        fromSocketId: socket.id,
        answer
      });
    });

    // WebRTC Signaling: ICE Candidate
    socket.on('send-ice-candidate', ({ toSocketId, candidate }) => {
      if (candidate) {
        io.to(toSocketId).emit('receive-ice-candidate', {
          fromSocketId: socket.id,
          candidate
        });
      }
    });

    // Audio Mute/Unmute Sync
    socket.on('toggle-audio', ({ roomId, isMuted }) => {
      if (roomParticipants.has(roomId)) {
        const p = roomParticipants.get(roomId).get(socket.id);
        if (p) p.isAudioMuted = isMuted;
      }
      socket.to(roomId).emit('user-audio-toggle', {
        socketId: socket.id,
        isMuted
      });
    });

    // Video On/Off Sync
    socket.on('toggle-video', ({ roomId, isVideoOff }) => {
      if (roomParticipants.has(roomId)) {
        const p = roomParticipants.get(roomId).get(socket.id);
        if (p) p.isVideoOff = isVideoOff;
      }
      socket.to(roomId).emit('user-video-toggle', {
        socketId: socket.id,
        isVideoOff
      });
    });

    // Screen Share Sync
    socket.on('toggle-screen-share', ({ roomId, isSharing }) => {
      if (roomParticipants.has(roomId)) {
        const p = roomParticipants.get(roomId).get(socket.id);
        if (p) p.isScreenSharing = isSharing;
      }
      socket.to(roomId).emit('user-screen-toggle', {
        socketId: socket.id,
        isSharing
      });
    });

    // Raise Hand Sync
    socket.on('toggle-raise-hand', ({ roomId, isRaised }) => {
      if (roomParticipants.has(roomId)) {
        const p = roomParticipants.get(roomId).get(socket.id);
        if (p) p.isHandRaised = isRaised;
      }
      socket.to(roomId).emit('user-hand-toggle', {
        socketId: socket.id,
        isRaised
      });
    });

    // Meeting Room Chat Messages
    socket.on('send-chat-message', ({ roomId, message }) => {
      const roomMap = roomParticipants.get(roomId);
      const sender = roomMap ? roomMap.get(socket.id) : null;

      const chatPayload = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        senderSocketId: socket.id,
        senderName: sender?.name || 'Student',
        senderUserId: sender?.userId || null,
        message: message?.trim() || '',
        timestamp: new Date().toISOString()
      };

      io.to(roomId).emit('receive-chat-message', chatPayload);
    });

    // Host Ends Meeting for Everyone
    socket.on('end-meeting-for-all', ({ roomId }) => {
      io.to(roomId).emit('meeting-ended-by-host');
      roomParticipants.delete(roomId);
    });

    // Explicit Leave Room
    socket.on('leave-room', ({ roomId }) => {
      handleUserLeave(socket, roomId || currentRoomId);
      socket.leave(roomId || currentRoomId);
    });

    // Disconnect event
    socket.on('disconnect', () => {
      if (currentRoomId) {
        handleUserLeave(socket, currentRoomId);
      }
    });

    function handleUserLeave(sock, rId) {
      if (!rId || !roomParticipants.has(rId)) return;

      const roomMap = roomParticipants.get(rId);
      const participant = roomMap.get(sock.id);

      if (participant) {
        roomMap.delete(sock.id);

        // Notify other participants in the room
        sock.to(rId).emit('user-left', {
          socketId: sock.id,
          userId: participant.userId,
          name: participant.name
        });

        // Clean up empty room map
        if (roomMap.size === 0) {
          roomParticipants.delete(rId);
        }
      }
    }
  });
};

module.exports = initializeMeetingSocket;
