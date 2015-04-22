// Load dependencies
var Joi = require('joi');

// Local vars
var pkg = require("../../../package.json");
var controller = require("../controllers/nodes.js");
var plugin = /^sensihome-plugin-(.*)$/.exec(pkg.name)[1];

module.exports = function() {
    return (    
	[

	    /**
	     * GET /api/v1/plugins/{plugin}/nodes/{id?}
	     *
	     * @description
	     *   Get OpenZwave nodes
	     *
	     * @return
	     *   200
	     */
	    
	    {
		method: 'GET',
		path: '/api/v1/plugins/' + plugin + '/nodes/{id?}',
		handler: controller.get.bind(this),
		config : {
		    validate: {
			params: {
			    id: Joi.number()
			}
		    }
		}
	    },

	    /**
             * PUT /api/v1/plugins/{plugin}/nodes/{id}/classes/{code}/indexes/{index}
             *
             * @description
             *   Set an OpenZwave class value
             *
             * @return
             *   200
             */

            {
                method: 'PUT',
                path: '/api/v1/plugins/' + plugin + '/nodes/{id}/classes/{code}/indexes/{index}',
                handler: controller.setValue.bind(this),
                config : {
                    validate: {
                        params: {
                            id: Joi.number(),
			    code: Joi.number(),
			    index: Joi.number()
                        },
			payload: {
			    value: Joi.required()
			}
                    }
                }
            },

	]
    )
}
