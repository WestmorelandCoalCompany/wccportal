/*
 *  name: api
 *  path: apps/afe/entities/projects/api
 *  desc: 
 */

define([
    'apps/afe/entities/projects/models',
    'marionette.m'
], function (Models, M) {
    var API = {},
        name = 'projects';

    API.Controller = M.Controller.extend({
        //  Configuration
        //  -------------

        // Channels
        channels: {
            api: {
                name: 'afe:api',
                events: {
                    reply: {
                        'projects:get': 'get',
                        'projects:new': 'new'
                    }
                }
            }
        },



        //  Initializers
        //  ------------

        init: function(options) {
            this.initCollection(name, Models.Projects);
        },



        //  API Methods
        //  -----------

        // GET projects
        get: function(options) {
            return this.getCollection(name, options);
        },

        // Return new project
        new: function(options) {
            return new Models.Project();
        }
    });

    return API;
});