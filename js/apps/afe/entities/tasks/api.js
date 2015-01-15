/*
 *  name: api
 *  path: apps/afe/entities/tasks/api
 *  desc: 
 */

define([
    'apps/afe/entities/tasks/models',
    'marionette.m'
], function (Models, M) {
    var API = {},
        name = 'tasks';

    API.Controller = M.Controller.extend({
        //  Configuration
        //  -------------

        // Channels
        channels: {
            api: {
                name: 'afe:api',
                events: {
                    reply: {
                        'tasks:get': 'get'
                    }
                }
            }
        },



        //  Initializers
        //  ------------

        init: function(options) {
            this.initCollection(name, Models.Tasks);
        },



        //  API Methods
        //  -----------

        // GET tasks for a specific user, requires userID as parameter
        get: function(options) {
            options || (options = {});
            return this.getCollection(name, options);
        }
    });

    return API;
});