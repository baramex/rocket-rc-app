require('dotenv').config();

const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

const port = new SerialPort(process.env.SERIAL_PORT, { baudRate: 9600 });
const parser = port.pipe(new Readline({ delimiter: '\n' }));

port.on("open", () => {
    console.log('serial port open');
});
parser.on('data', data => {
    console.log('got word from arduino:', data);
});