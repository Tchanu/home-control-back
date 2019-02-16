const EventEmitter = require('events');
const path = require('path');
const { spawn } = require('child_process');

const BAROMETER_BRIDGE_PATH = path.resolve(__dirname, 'read_barometer.py');

/**
 * @module BmpSensor
 * @extends EventEmitter
 * @property {boolean} debug
 */
class BmpSensor extends EventEmitter {
  constructor(interval = 5000) {
    super();

    this.read();
    setInterval(() => this.read(), interval);
  }

  /**
   * @description read data from sensor
   */
  read() {
    const barometerBridgeProcess = spawn('python', [BAROMETER_BRIDGE_PATH]);

    barometerBridgeProcess.stdout.on('data', (out) => {
      try {
        const {
          temp, pressure, altitude, seaLevelPressure,
        } = JSON.parse(out.toString());

        if (this.debug) console.info(temp, pressure, altitude);

        this.emit('data', {
          temp,
          pressure,
          altitude,
          seaLevelPressure,
        });
      } catch (err) {
        if (this.debug) console.trace(err);
        this.emit('error', err);
      }
    });

    barometerBridgeProcess.stderr.on('data', err => this.emit('error', err.toString()));
  }
}

module.exports = BmpSensor;
