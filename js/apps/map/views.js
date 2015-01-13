define([
    'app',
    'hbs!apps/map/templates/layout'
], function (App, layoutTpl) {
    App.module('Maps.Views', {
        startsWithParent: false,
        define: function (Views, App, Backbone, Marionette, $, _) {
            Views.LayoutView = Marionette.LayoutView.extend({
                template: layoutTpl,
                regions: {
                    map: '#map',
                    infoPanel: '#infoPanel'
                }
            });

            Views.Navigation = Marionette.ItemView.extend({
                template: navTpl,
                tagName: 'ul',
                className: 'nav navbar-nav',
                templateHelpers: {
                    hierarchy: function () {
                        if (this.collection) {
                            var raw = this.collection.models;
                            raw = d3.nest()
                                .key(function (link) {
                                    return link.get('category');
                                })
                                .key(function (link) {
                                    return link.get('app');
                                })
                                .entries(raw);
                            return raw;
                        }
                    }
                },
                ui: {
                    'appLink': 'li.dropdown li a.event',
                    'link': 'li.dropdown li a'
                },
                events: {
                    'click @ui.appLink': 'navigate',
                    'click @ui.link': 'temp_navigate'
                },
                collectionEvents: {
                    'sync': 'reRender',
                    'changed': 'reRender',
                    'reset': 'reRender'
                },
                navigate: function(e) {
                    console.log('Event Navigate');
                    var event = e && e.currentTarget && e.currentTarget.href;
                    console.log(event);
                    e.preventDefault();
                },
                temp_navigate: function (e) {
                    console.log('Normal Navigate');
                    var url = e && e.currentTarget && e.currentTarget.href;
                    console.log(url);
                    e.preventDefault();
                },
                reRender: function (e) {
                    this.render();
                }
            });
        }
    });

    return;
})