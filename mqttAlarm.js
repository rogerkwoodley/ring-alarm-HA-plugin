#!/usr/bin/env node

/* jshint esversion: 6, undef: true, unused: true, laxcomma: true */

/*
 *
 * To use this: npm install mqtt async doorbot
 *
 */

const RingAPI = require('.');
const mqtt = require('mqtt')
const client = mqtt.connect(process.env.MQTT,{will:{topic:'home/alarm/connected', payload: 'OFF'}});
var security_panel_zid = ''
client.on('connect', function () { 
	client.publish('home/alarm/connected','ON',[retain = true]);
	client.subscribe('homeassistant', function (err) {
		if (!err) { 
			console.log('Connected to mqtt and subscribed to homeassistant channel');
			}
		})
	client.subscribe('home/alarm/#', function (err) {});
})

client.on('message', function(topic, message) {
	if (topic === 'home/alarm/command') {
		var alarm_mode = '';
		console.log(message.toString());
		switch (message.toString()) {
			case 'DISARM': 
				alarm_mode = 'none';
				break;
			case 'ARM_HOME':
				alarm_mode = 'some';
				break;
			case 'ARM_AWAY':
				alarm_mode = 'all';
				break;
			default:
				break;
		}
		ring.stations((err, station) => {
			ring.setAlarmMode(station[0],security_panel_zid,alarm_mode,[],(oops) => {});
		})
	}
})

const ring = RingAPI({
  email: process.env.RING_USERNAME || 'abc@gmail.com',
  password: process.env.RING_PASSPHRASE || 'mypassword',
});


const oops = (s) => {
  console.log(s);
  process.exit(1);
};

ring.stations((err, stations) => {
  if (err) oops('ring.stations: ' + err.toString);

  const fetch = (station, callback) => {
    console.log('station=' + JSON.stringify(station, null, 2));
    
    const now = new Date().getTime();
    const params = { deviceType                 : 'SecuritySystem'
                   , deviceId                   : station.location_id
                   , manufacturer               : 'Ring'
                   , model                      : station.kind
                   , name                       : station.description
                   , serialNumber               : station.id.toString()
                   , firmwareRevision           : station.firmware_version

                    , statusActive               : true

                   , securitySystemAlarmType    : 'TBD: 0(alarm conditions are cleared) OR 1(alarm type not known)'
                   , devices                    : []
                   };

    ring.getAlarmDevices(station, (err, station, message) => {
      console.log('getAlarmDevices: errP=' + (!!err) + ' station=' + station.location_id);
      if (err) {
        console.log(err.toString() + '\n\n');
        return fetch(station, callback);
      }
	message.body.forEach((device) => {
		var sensor_name = device.general.v2.zid
		if (device.general.v2.deviceType === 'sensor.motion') {
			const config_topic = 'homeassistant/binary_sensor/alarm/'+sensor_name+'/config';
			const message = { name	: device.general.v2.name
					, device_class : 'motion'
					, availability_topic : 'home/alarm/connected'
					, payload_available : 'ON'
					, payload_not_available : 'OFF'
					};
			console.log(JSON.stringify(message));
			client.publish(config_topic, JSON.stringify(message));
			const state_topic = 'homeassistant/binary_sensor/alarm/'+sensor_name+'/state';
			const status = device.device.v1.faulted ? 'ON' : 'OFF'; 
			client.publish(state_topic,status);
		}
		if (device.general.v2.deviceType === 'sensor.contact') {
			const topic = 'homeassistant/binary_sensor/alarm/'+sensor_name+'/config';
			const message = { name	: device.general.v2.name
					, device_class : 'door'
					, availability_topic : 'home/alarm/connected'
					, payload_available : 'ON'
					, payload_not_available : 'OFF'
					};
			console.log(JSON.stringify(message));
			client.publish(topic, JSON.stringify(message));
		}
		if (device.general.v2.deviceType === 'security-panel') {
			security_panel_zid = sensor_name;
			const topic = 'homeassistant/alarm_control_panel/alarm/'+sensor_name+'/config';
			const message = { name  : device.general.v2.name
					, state_topic : 'home/alarm/state'
					, command_topic : 'home/alarm/command'
					, availability_topic : 'home/alarm/connected'
					, payload_available : 'ON'
					, payload_not_available : 'OFF'
					};
			console.log(JSON.stringify(message));
			client.publish(topic, JSON.stringify(message));
			var state = 'disarmed'
			switch (device.device.v1.mode) {
				case 'none':
					break;
				case 'some':
					state = 'armed_home';
					break;
				case 'all':
					state = 'armed_away';
					break;
				default:
					state = '';
					break;
			}
			client.publish('home/alarm/state',state);
		}
      });
      ring.setAlarmCallback(station, 'DataUpdate', (err, station, message) => {
        const body = message.body && message.body[0]
            , info = body && body.general && body.general.v2
            , context = body && body.context && body.context.v1 && body.context.v1.device && body.context.v1.device.v1
            , update = {};

        console.log('DataUpdate: errP=' + (!!err) + ' station=' + station.location_id + ' datatype=' + message.datatype);
        if (err) oops(err.toString());
 
        if (message.datatype === 'HubDisconnectionEventType') {
          console.log(JSON.stringify({ info, context, update: { statusActive: false } }, null, 2));
        }

        if (!(info && context && (message.datatype === 'DeviceInfoDocType'))) {
          return console.log('message=' + JSON.stringify(message, null, 2));
        }

//        if (info.deviceType === 'hub.redsky') {
//          console.log(JSON.stringify({ info, context, update: { deviceId: station.location_id, statusActive: true } }, null, 2));
//       }

/*        if (!((info.deviceType === 'sensor.contact') || (info.deviceType === 'sensor.motion'))) {
	         return console.log('deviceType=' + info.deviceType + ' ' + JSON.stringify({ info, context }, null, 2));
	}
*/
        update.deviceId = info.zid;

        info.lastCommTime = new Date(info.lastCommTime).getTime();
        if (!isNaN(info.lastCommTime)) {
          // set device.polling.nextExpectedWakeup = info.lastCommTime + device.polling.pollInterval
        }
	//Construct topic & message to post to MQTT

	var sensor_name = message.context.affectedEntityId;
	var topic = '';
	var status = '';
	if (info.deviceType === 'security-panel') {
		mode = message.body[0].device.v1.mode;
		topic = 'home/alarm/state';
		switch (mode) {
			case 'none':
				status = 'disarmed';
				break;
			case 'some':
				status = 'armed_home';
				break;
			case 'all':
				status = 'armed_away';
				break;
			default:
				status = '';
				break;
			}
		console.log(status);
		return client.publish(topic, status);
	}
        if (info.deviceType === 'sensor.contact') {
		update.faulted = context.faulted ? 'ON' : 'OFF';
		topic = 'homeassistant/binary_sensor/alarm/'+sensor_name+'/state';
		status = update.faulted;
		return client.publish(topic, status);
	};
        if (info.deviceType === 'sensor.motion') {
		update.faulted = context.faulted ? 'ON' : 'OFF';
		topic = 'homeassistant/binary_sensor/alarm/'+sensor_name+'/state';
		status = update.faulted;
		return client.publish(topic, status);
	};
	

        if (info.tamperStatus) update.statusTampered = (info.tamperStatus === 'ok') ? 'NOT_TAMPERED' : 'TAMPERED';

//        console.log(JSON.stringify({ info, context, update }, null, 2));

	client.publish(topic,status);
      });
    });
  };

  stations.forEach((station) => {
    fetch(station, (err, data) => {
      console.log(JSON.stringify(data, null, 2));
    });
  });
});

