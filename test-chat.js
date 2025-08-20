const { io } = require('socket.io-client');

const chatId = process.argv[2];
if (!chatId) {
  console.error('❌ ChatId is required! Usage: node test-chat.js <chatId>');
  process.exit(1);
}

const port = process.env.PORT ?? 3000;
const socket = io(`http://localhost:${port}`, {
  transports: ['websocket'],
});

socket.on('connect', () => {
  console.log(`✅ Connected to WS server on port ${port}`);
  socket.emit('subscribeToChat', chatId);
  console.log(`📩 Sent subscribeToChat with chatId=${chatId}`);
});

socket.on('message', (msg) => {
  console.log('💬 New message:', msg);
});

socket.on('connect_error', (err) => {
  console.error('❌ Connection error:', err.message);
});