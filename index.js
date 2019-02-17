const path = require('path');
const LiteDb = require('./packages/lite-db'); // sqlite3
const DhtSensor = require('./packages/dht-sensor'); // temperature and humidity
const BmpSensor = require('./packages/bmp-sensor'); // air pressure
const MqSensor = require('./packages/mq-sensor'); // air quality
const AccuWeather = require('./packages/accuweather'); // weather data from accuweather

//
const dhtSensor = new DhtSensor();
const bmpSensor = new BmpSensor();
const mqSensor = new MqSensor('/dev/ttyACM0', 115200);
const accuWeather = new AccuWeather();

//
const dhtDb = new LiteDb(path.resolve(__dirname, 'data/dht.db'));
const bmpDb = new LiteDb(path.resolve(__dirname, 'data/bmp.db'));
const mqDb = new LiteDb(path.resolve(__dirname, 'data/mq.db'));
const accuWeatherDb = new LiteDb(path.resolve(__dirname, 'data/accuweather.db'));


const dhtHandler = db => ({ temp, humidity }) => {
  db.query(`INSERT INTO readings ("temp", "humidity", "date", "time") VALUES(${temp},${humidity}, CURRENT_DATE, CURRENT_TIME)`);
};

const bmpbHandler = db => ({ temp, pressure }) => {
  db.query(`INSERT INTO readings ("temp", "pressure", "date", "time") VALUES(${temp},${pressure}, CURRENT_DATE, CURRENT_TIME)`);
};

const mqHandler = db => ({ quality }) => {
  db.query(`INSERT INTO readings ("quality", "date", "time") VALUES(${quality}, CURRENT_DATE, CURRENT_TIME)`);
};

const accuWeatherHandler = db => (data) => {
  const {
    temp, weatherIcon, isDayTime, weatherText,
  } = data;
  db.query(`
    INSERT INTO readings ("temp", "weatherIcon", "isDayTime", "weatherText", "date", "time")
    VALUES(${temp}, ${weatherIcon}, ${isDayTime}, '${weatherText}', CURRENT_DATE, CURRENT_TIME)
  `);
};

dhtSensor.on('data', dhtHandler(dhtDb));
bmpSensor.on('data', bmpbHandler(bmpDb));
mqSensor.on('data', mqHandler(mqDb));
accuWeather.on('data', accuWeatherHandler(accuWeatherDb));
