var pingstat = require('../');

describe('pingstat', function(){

  it('should be a function', function(done) {
    pingstat.should.be.a('function');
    done();
  })

  it('should emit system info', function(done) {
    
    this.timeout(2000);

    var ping = pingstat({
      delay:100,
      interval:5000
    })

    ping.on('stat', function(data){

      data.cpu.usage.should.be.a('number');
      data.load.load1.should.be.a('number');
      data.system.uptime.should.be.a('number');
      data.memory.used.should.be.a('number');

      (data.load.load1<1).should.equal(true);
      (data.memory.free<data.memory.total).should.equal(true);
      ping.stop();
      done();
    })

    ping.start();
  })

  it('should stop emitting when told', function(done) {
    this.timeout(5000);

    var ping = pingstat({
      delay:100,
      interval:1000
    })

    counter = 0;

    ping.on('stat', function(data){
      counter++;
    })

    ping.start();

    setTimeout(function(){
      ping.stop();
    }, 150)

    setTimeout(function(){
      counter.should.equal(1);
      done();
    }, 1500)
  })


})
