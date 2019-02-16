#!/usr/bin/python
import sys
import Adafruit_BMP.BMP085 as BMP085

sensor = BMP085.BMP085(mode=BMP085.BMP085_HIGHRES)

print('{')
print('  "temp": {0:0.2f},'.format(sensor.read_temperature()))
print('  "pressure": {0:0.0f},'.format(sensor.read_pressure()))
print('  "altitude": {0:0.0f},'.format(sensor.read_altitude()))
print('  "seaLevelPressure": {0:0.0f}'.format(sensor.read_sealevel_pressure()))
print('}')
sys.stdout.flush()
