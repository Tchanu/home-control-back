const EventEmitter = require('events');
const sensor = require('node-dht-sensor');

/**
 * @module DhtSensor
 * @extends EventEmitter
 * @property {number} gpio
 * @property {boolean} debug
 */
class DhtSensor extends EventEmitter {
  constructor(gpio = 4, interval = 300000) {
    super();
    this.GPIO = gpio;

    this.read();
    setInterval(() => this.read(), interval);
  }

  /**
   * @description read data from sensor
   */
  read() {
    sensor.read(22, this.GPIO, (err, temp, humidity) => {
      if (err) {
        if (this.debug) console.trace(err);
        this.emit('error', err);
        return;
      }

      if (this.debug) console.info(temp, humidity);

      this.emit('data', {
        temp,
        humidity,
      });
    });
  }
}

module.exports = DhtSensor;
