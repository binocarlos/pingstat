pingstat
========

System monitor event emitter

## installation

	$ npm install pingstat

## usage

```js
var pingstat = require('pingstat');

// run the monitor every 10 seconds after 1 second delay
var ping = pingstat({
	delay:1000,
	interval:10000
})

/*

	data is:

	 {
    "cpu": {
        "usage": 0
    },
    "load": {
        "load1": 0.03271484375,
        "load5": 0.041015625,
        "load15": 0.04541015625
    },
    "system": {
        "uptime": 27171.171459071
    },
    "memory": {
        "used": 287416,
        "free": 731252,
        "total": 1018668
    }
	}


	
*/
ping.on('stat', function(data){
	
})

// start monitoring
ping.start();

// stop monitoring after 15 seconds (i.e. do it once)
setTimeout(function(){
	ping.stop();
}, 15000)

```

## licence

MIT