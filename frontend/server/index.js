const express = require('express');
const connectDB = require('./config/database');
require('dotenv').config();
const cors = require('cors')
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const semesterRoutes = require('./routes/semesterRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const noteRoutes = require('./routes/noteRoutes');
const savedNoteRoutes = require('./routes/savedNoteRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const http = require('http');
const { Server } = require('socket.io');
const meetingRoutes = require('./routes/meetingRoutes');
const initializeMeetingSocket = require('./socket/meetingSocket');

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);
const allowOrigin = ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://qknotes.netlify.app', process.env.CLIENT_URL].filter(Boolean)
const io = new Server(server, {
  cors: {
    origin: allowOrigin,
    credentials: true
  }
});

const PORT = process.env.PORT || 3000;
app.use(cors({
  origin:allowOrigin,
  credentials: true
})); 
app.use(express.json());  
app.use(cookieParser());
connectDB();

// Initialize WebRTC signaling socket
initializeMeetingSocket(io);

// Route registration
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/semesters', semesterRoutes);
app.use('/api/subjects', subjectRoutes); 
app.use('/api/notes', noteRoutes);
app.use('/api/saved-notes', savedNoteRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/meetings', meetingRoutes);

app.get('/', (req, res) => {
  res.send('Server is running');
});

server.listen(PORT, () => {
    console.log(`Server running with Socket.IO on http://localhost:${PORT}`);
});
 
