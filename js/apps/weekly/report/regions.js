define([
    'app',
    'jquery.ui.slide'
], function (App) {
    App.module('Weekly.Report.Regions', {
        define: function (Regions, App, Backbone, Marionette, $, _) {
            Regions.SlideRegion = Marionette.Region.extend({
                slideFrom: 'right',
                attachHtml: function(view) {
                    var hide = {
                        'right': 'left',
                        'left': 'right'
                    };
                    this.$el.hide('slide', {direction: hide[this.slideFrom]}, 100);
                    this.$el.html(view.el);
                    this.$el.show('slide', {direction: this.slideFrom}, 100);
                }
            });
        }
    });

    return App.Weekly.Report.Regions;
});