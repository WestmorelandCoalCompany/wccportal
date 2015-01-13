define([
    'app',
    'apps/main/entities/operations/models'
], function (App, Models) {
    App.module('Main.Entities.Operations.API', {
        define: function (API, App, Backbone, Marionette, $, _) {
            API.API = M.Controller.extend({
                //  Configuration
                //  -------------

                // Channels
                channels: {
                    'api': {
                        name: 'main:api',
                        events: {
                            reply: {
                                'operations:change': 'change',
                                'operations:current': 'current',
                                'operations:get': 'get',
                                'operations:next': 'next',
                                'operations:prev': 'previous'
                            }
                        }
                    }
                },




                //  Initializers
                //  ------------

                // initialize the collection, bind notify to change event
                init: function(options) {
                    this.initCollection('operations',
                        Models.Operations,
                        {events: {'select:one': 'notify'}}
                    );
                },



                //  API Methods
                //  -----------

                //  SELECT an operation
                change: function(name) {
                    var c = this.collections.get('operations'),
                        m = c.findWhere({Title: name}),
                        x = c.selected;
                    if (m && (x ? (x.get('Title') != name) : true)) c.select(m);
                    return m;
                },

                // GET current operation. no xhr.
                current: function() {
                    var c = this.collections.get('operations'),
                        res = undefined;
                    if (c && c.selected) res = c.selected.get('Title');
                    return res;
                },

                //  GET operations
                get: function(options) {
                    return this.getCollection('operations', options);
                },

                //  SELECT the next operation in the collection
                next: function() {
                    var c = this.collections.get('operations'),
                        m = c.selected;
                    if (m) {
                        var i = c.indexOf(m),
                            x = (i == c.length - 1 ? 0 : i + 1);
                        c.select(c.at(x));
                    }
                    else {
                        c.select(c.at(0));
                    }
                    return c.selected;
                },

                //  NOTIFY the app that the operation has changed
                notify: function() {
                    var ops = this.collections.get('operations');
                    this.api.trigger('changed:operation', ops.selected.get('Title'));
                },

                //  SELECT the previous operation in the collection
                previous: function() {
                    var c = this.collections.get('operations'),
                        m = c.selected;
                    if (m) {
                        var i = c.indexOf(m),
                            x = (i == 0 ? c.length - 1 : i - 1);
                        c.select(c.at(x));
                    }
                    else {
                        c.select(c.at(0));
                    }
                    return c.selected;
                }
            });
        }
    });

    return App.Main.Entities.Operations.API;
});