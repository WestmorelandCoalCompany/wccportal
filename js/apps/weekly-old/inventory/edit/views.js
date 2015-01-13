define([
    'app',
    'apps/weekly/inventory/common/views'
], function (App, CommonViews) {
    App.module('Weekly.Inventory.Edit.Views', {
        define: function (Views, App, Backbone, Marionette, $, _) {
            Views.FormView = CommonViews.FormView.extend({
                initialize: function() {
                    this.intercom = Backbone.Radio.channel('weekly.inventory.edit');

                    this.intercom.on('form:submit:success', function(model) {
                        this.showSuccess(model)
                    }, this);

                    this.intercom.on('form:submit:failure', function(err) {
                        this.showError(err);
                    }, this);
                },

                onDomRefresh: function() {
                    this.ui.save.text('Update');
                    this.ui.title.text('Update Inventory Entry #' + this.model.id);
                }
            });
        }
    });

    return App.Weekly.Inventory.Edit.Views;
});