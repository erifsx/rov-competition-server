const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sassMiddleware = require('node-sass-middleware');
const LiveCam = require('livecam');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const fs = require('fs');
const yaml = require('js-yaml');
const config = yaml.safeLoad(fs.readFileSync('config.yaml', 'utf8'));

// var usersRouter = require('./routes/users');



const webcam_server = new LiveCam({
    // address and port of the webcam UI
    'ui_addr': '0.0.0.0',
    'ui_port': 11000,

    // address and port of the webcam Socket.IO server
    // this server broadcasts GStreamer's video frames
    // for consumption in browser side.
    'broadcast_addr': '0.0.0.0',
    'broadcast_port': 12000,

    // address and port of GStreamer's tcp sink
    'gst_tcp_addr': '127.0.0.1',
    'gst_tcp_port': 10000,

    // callback function called when server starts
    'start': function () {
        console.log('WebCam server started!');
    },

    // webcam object holds configuration of webcam frames
    'webcam': {
        // should width of the frame be resized (default : 0)
        // provide 0 to match webcam input
        'width': config.webcam.width,

        // should height of the frame be resized (default : 0)
        // provide 0 to match webcam input
        'height': config.webcam.height,

        // framerate of the feed (default : 0)
        // provide 0 to match webcam input
        'framerate': config.webcam.framerate
    }
});

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(sassMiddleware({
    src: path.join(__dirname, 'public'),
    dest: path.join(__dirname, 'public'),
    indentedSyntax: false, // true = .sass and false = .scss
    sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));
//
// app.use('/users', usersRouter);
//
// function getSerialDevices() {
//     return fs.readdirSync('/dev').filter(f => f.indexOf('/dev/ttyUSB') === 0);
// }


// Init for the websocket server that connects websocket input to serial output
function ws_server(io) {
    const serialPort = new SerialPort(config.robot_serial.port, {baudRate: config.robot_serial.baudrate, autoOpen: false});


    serialPort.open(serialPortError => {
        const parser = new Readline();
        serialPort.pipe(parser);

        parser.on('data', line => console.log(`> ${line}`));

        io.on('connection', function (socket) {
            console.log('got connection', socket);

            socket.emit('message', 'server connected');
            if(serialPortError) {
                socket.emit('robot-status', 'disconnected');
                socket.emit('message', `Could not connect to robot -- ${serialPortError.message}`);
            } else {
                socket.emit('robot-status', 'connected');
            }

            socket.on('gamepad', joyVal => {
                // console.log(joyVal);
                serialPort.write(`${JSON.stringify(joyVal)}\n`, err => {
                    if(err) {
                       socket.emit('message', `cmd failed: ${err.message}`);
                    } else {
                        socket.emit('message', `cmd: ${JSON.stringify(joyVal)}`);
                    }
                });
            });
        });
    });
}

if(config.webcam.enabled) {
    webcam_server.broadcast();
}


module.exports.app = app;
module.exports.ws_server = ws_server;