Ring.com Alarm API
=====================
This package is based on Dav Glass' [doorbot](https://github.com/davglass/doorbot) package.
However, instead of dealing with Ring's excellent line of video doorbells and spotlights,
this package deals with Ring's alarm station.

Installation
------------

    clone this github
    npm install mqtt async ring-alarm

Usage
-----

    Look at mqttAlarm.js for a proof of concept that will work with MQTT discovery on Home Assistant and add the main alarm status and any contact or motion sensors to your HA UI.  Just update the mqtt server address to match yours.  Currently monitors the status of sensors as long as this script is running.
    
To Dos
* Add alarm status updates to ongoing monitoring.
* Initiate alarm staus changes on discovered alarm devices from HA.
    
# Many Thanks
Many thanks to [davglass](https://github.com/davglass) author of
[doorbot](https://github.com/davglass/doorbot).

Many thanks (also) to [joeyberkovitz ](https://github.com/joeyberkovitz) who submitted a
[PR](https://github.com/davglass/doorbot/pull/27) to the doorbot repository.
