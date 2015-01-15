/*
 *  name: controller
 *  path: apps/afe/controller
 *  desc: Application Controller
 */

define([
    'app',
    'apps/afe/entities/api',
    'apps/afe/views',
    'marionette.m'
], function (App, API, Views, M) {
    var AFE = {};

    AFE.Controller = M.Controller.extend({
        //  Configuration
        //  -------------

        // Routes
        prefix: 'afe',
        routes: {
            'tasks*path': 'tasks',
            '*path': 'projects'
        },

        // Channels
        channels: {
            api: {
                name: 'afe:api'
            },
            intercom: {
                name: 'afe',
                events: {
                    comply: {
                        'update:content': 'updateContent'
                    }
                }
            },
            main: {
                name: 'main:api'
            }
        },



        //  Initializers
        //  ------------

        init: function(options) {
            _.each(this.initializers, function(method, name) {
                method.call(this, options);
            }, this);
        },

        initializers: {
            // Initialize the application sub-layout
            layout: function(options) {
                var name = 'layout';
                this.initView(name, Views.LayoutView);
                App.mainRegion.show(this.views.get(name));
            },

            // Initialize the application api layer
            api: function(options) {
                this.initController('api', API.Controller, null, options);
            }
        },



        //  Route Handlers
        //  --------------

        // Start projects sub app
        projects: function(options) {
            options || (options = {});
            this.initSubApp('app', 'apps/afe/apps/projects/controller', options);
        },

        // Start tasks sub app
        tasks: function(options) {
            options || (options = {});
            this.initSubApp('app', 'apps/afe/apps/tasks/controller', options)
        },



        //  View Handlers
        //  -------------

        // Update content region
        updateContent: function(view) {
            this.views.get('layout').contentRegion.show(view);
        },



        //  Internal Methods
        //  ----------------

        // Lazy load and start a sub app controller
        initSubApp: function(name, path, options) {
            options || (options = {});

            _.extend(options, {debug: App.debug});
            require([path], _.bind(function(C) {
                this.initController(name, C.Controller, null, options);
            }, this));
        }
    });

    return AFE;
});