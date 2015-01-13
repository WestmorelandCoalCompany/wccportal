define([
    'backbone',
    'marionette',
    'backbone.picky'
], function (Backbone, Marionette) {
    // Selectable Extensions
    Backbone.Selectable = {};

    Backbone.Selectable.Model = Backbone.Model.extend({
        initialize: function() {
            var selectable = new Backbone.Picky.Selectable(this);
            _.extend(this, selectable);
        }
    });

    Backbone.Selectable.Collection = Backbone.Collection.extend({
        initialize: function () {
            var singleSelect = new Backbone.Picky.SingleSelect(this);
            _.extend(this, singleSelect);
        }
    });
});