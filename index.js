const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const gsmModem = require('serialport-gsm');

// Initialize Express and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from React frontend
app.use(express.static('GSM-frontend/dist'));

// Configure the GSM modem
const modem = gsmModem.Modem();
const options = {
    baudRate: 115200,   // Adjust to your modem's baud rate
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    rtscts: false,
    xon: false,
    xoff: false,
    xany: false,
    autoDeleteOnReceive: true,  // Auto delete messages after reading
    enableConcatenation: true   // For multipart SMS
};

// Open modem connection
modem.open('COM3', options);    // Adjust 'COM3' to your modem's port

// Listen for modem after connection
modem.on('open', () => {
    console.log('Modem connected');

    modem.initializeModem((response) => {
        console.log('Modem initialized', response);

        // Enable incoming message notifications
        modem.on('onNewMessage', (message) => {
            console.log('New SMS received:', message);

            // Send the SMS to the frontend via WebSocket
            io.emit('new_sms', message);
        });
    });
});

// Error handling
modem.on('error', (err) => {
    console.log('Modem error:', err);
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
