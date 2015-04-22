/** Nodes controller **/

// Load dependencies
var Boom = require('boom');

// Load sensihome dependencies
//var SensihomeError = require('../../error.js');

// Local vars
var pkg = require("../../../package.json");

module.exports.get = function(request, reply) {
    // `this` - is a reference to sensihome scope
    // Check if plugin installed and running
    if (this.plugins._plugins[pkg.name].running !== true) {
	// 400 : Bad request
	return reply(Boom.badRequest(pkg.name + " is not running."));
    }
    if (request.params.id) {
	if (!this.plugins._plugins[pkg.name].instance.attributes.zwave.nodes[request.params.id]) {
	    //404 : Not found
	    return reply(Boom.notFound("node " + request.params.id + " not found."));
	}
	return reply(this.plugins._plugins[pkg.name].instance.attributes.zwave.nodes[request.params.id]);
    }
    reply(this.plugins._plugins[pkg.name].instance.attributes.zwave.nodes);
};

module.exports.setValue = function(request, reply) {
    // `this` - is a reference to sensihome scope
    // Check if plugin installed and running
    if (this.plugins._plugins[pkg.name].running !== true) {
        // 400 : Bad request
        return reply(Boom.badRequest(pkg.name + " is not running."));
    }
    if (!this.plugins._plugins[pkg.name].instance.attributes.zwave.nodes[request.params.id]) {
        //404 : Not found
        return reply(Boom.notFound("node " + request.params.id + " not found."));
    }
    if (!this.plugins._plugins[pkg.name].instance.attributes.zwave.nodes[request.params.id]["classes"][request.params.code]) {
        //404 : Not found
        return reply(Boom.notFound("class " + request.params.code + " not found for node " + request.params.id + "."));
    }
    if (!this.plugins._plugins[pkg.name].instance.attributes.zwave.nodes[request.params.id]["classes"][request.params.code][request.params.index]) {
        //404 : Not found
        return reply(Boom.notFound("index " + request.params.index  + " not found for class " + request.params.code + "."));
    }

    var value = request.payload.value;
    // If type is boolean, cast string payload parameter to boolean
    if (this.plugins._plugins[pkg.name].instance.attributes.zwave.nodes[request.params.id]["classes"][request.params.code][request.params.index]["type"] === "bool")
	var value = (request.payload.value === 'true');
    this.plugins._plugins[pkg.name].instance.attributes.zwave.setValue(request.params.id, request.params.code, request.params.index, value);
    
    // 202 : Accepted
    reply().code(202);
};
