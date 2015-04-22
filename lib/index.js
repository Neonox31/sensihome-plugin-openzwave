// Load deendencies
var nconf = require("nconf");
var fs = require('fs');
var OpenZWave = require('openzwave');

// Expose public attributes
var attributes = {
    pkg: require("../package.json"),
    // config,
    // zwave
};

// Exectued once during sensihome core initalization
var init = function (done) {
    console.log("init %s plugin", attributes.pkg.name);

    // Init config
    attributes.config = nconf.file({ file: __dirname + '/../config/config.json' });

    // Init routes
    var routeFilesPath = require("path").join(__dirname, "api/routes");
    fs.readdirSync(routeFilesPath).forEach(function(file) {
        var routes = require(routeFilesPath + '/' + file).call(this.sensihome);
        for (var route in routes) {
            this.sensihome.api.getServer().route(routes[route]);
        }
    });

    // Init zwave
    attributes.zwave = new OpenZWave('/dev/ttyUSB0', {
//	logging: true,
//	consoleoutput: true,
        saveconfig: true,
    });

    return done();
};


var run = function (done) {
    attributes.zwave.nodes = {};
    
    attributes.zwave.on('driver ready', function(homeid) {
	console.log('scanning homeid=0x%s...', homeid.toString(16));
    });
    
    attributes.zwave.on('driver failed', function() {
	console.log('failed to start driver');
	attributes.zwave.disconnect();
    });

    attributes.zwave.on('node added', function(nodeid) {
	attributes.zwave.nodes[nodeid] = {
            manufacturer: '',
            manufacturer_id: '',
            product: '',
            product_type: '',
            product_id: '',
            type: '',
            name: '',
            loc: '',
            classes: {},
            ready: false,
	};
    });
    
    attributes.zwave.on('value added', function(nodeid, comclass, value) {
	if (!attributes.zwave.nodes[nodeid]['classes'][comclass])
            attributes.zwave.nodes[nodeid]['classes'][comclass] = {};
	attributes.zwave.nodes[nodeid]['classes'][comclass][value.index] = value;
    });
    
    attributes.zwave.on('value changed', function(nodeid, comclass, value) {
	if (attributes.zwave.nodes[nodeid]['ready']) {
            console.log('node%d: changed: %d:%s:%s->%s', nodeid, comclass,
			value['label'],
			attributes.zwave.nodes[nodeid]['classes'][comclass][value.index]['value'],
			value['value']);
	}
	attributes.zwave.nodes[nodeid]['classes'][comclass][value.index] = value;
    });
    
    attributes.zwave.on('value removed', function(nodeid, comclass, index) {
	if (attributes.zwave.nodes[nodeid]['classes'][comclass] &&
            attributes.zwave.nodes[nodeid]['classes'][comclass][index])
            delete attributes.zwave.nodes[nodeid]['classes'][comclass][index];
    });
    
    attributes.zwave.on('node ready', function(nodeid, nodeinfo) {
	attributes.zwave.nodes[nodeid]['manufacturer'] = nodeinfo.manufacturer;
	attributes.zwave.nodes[nodeid]['manufacturer_id'] = nodeinfo.manufacturerid;
	attributes.zwave.nodes[nodeid]['product'] = nodeinfo.product;
	attributes.zwave.nodes[nodeid]['product_type'] = nodeinfo.producttype;
	attributes.zwave.nodes[nodeid]['product_id'] = nodeinfo.productid;
	attributes.zwave.nodes[nodeid]['type'] = nodeinfo.type;
	attributes.zwave.nodes[nodeid]['name'] = nodeinfo.name;
	attributes.zwave.nodes[nodeid]['loc'] = nodeinfo.loc;
	attributes.zwave.nodes[nodeid]['ready'] = true;
	console.log('node%d: %s, %s', nodeid,
		    nodeinfo.manufacturer ? nodeinfo.manufacturer
                    : 'id=' + nodeinfo.manufacturerid,
		    nodeinfo.product ? nodeinfo.product
                    : 'product=' + nodeinfo.productid +
                    ', type=' + nodeinfo.producttype);
	console.log('node%d: name="%s", type="%s", location="%s"', nodeid,
            nodeinfo.name,
		    nodeinfo.type,
		    nodeinfo.loc);
	for (comclass in attributes.zwave.nodes[nodeid]['classes']) {
            switch (comclass) {
            case 0x25: // COMMAND_CLASS_SWITCH_BINARY
            case 0x26: // COMMAND_CLASS_SWITCH_MULTILEVEL
		attributes.zwave.enablePoll(nodeid, comclass);
		break;
            }
            var values = attributes.zwave.nodes[nodeid]['classes'][comclass];
            console.log('node%d: class %d', nodeid, comclass);
            for (idx in values)
		console.log('node%d:   %s=%s', nodeid, values[idx]['label'], values[idx]['value']);
	}
    });
    
    attributes.zwave.on('notification', function(nodeid, notif) {
	switch (notif) {
	case 0:
            console.log('node%d: message complete', nodeid);
            break;
	case 1:
            console.log('node%d: timeout', nodeid);
            break;
	case 2:
            console.log('node%d: nop', nodeid);
            break;
	case 3:
            console.log('node%d: node awake', nodeid);
            break;
	case 4:
            console.log('node%d: node sleep', nodeid);
            break;
	case 5:
            console.log('node%d: node dead', nodeid);
            break;
	case 6:
            console.log('node%d: node alive', nodeid);
            break;
        }
    });
    
    attributes.zwave.on('scan complete', function() {
	console.log('scan complete, hit ^C to finish.');
    });
    
    attributes.zwave.connect();
    return done();   
}

var stop = function (sensihome, options, done) {
    attributes.zwave.disconnect();
    console.log("stop %s plugin", attributes.pkg.name);
    return done();
};

module.exports = {
    attributes: attributes,
    init: init,
    run: run,
    stop: stop
}
