#!/usr/bin/env node

/* jshint esversion: 6, undef: true, unused: true, laxcomma: true */

/*
 *
 * To use this: npm install mqtt async doorbot
 *
 */

const RingAPI = require('.');
const mqtt = require('mqtt')
const client = mqtt.connect('mqtt://192.168.1.8');

client.on('connect', function () { 
	client.subscribe('homeassistant', function (err) {
		if (!err) { 
			console.log('Connected to mqtt and subscribed to homeassistant ch annel');
			}
		})
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
//		console.log(JSON.stringify(device,null,2));
		console.log('homeassistant/binary_sensor/alarm/'+sensor_name+'/config');
		if (device.general.v2.deviceType === 'sensor.motion') {
			const config_topic = 'homeassistant/binary_sensor/alarm/'+sensor_name+'/config';
			const message = { name	: device.general.v2.name
					, device_class : 'motion'
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
					};
			console.log(JSON.stringify(message));
			client.publish(topic, JSON.stringify(message));
		}
		if (device.general.v2.deviceType === 'security-panel') {
			const topic = 'homeassistant/alarm_control_panel/alarm/'+sensor_name+'/config';
			const message = { name  : device.general.v2.name
					, state_topic : 'home/alarm/state'
					, command_topic : 'home/alarm/command'
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

