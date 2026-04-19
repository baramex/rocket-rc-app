require('dotenv').config();

const { SerialPort, ReadlineParser } = require('serialport');

SerialPort.list().then(console.log).catch(console.error);

const port = new SerialPort({ baudRate: 9600, path: process.env.SERIAL_PORT });
const parser = port.pipe(new ReadlineParser());

let lastStatus = null;

port.on("open", () => {
    console.log('serial port open');
});
parser.on('data', data => {
    const type = data[0];
    if (type != 'S' && (lastStatus != 3 || lastStatus != 4)) { // Takingoff or gliding
        return;
    }
    try {
        switch (type) {
            case 'S':
                lastStatus = parseInt(data[1]);
                sendStatus(lastStatus);
                break;
            case 'L':
                const [latitude, longitude] = data.slice(1).split(',').map(parseFloat);
                sendLocation(latitude, longitude);
                break;
            case 'M':
                const [leftMotor, rightMotor] = data.slice(1).split(',').map(parseInt);
                sendMotors(leftMotor, rightMotor);
                break;
            case 'A':
                const altitude = parseFloat(data.slice(1));
                sendAltitude(altitude);
                break;
        }
    }
    catch (e) {
        console.error(e);
    }
});

function api(endpoint, data) {
    return axios({
        method: "POST",
        url: "http://localhost:1241" + endpoint,
        data,
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
            Authorisation: "Bearer " + process.env.POST_KEY
        }
    });
}

function sendStatus(status) {
    return api("/payload/status", { status });
}

function sendLocation(latitude, longitude) {
    return api("/payload/location", { latitude, longitude });
}

function sendMotors(leftMotor, rightMotor) {
    return api("/payload/motors", { leftMotor, rightMotor });
}

function sendAltitude(altitude) {
    return api("/payload/altitude", { altitude });
}