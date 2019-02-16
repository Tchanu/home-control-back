const DhtSensor = require('./packages/dht-sensor');

console.log('setup');
// read temperature and humidity
const dhtSensor = new DhtSensor();
dhtSensor.on('data', console.log);
