Ring Alarm Home Assistant Plugin
=====================
This package is based on Dav Glass' [doorbot](https://github.com/davglass/doorbot) package and Homespun's ring-alarm fork (https://github.com/homespun/ring-alarm) and adapted to work with Home Assistant

This code is mostly derivative of the aforementioned repos.  I just added some extras around MQTT discovery with HA since I'm too much of a novice to rewrite this as a true HA plugin.

Installation
------------

Clone this github
npm install mqtt async ring-alarm
Add your Ring credentials to either test.js or mqttAlarm.js (or set the environmental variables for RING_USERNAME and RING_PASSPHRASE)
Set the enviromental variable MQTT to your MQTT broker (whether the internal HA one or an external one)
```node mqttAlarm.js```


Features:
* Works with MQTT discovery in Home Assistant
* Automagically adds all your contact sensors, motion sensors, and alarm units in HA
* Updates contact/motion sensor status in real-time as long as mqttAlarm.js script is running
* Alarm sensor reflects current status of alarm (when set by Ring app)
* Can set alarm mode directly from alarm sensor 

To Dos
* Change alarm siren/voice prompt volumes from HA.
* Verify that script will re-initiate callbacks for status updates if/when socket is terminated by server.

# Recognition
Many thanks to [davglass](https://github.com/davglass) author of
[doorbot](https://github.com/davglass/doorbot).

Many thanks (also) to [joeyberkovitz ](https://github.com/joeyberkovitz) who submitted a
[PR](https://github.com/davglass/doorbot/pull/27) to the doorbot repository that defined the basic functionality of the alarm api.

Thanks also to [homespun](https://github.com/homespun) for updating doorbot with a functional feature set for the Alarm API.
