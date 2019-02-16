const DhtSensor = require('./packages/dht-sensor');
const BmpSensor = require('./packages/bmp-sensor');
const AccuWeather = require('./packages/accuweather');
const MqSensor = require('./packages/mq-sensor');

console.log('setup');

// read temperature and humidity
const dhtSensor = new DhtSensor();
dhtSensor.on('data', console.log);

// read air pressure
const bmpSensor = new BmpSensor();
bmpSensor.on('data', console.log);

// get data from accu weather
const accuWeather = new AccuWeather();
accuWeather.on('data', console.log);

// air quality
const mqSensor = new MqSensor('COM4');
mqSensor.on('data', data => {
  console.log('data: ', data);
});
