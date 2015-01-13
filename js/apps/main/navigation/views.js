define([
    'app',
    'd3',
    'hbs!apps/main/navigation/templates/navigation'
], function (App, d3, navTpl) {
    App.module('Main.Navigation.Views', function (Views, App, Backbone, Marionette, $, _) {
        Views.channel = Backbone.Radio.channel('global');

        Views.NavigationView = Marionette.ItemView.extend({
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
                'link': 'li.dropdown li a.link'
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
            navigate: function (e) {
                var event = e && e.currentTarget && e.currentTarget.href;
                Views.channel.command(event);
                e.preventDefault();
            },
            temp_navigate: function (e) {
                var r = new RegExp('^(?:[a-z]+:)?//', 'i'),
                    url = e.target.getAttribute('href');
                console.log(e);
                console.log(url);
                console.log(r.test(url));
                if (!r.test(url)) {
                    e.preventDefault();
                    App.navigate(url.replace(/^\/#/g, ''));
                }
            },
            reRender: function (e) {
                this.render();
            }
        })
    });

    return App.Main.Navigation.Views;
})