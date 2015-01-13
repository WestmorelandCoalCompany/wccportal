define([
    'app',
    'apps/main/entities/users/models',
    'async'
], function (App, Models, async) {
    App.module('Main.Entities.Users.API', {
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
                                'users:get:current': 'current'
                            }
                        }
                    }
                },



                //  Initializers
                //  ------------

                init: function(options) {
                    this.initModel('user', Models.User)
                },



                //  API Methods
                //  -----------

                // GET the current user. return user or requested user property
                current: function(options) {
                    options || (options = {});
                    var user = this.models.get('user'),
                        defer = $.Deferred();

                    async.series({
                        user: function(callback) {
                            // fetch the current user if required/asked
                            if (options.update || user.isNew()) {
                                user.fetch({
                                    success: function() {
                                        callback(null, user);
                                    },
                                    error: function(model, res) {
                                        callback(res.error.message.value);
                                    }
                                })
                            }
                            else {
                                callback(null, user);
                            }
                        },
                        location: function(callback) {
                            // fetch the user's location if not set
                            if (user.has('Location')) callback(null, user);
                            var xhr = user.getLocation(),
                                onSuccess = function() {callback(null, user);},
                                onFailure = function(err) {callback(err);};

                            $.when(xhr).then(onSuccess, onFailure);
                        },
                        response: _.bind(function(callback) {
                            var res = this.getProperty(user, options);
                            callback(null, res);
                        }, this)
                    }, _.bind(function(err, results) {
                        if (err) defer.reject('There was an error requesting the current user.');
                        defer.resolve(results.response);
                    }, this));

                    return defer.promise();
                },



                //  Internal Methods
                //  ----------------

                // Parse user for a specific property.
                // Return user model if no property is specified.
                getProperty: function(user, options) {
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
                }
            });
        }
    });

    return App.Main.Entities.Users.API;
});