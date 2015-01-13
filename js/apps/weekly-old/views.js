define([
    'app',
    'hbs!apps/weekly/templates/layoutTpl',
], function (App, layoutTpl) {
    App.module('Weekly.Views', {
        define: function (Views, App, Backbone, Marionette, $, _) {
            Views.LayoutView = Marionette.LayoutView.extend({
                template: layoutTpl,
                regions: {
                    headerRegion: '#weekly-header',
                    dateMenuRegion: '#weekly-date-menu',
                    opMenuRegion: '#weekly-op-menu',
                    mainMenuRegion: '#weekly-main-menu',
                    contentRegion: '#weekly-content'
                }
            });
        }
    });
    
    return App.Weekly.Views;
});