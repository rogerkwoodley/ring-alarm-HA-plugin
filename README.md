Ring.com Alarm Home Assistant Plugin
=====================
This package is based on Dav Glass' [doorbot](https://github.com/davglass/doorbot) package and Homespun's ring-alarm fork (https://github.com/homespun/ring-alarm) and adapted to work with Home Assistant

Installation
------------

    clone this github
    npm install mqtt async ring-alarm

Usage
-----

Look at mqttAlarm.js for a proof of concept that will work with MQTT discovery on Home Assistant and add the main alarm status and any contact or motion sensors to your HA UI.  Just update the mqtt server address to match yours.  Currently monitors the status of sensors as long as this script is running.

Features:
* Works with MQTT discovery in Home Assistant
* Automagically adds all your contact sensors, motion sensors, and alarm units in HA
* Updates contact/motion sensor status in real-time as long as mqttAlarm.js script is running

To Dos
* Add alarm status updates to ongoing monitoring.
* Allow alarm to be set from HA.
* Change alarm siren/voice prompt volumes from HA.
    
# Recognition
Many thanks to [davglass](https://github.com/davglass) author of
[doorbot](https://github.com/davglass/doorbot).

Many thanks (also) to [joeyberkovitz ](https://github.com/joeyberkovitz) who submitted a
[PR](https://github.com/davglass/doorbot/pull/27) to the doorbot repository that defined the basic functionality of the alarm api.

Thanks also to [homespun](https://github.com/homespun) for updating doorbot with a functional feature set for the Alarm API.
