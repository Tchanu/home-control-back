const BmpSensor = require('./packages/bmp-sensor');
const DhtSensor = require('./packages/dht-sensor');

console.log('setup');

// read temperature and humidity
const dhtSensor = new DhtSensor();
dhtSensor.on('data', console.log);

// read air pressure
const bmpSensor = new BmpSensor();
bmpSensor.on('data', console.log);

