define([
    'app',
    'apps/weekly/inventory/common/views'
], function (App, CommonViews) {
    App.module('Weekly.Inventory.New.Views', {
        define: function (Views, App, Backbone, Marionette, $, _) {
            Views.FormView = CommonViews.FormView.extend({
                initialize: function() {
                    this.intercom = Backbone.Radio.channel('weekly.inventory.new');

                    this.intercom.on('form:submit:success', function(model) {
                        this.showSuccess(model)
                    }, this);

                    this.intercom.on('form:submit:failure', function(err) {
                        this.showError(err);
                    }, this);
                },
                
                onDomRefresh: function() {
                    this.ui.delete.remove();
                }
            });
        }
    });

    return App.Weekly.Inventory.New.Views;
});