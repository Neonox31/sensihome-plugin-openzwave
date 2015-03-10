
// Local vars
var forceStop = false;

// Exectued once during sensihome core initalization
module.exports.init = function (sensihome, options, done) {
    console.log("init %s plugin", this.attributes.pkg.name);
    return done();
};


module.exports.run = function (sensihome, options, done) {
    sensihome.toto = 1;
    forceStop = false;

    var self = this;
    function loop() {
	console.log("%s running at %s", self.attributes.pkg.name, Date.now());
	sensihome.toto = sensihome.toto + 1;
        var timer = setTimeout(function () {
	    loop();
        }, 2000);
	if (forceStop === true)
	    clearTimeout(timer);
    }
    loop();
    return done();   
}

module.exports.stop = function (sensihome, options, done) {
    forceStop = true;
    console.log("stop %s plugin", this.attributes.pkg.name);
    delete sensihome.toto;
    return done();
};

module.exports.attributes = {
    pkg: require("../package.json")
};
