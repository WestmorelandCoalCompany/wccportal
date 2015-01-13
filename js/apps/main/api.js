define([
    'app',
    'apps/main/models'
], function (App, Models) {
    App.module('Main', {
        define: function (Main, App, Backbone, Marionette, $, _) {
            Main.API = M.Controller.extend({
                // Events
                events: {
                    reply: {
                        'ledgers': 'ledgers',
                        'operations': 'operations',
                        'selected:operation': 'selectedOperation',
                        'user': 'user'
                    }
                },

                // Channels
                channels: {
                    'channel': {
                        events: {
                            comply: {
                                'change:operation': 'changeOp'
                            },
                            reply: {
                                'ledgers': 'ledgers',
                                'operations': 'operations',
                                'selected:operation': 'selectedOperation',
                                'user': 'user'
                            }
                        }
                    }
                },

                init: function(options) {
                    this.initCollection('ledgers', Models.Ledgers, options);
                    $.extend(options, {events: {'select:one': 'notifyOpChange'}});
                    this.initCollection('operations', Models.Operations, options);
                },

                //  Get
                //  ---

                // Return ledger collection
                ledgers: function(options) {
                    return this.collections.get('ledgers');
                },

                // Return operation collection
                operations: function(options) {
                    return this.collections.get('operations');
                },

                // Return selected operation name
                selectedOperation: function(options) {
                    var defer = $.Deferred(),
                        operations = this.operations(options);
                        return operations.selected || null;
                },

                // Return current user object or property if included in options
                user: function(options) {
                    options || (options = {});
                    var defer = $.Deferred(),
                        model = this.models.get('user');

                    if (!model) {
                        model = new Models.User();
                        this.models.add({name: 'user', model: model});
                    }

                    if (options.update || model.isNew()) {
                        model.fetch({
                            success: $.proxy(function() {
                                var xhr = model.getLocation();
                                $.when(xhr).done(
                                    $.proxy(function() {
                                        defer.resolve(this.getUserProperty(model, options));
                                    }, this)
                                );
                            }, this),
                            error: function(model, res, options) {
                                var msg = res.error.message.value;
                                defer.reject(msg);
                            }
                        })
                    }
                    return defer.promise();
                },

                //  Internal Methods
                //  ----------------

                // Select the next operation
                changeOp: function(options) {
                    options || (options = {});
                    if (options.operations) {

                    }
                    else if (options.direction) {
                        var operations = this.collections.get('operations'),
                            i = operations.indexOf(operations.selected),
                            l = operations.length - 1,
                            n = 0;
                        switch(options.direction) {
                            case 'next':
                                if (i + 1 > l) i = 0;
                                n = i + 1;
                                break;
                            case 'previous':
                                if (i - 1 < 0) i = l;
                                n = i - 1;
                                break;
                        }
                        operations.select(operations.at(n));
                        this.channel.trigger('changed:operation');
                    }
                },

                // Route user property return
                getUserProperty: function(user, options) {
                    var res;
                    switch (options.property) {
                        case null:
                            res = user;
                            break;
                        case 'email':
                            res = user.get('Email');
                            break;
                        case 'first':
                            res = user.get('Title').split(', ')[0];
                            break;
                        case 'id':
                            res = user.get('Id');
                            break;
                        case 'last':
                            res = user.get('Title').split(', ')[1];
                            break;
                        case 'location':
                            res = user.get('Location');
                            break;
                        case 'name':
                            res = user.get('Title');
                            break;
                    }
                    return res;
                },

                // Generic collection initialization
                initCollection: function(name, collection, options) {
                    var c = this.collections.get(name);
                    if (!c || (!(c instanceof collection))) {
                        c = new collection();
                        var x = {name: name, collection: c};
                        if (options && options.events) x.events = options.events;
                        this.collections.add(x);
                    }
                    this.getCollection(name, options);
                },

                notifyOpChange: function() {
                    this.channel.trigger('changed:operation', {ignoreDate: true});
                }
            });
        }
    });

    return App.Main;
});