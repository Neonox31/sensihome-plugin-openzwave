
module.exports.attach = function (sensihome, options, done) {
    console.log("%s : function attach not implemented yet !", this.attributes.pkg.name);
    sensihome.toto = 1;
    return done();
};


module.exports.run = function (sensihome, options, done) {
    var self = this;
    function loop() {
        console.log("%s running at %s", self.attributes.pkg.name, Date.now());
	sensihome.toto = sensihome.toto + 1;
        setTimeout(function () {
            loop();
        }, 2000);
    }
    loop();
    return done();   
}

module.exports.detach = function (sensihome, options, done) {
    console.log("%s : function detach not implemented yet !", this.attributes.pkg.name);
    return done();
};

module.exports.attributes = {
    pkg: require("./package.json")
};
