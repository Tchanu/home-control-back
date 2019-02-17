const EventEmitter = require('events');
const fetch = require('node-fetch');

const URL = 'http://dataservice.accuweather.com/currentconditions/v1/locationKey';

const errors = {
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
};

/**
 * @class AccuWeather
 * @extends EventEmitter
 * @property {string} apyKey
 * @property {number} locationKey
 * @property {boolean} debug
 */
class AccuWeather extends EventEmitter {
  constructor(apyKey = 'fJIzI57v6u6aKaIloSQCACKQdDTPsQsA', locationKey = 806852, debug = false, mock = true) {
    super();

    this.apyKey = apyKey;
    this.locationKey = locationKey;
    this.debug = debug;
    this.mock = mock;

    this.read();
    setInterval(() => this.read(), 1800000);
  }

  /**
   * @description read data from sensor
   */
  async read() {
    if (this.mock) {
      this.emit('data', {
        temp: 20,
        weatherIcon: 1,
        isDayTime: true,
        weatherText: 'Fake Weather',
      });
      return;
    }

    const response = await fetch(`${URL}?apikey=${this.apyKey}&locationKey=${this.locationKey}`)
      .then(res => res.json());
    if (response.Code === 'ServiceUnavailable') {
      this.emit('error', { error: errors.SERVICE_UNAVAILABLE });
      return;
    }

    if (this.debug) console.info(response);

    const [station] = response;
    const data = {
      temp: station.Temperature.Metric.Value,
      weatherIcon: station.WeatherIcon,
      isDayTime: station.IsDayTime,
      weatherText: station.WeatherText,
    };

    this.emit('data', data);
  }
}

module.exports = AccuWeather;
