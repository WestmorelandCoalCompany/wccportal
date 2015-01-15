/*
 *  name: views
 *  path: apps/afe/views
 *  desc: Application views
 */

define([
    'marionette',
    'hbs!apps/afe/templates/layout'
], function (Marionette, LayoutTpl) {
    var Views = {};

    // AFE layout
    Views.LayoutView = Marionette.LayoutView.extend({
        template: LayoutTpl,
        className: 'container-fluid',
        attributes: {
            'id': 'afe-root'
        },
        regions: {
            contentRegion: '#afe-content'
        }
    });

    return Views;
});