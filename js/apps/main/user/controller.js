define([
    'app',
    'apps/main/user/models'
], function (App, Models) {
    App.module('Main.User', {
        define: function (User, App, Backbone, Marionette, $, _) {
            User.Controller = M.Controller.extend({
                // Radio Configuration
                channels: {
                    channel: {
                        events: {
                            reply: {
                                'current:user': 'getCurrentUser'
                            }
                        }
                    }
                },

                init: function() {
                    this.models.add({
                        name: 'currentUser',
                        model: new Models.User()
                    });
                },

                // API Methods
                getCurrentUser: function(property) {
                    var defer = $.Deferred(),
                        userModel = this.models.get('currentUser');

                    if (userModel) {
                        if (userModel.isNew()) {
                            userModel.fetch({
                                success: $.proxy(function () {
                                    this.getCurrentUserProperty(defer, userModel, property)
                                }, this)
                            });
                        }
                        else {
                            this.getCurrentUserProperty(defer, userModel, property);
                        }
                    }
                    else {
                        defer.fail();
                    }

                    return defer.promise();
                },

                getCurrentUserProperty: function(defer, user, property) {
                    switch(property) {
                        case null:
                            defer.resolve(user);
                            break;
                        case 'name':
                            defer.resolve(user.get('Title'));
                            break;
                        case 'firstName':
                            var name = user.get('Title').split(', ');
                            defer.resolve(name.length - 1);
                            break;
                        case 'email':
                            defer.resolve(user.get('Email'));
                            break;
                        case 'id':
                            defer.resolve(user.get('Id'));
                            break;
                    }
                }
            });
        }
    });

    return App.Main.User;
});