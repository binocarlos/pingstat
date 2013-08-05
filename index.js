var fs = require('fs');
var _ = require('lodash');
var osnode = require("os");
var exec = require('child_process').exec;

var os  = require('os-utils');
var async = require('async');
var StatsDClient = require('statsd-client');

var hostname = osnode.hostname();
var stats = new StatsDClient({host: 'hq.local', port: 8125, prefix: 'server.' + hostname,  debug: false});

var config = {
	pidfolder:'/srv/diggerstack/run',
	startdelay:1,
	monitordelay:5000,
	systemdelay:5000
}

if(fs.existsSync(__dirname + '/config.json')){
	config = _.extend(config, require(__dirname + '/config.json'));
}

/*

	reads the mongroup run folder for pids
	

function getpids(){
	var files = fs.readdirSync(config.pidfolder);

	function filtermongroups(file){
		return !file.match(/\.mon\.pid$/);
	}

	function loadpidnumber(file){
		return fs.readFileSync(config.pidfolder + '/' + file, 'utf8').replace(/\W/g, '');
	}

	return _.map(_.filter(files, filtermongroups), loadpidnumber)
}

function start(){
	return;
	var pids = getpids();

	var group = procmon.monitor({
	  pid: pids.splice(0,2),
	  interval: config.monitordelay,
	  format: 'PID {pid} - {cpu}% CPU - {mem} memory'
	}).start();

	group.on('stats', function(stats) {
	  console.log(stats.out);
	});

	console.dir(pids);
}
*/
function systemmonitor(){

	async.parallel({
		os:function(done){
			os.cpuUsage(function(v){

				var packet = {
					cpu:{
						usage:v
					},
					memory:{
						total:os.totalmem(),
						free:os.freemem(),
						percentfree:os.freememPercentage()
					},
					load:{
						load1:os.loadavg(1),
						load5:os.loadavg(5),
						load15:os.loadavg(15)
					},
					system:{
						uptime:os.sysUptime()
					}

				}

				_.each(packet, function(obj, groupname){
					_.each(obj, function(val, prop){
						stats.gauge(groupname + '.' + prop, val);
					})
				})

			})
		},
		realmem:function(){
			exec('free',
			  function (error, stdout, stderr) {
			  	_.each(stdout.split(/\n/), function(line){
			  		line.replace(/buffers\/cache\D+(\d+)\D+(\d+)/, function(){
			  			stats.gauge('memory.real_used', parseInt(arguments[1]));
			  			stats.gauge('memory.real_free', parseInt(arguments[2]));
			  		})
			  	})
			});
		}
	}, function(error, data){

	})

}

/*

	we delay a small part because we want the services to get started
	
*/
//setTimeout(start, config.startdelay);
setInterval(systemmonitor, config.systemdelay);
systemmonitor();