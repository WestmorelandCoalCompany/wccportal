/*
 *  name: controller
 *  path: apps/afe/apps/projects/apps/list/controller
 *  desc: Project List sub application
 */

define([
    'async',
    'utils/sp/sp.rest',
    'marionette.m',
    'apps/afe/apps/projects/apps/list/views'
], function (async, spRest, M, Views) {
    var List = {};

    List.Controller = M.Controller.extend({
        //  Configuration
        //  -------------

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
            _.each(this.initializers, _.bind(function(method, name) {
                method.call(this, options);
            }, this));
        },

        initializers: {
            // Initialize the list sub layout
            layout: function() {
                var name = 'layout';
                this.initView(name,
                    Views.LayoutView,
                    {events: {
                        'changed:year': 'list'
                    }}
                );
                this.intercom.command('update:content', this.views.get(name));
            },

            // Show initial project list
            list: function(options) {
                this.list(options);
            }
        },



        //  Route Handlers
        //  --------------

        // Show project list
        list: function(options) {
            var xhr = this.getProjects(),
                layout = this.views.get('layout'),
                name = 'list';
            $.when(xhr).done(_.bind(function(projects) {
                this.initView(name, Views.GridView, null, {collection: projects});
                layout.contentRegion.show(this.views.get(name));
            }, this));
        },

        //  View Handlers
        //  -------------



        //  Internal Methods
        //  ----------------

        // Interface with the projects api. Gets projects filtered by year and optional operation
        getProjects: function(options) {
            options || (options = {});
            var defer = $.Deferred();

            async.auto({
                // Get the currently selected year
                year: _.bind(function(callback) {
                    var year = parseInt(this.views.get('layout').triggerMethod('get:year'));
                    callback(null, year);
                }, this),

                // Get an operation to filter on if user is associated with a location
                operation: _.bind(function(callback) {
                    var xhr = this.main.request('users:current', {property: 'location'}),
                        a = function(location) {
                            if (location == 'Corporate' && options.operation) {
                                callback(null, options.operation);
                            }
                            else if (location == 'Corporate') {
                                callback(null, null);
                            }
                            else if (location != 'Corporate') {
                                callback(null, location);
                            }
                        },
                        b = function(err) {callback(err);};

                    $.when(xhr).then(a,b);
                }, this)
            }, _.bind(function(err, results) {
                if (err) defer.reject(err);

                var options = {};

                // Build date filters
                var filter = 'Created ge ' + spRest.dateString(new Date(results.year, 0, 1)) +
                    ' and Created le ' + spRest.dateString(new Date(results.year + 1, 0, 0));

                // Build optional operation filter
                if (results.operation) filter += ' and substringof(Operation,' + results.operation + ')';

                options.filter = filter;
                options.reset = true;
                options.update = true;
                var xhr = this.api.request('projects:get',  options),
                    a = function(projects) {defer.resolve(projects);},
                    b = function(err) {defer.reject(err);};

                $.when(xhr).then(a,b);
            }, this));

            return defer.promise();
        }
    });

    return List;
});