/**
 * Created by cludden on 11/21/2014.
 */
define([
    'app',
    'apps/weekly/mainMenu/views',
    'apps/weekly/mainMenu/models'
], function(App) {
    App.module('Weekly.MainMenu', {
        define: function(MainMenu, App, Backbone, Marionette, $, _) {
            MainMenu.Controller = Marionette.Controller.extend({
                initialize: function() {
                    _.bindAll.apply(_, [this].concat(_.functions(this)));

                    if (App.env === 'dev') {
                        Backbone.Radio.tuneIn(this.intercom.channelName);
                    }

                    this.intercom.comply('navigate', function(item) {
                        this.navigate(item);
                    }, this);

                    this.channel.comply('set:active:header', function(name) {
                        this.setActiveHeader(name);
                    }, this);

                    this.showMainMenu();
                },

                channel: Backbone.Radio.channel('weekly'),
                intercom: Backbone.Radio.channel('weekly.mainmenu'),

                showMainMenu: function() {
                    var collection = this.intercom.request('models:mainmenu'),
                        view = new App.Weekly.MainMenu.Views.MenuView({
                            collection: collection
                        });
                    App.Weekly.Layout.mainMenuRegion.show(view);
                },

                navigate: function(item) {
                    if (!(item instanceof Backbone.Model)) {
                        var collection = this.intercom.request('models:mainmenu');
                        item = collection.find(function(item) {
                            return item.get('name') === item;
                        });
                        if (!item) { return;}
                    }
                    this.channel.trigger(item.get('event'));
                    this.setActiveHeader(item);
                    this.channel.trigger('changed:subapp', item);
                },

                setActiveHeader: function(name) {
                    var collection = this.intercom.request('models:mainmenu');
                    var activeItem;

                    if (name instanceof Backbone.Model) {
                        activeItem = name;
                    }
                    else {
                        activeItem = collection.find(function(item) {
                            return item.get('name') === name;
                        });
                    }
                    collection.select(activeItem);
                }
            });
        }
    });

    return App.Weekly.MainMenu.Controller;
});