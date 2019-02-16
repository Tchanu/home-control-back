const EventEmitter = require('events');
const SerialPort = require('serialport');
const Delimiter = require('@serialport/parser-delimiter');

const errors = {
  NOT_READY: 'NOT_READY',
  WRITE_DENIED: 'WRITE_DENIED',
};

/**
 * @description Read mq-135 using Arduino mega
 * @module MqSensor
 * @extends EventEmitter
 * @property {boolean} debug
 */
class MqSensor extends EventEmitter {
  constructor(comPort, baudRate = 9600) {
    super();
    this.isReady = false;

    this.port = new SerialPort(comPort, { baudRate });
    this.port.pipe(new Delimiter({ delimiter: '\r\n' }));

    this.port.on('open', () => {
      if (this.debug) console.info('Serial port is open.');
      this.isReady = true;

      // start reading data
      this.read();
      setInterval(() => this.read(), 5000);
    });

    this.port.on('data', (raw) => {
      this.isReady = true;
      const data = raw.toString()
        .replace('\n', '');
      if (!data || data.length < 3) return;

      const quality = parseInt(data, 10);

      if (Number.isNaN(quality)) return;

      if (this.debug) console.info(data);


      this.emit('data', { quality });
    });
  }

  read() {
    if (!this.isReady) {
      this.emit('error', { error: errors.NOT_READY });
      return;
    }
    this.isReady = false;
    // send read command
    this.port.write('R', (err) => {
      this.isReady = true;
      if (!err) return;
      if (this.debug) console.trace(err);
      this.emit('error', { error: errors.WRITE_DENIED });
    });
  }
}

module.exports = MqSensor;
