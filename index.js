
var exec = require('child_process').exec;
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var os  = require('os-utils');
var async = require('async');

function Monitor(options){
	this.options = options || {
		delay:1000,
		interval:5000
	}
}

util.inherits(Monitor, EventEmitter);

Monitor.prototype.interval = function(delay){
	this.options.interval = interval;
	this.stop();
	this.start();
	return this;
}

Monitor.prototype.start = function(){
	var self = this;
	this.interval_id = setTimeout(function(){
		self.stat();
		self.interval_id = setInterval(function(){
			self.stat();
		}, self.options.interval || 5000);
	}, self.options.delay || 1000);
	
	return this;
}

Monitor.prototype.stop = function(){
	if(this.interval_id){
		clearInterval(this.interval_id);	
	}
	return this;
}

Monitor.prototype.stat = function(){
	var self = this;
	async.parallel({
		os:function(done){
			os.cpuUsage(function(v){

				var packet = {
					cpu:{
						usage:v
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

				done(null, packet);
			})
		},
		memory:function(next){
			exec('free',
			  function (error, stdout, stderr) {
			  	(stdout.split(/\n/)).forEach(function(line){
			  		line.replace(/buffers\/cache\D+(\d+)\D+(\d+)/, function(){
			  			var used = parseInt(arguments[1]);
			  			var free = parseInt(arguments[2]);
			  			var total = used + free;
			  			next(null, {
			  				used:used,
			  				free:free,
			  				total:total
			  			})
			  		})
			  	})
			});
		}
	}, function(error, data){
		var packet = data.os || {};
		packet.memory = data.memory;
		self.emit('stat', packet);
	})
}

module.exports = function(options){
	return new Monitor(options);
}