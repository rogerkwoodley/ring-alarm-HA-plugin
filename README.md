Ring Alarm MQTT Alarm Panel Home Assistant Integrationn
=====================
This package is based on Dav Glass' [doorbot](https://github.com/davglass/doorbot) package and Homespun's ring-alarm fork (https://github.com/homespun/ring-alarm) and adapted to work with Home Assistant

This code is mostly derivative of the aforementioned repos.  I just added some extras around MQTT discovery with HA since I'm too much of a novice to rewrite this as a true HA plugin.

Installation
------------

* Clone this github
* npm install mqtt async ring-alarm
* Add your Ring credentials and MQTT broker address to mqttAlarm.sh
* ```chmod a+x mqttAlarm.sh
* ```./mqttAlarm.sh

Features:
* Works with MQTT discovery in Home Assistant
* Automagically adds all your contact sensors, motion sensors, and alarm units as sensors in HA
* Updates contact/motion sensor status in real-time as long as mqttAlarm.js script is running
* Alarm panel reflects current alarm mode (based on updates received from Ring API)
* Set alarm mode directly from alarm sensor 
* All sensors will show "Unavailable" if MQTT connection is lost


# Recognition
Many thanks to [davglass](https://github.com/davglass) author of
[doorbot](https://github.com/davglass/doorbot).

Many thanks (also) to [joeyberkovitz ](https://github.com/joeyberkovitz) who submitted a
[PR](https://github.com/davglass/doorbot/pull/27) to the doorbot repository that defined the basic functionality of the alarm api.

Thanks also to [homespun](https://github.com/homespun) for updating doorbot with a functional feature set for the Alarm API.
