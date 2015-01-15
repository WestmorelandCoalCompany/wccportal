/*
 *  name: controller
 *  path: apps/afe/apps/projects/controller
 *  desc: Sub app controller for afe projects
 */

define([
    'marionette.m'
], function (M) {
    var Projects = {};

    Projects.Controller = M.Controller.extend({
        //  Configuration
        //  -------------

        // Routes
        prefix: 'afe/',
        routes: {
            'new': 'new',
            'edit/:id': 'editFromId',
            '?*querystring': 'list',
            '': 'list'
        },

        // Channels
        channels: {
            api: {
                name: 'afe:api'
            },
            intercom: {
                name: 'afe'
            },
            main: {
                name: 'main:api'
            }
        },



        //  Initializers
        //  ------------

        init: function(options) {

        },



        //  Route Handlers
        //  --------------

        // Show edit form
        edit: function() {

        },

        // Get project, call edit
        editFromId: function(id) {

        },

        // Show project list
        list: function(querystring) {
            var params = {};
            if (querystring) params = this.parseQueryString(querystring);
            this.requireController('app', 'apps/afe/apps/projects/apps/list/controller', null, params);
        },

        // Show new project form
        new: function(querystring) {

        },



        //  Internal Methods
        //  ----------------

        // Parse query string and return as object
        parseQueryString: function(queryString) {
            var params = {};
            if(queryString){
                _.each(
                    _.map(decodeURI(queryString).split(/&/g),function(el,i){
                        var aux = el.split('='), o = {};
                        if(aux.length >= 1){
                            var val = undefined;
                            if(aux.length == 2)
                                val = aux[1];
                            o[aux[0]] = val;
                        }
                        return o;
                    }),
                    function(o){
                        _.extend(params,o);
                    }
                );
            }
            return params;
        }
    });

    return Projects
});