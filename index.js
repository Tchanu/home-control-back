const express = require('express');
const gpio = require('rpi-gpio');
const bodyParser = require('body-parser');
const bluebird = require('bluebird');
const redis = require('redis');
const sensor = require('node-dht-sensor');
const fetch = require('node-fetch');

const client = redis.createClient();
const app = express()
const gpiop = gpio.promise;

const RELAYS = [16, 18];
const state = {
    0: 0,
    1: 0,
};
const accuWeather = {
    url: "http://dataservice.accuweather.com/currentconditions/v1/locationKey?apikey=fJIzI57v6u6aKaIloSQCACKQdDTPsQsA&locationKey=806852",
    lastHeartBeatTime: 0,
    data: {},
};


const relayBusy = {};


async function write(_relay, value) {
    if (relayBusy[_relay]) {
        return Promise.reject('BUSY');
    }
    relayBusy[_relay] = true;
    setTimeout(() => {
        relayBusy[_relay] = false;
    }, 100);
    try {
        client.set("relay:" + _relay, value);
        return gpiop.write(_relay, value);
    } catch (err) {
        console.error(err);
    }
}

function _readSensor() {
    return new Promise((resolve, reject) => {
        sensor.read(22, 4, (err, temp, humidity) => {
            console.log(err);
            if (!err) {
                resolve({temp: temp, humidity: humidity});
            } else {
                reject(err)
            }
        });
    });
}

async function _fetchAccuWeather() {
    try {
        if (accuWeather.lastHeartBeatTime + 1800000 < new Date().getTime()) {
            const res = await fetch(accuWeather.url)
                .then(res => res.json());
            if (res.Code === 'ServiceUnavailable') {
                return {
                    temp: 0,
                    weatherIcon: 0,
                    isDayTime: true,
                    weatherText: "---",
                };
            }

            accuWeather.data = res;
            accuWeather.lastHeartBeatTime = new Date().getTime();
        }

        const gldaniWeather = accuWeather.data[0];
        return {
            temp: gldaniWeather.Temperature.Metric.Value,
            weatherIcon: gldaniWeather.WeatherIcon,
            isDayTime: gldaniWeather.IsDayTime,
            weatherText: gldaniWeather.WeatherText,
        };
    } catch (err) {
        console.error(err);
    }
}

async function _readBarometer() {
	return new Promise((resolve,reject)=> {
    const spawn = require("child_process").spawn;
  	const pythonProcess = spawn('python',["./python_scripts/read_barometer.py"]);
    pythonProcess.stdout.on('data', data => {
      try {
        resolve(JSON.parse(data.toString()));
      } catch(err) {
        reject(err);
      }    
    });
  });
}

async function setup() {
    await bluebird.each(RELAYS, relay => {
        return gpiop.setup(relay, gpio.DIR_OUT);
    });
    // restore relays to old state
    await bluebird.each(RELAYS, relay => {
        return client.get(`relay:${relay}`, (err, val) => {
            if (err) {
                return console.error(err);
            }
            return write(relay, Number(val));
        })
    });
}


app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({extended: true})); // for parsing application/x-www-form-urlencoded

app.post('/control', async (req, res) => {
    console.log('CONTROL', req.body.relay, req.body.value);
    try {
        if (state[req.body.relay] === req.body.value) {
            return res.send({status: 'ALREADY'});
        }

        await write(RELAYS[req.body.relay], req.body.value);
        state[req.body.relay] = req.body.value
        return res.send({status: 'OK'});
    } catch (err) {
        console.error(err);
        return res.send({status: 'BUSY'});
    }
});

app.get('/state', (req, res) => {
    res.send(state);
});

app.get('/sensors', async (req, res) => {
    try {
        const tempInside = await _readSensor();
        const tenoOutside = await _fetchAccuWeather();
        const { pressure: pressureInside, temp: barometerTemp } = await _readBarometer();
        res.send({
            inside: tempInside,
            outside: tenoOutside,
            pressure: pressureInside,
            barometerTemp: barometerTemp,
        });
    } catch (err) {
        res.send({error: err});
    }
});

app.listen(3000);

client.on("error", (err) => {
    console.error(err);
});

setup();
