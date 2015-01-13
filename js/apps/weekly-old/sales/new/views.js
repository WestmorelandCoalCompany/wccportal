define([
    'app',
    'apps/weekly/sales/common/views'
], function (App, CommonViews) {
    App.module('Weekly.Sales.New.Views', {
        define: function (Views, App, Backbone, Marionette, $, _) {
            Views.FormView = CommonViews.FormView.extend({
                initialize: function() {
                    this.intercom = Backbone.Radio.channel('weekly.sales.new');

                    this.intercom.on('form:submit:success', function(msg) {
                        this.showSuccess(msg);
                    }, this);

                    this.intercom.on('form:submit:failure', function(err) {
                        this.showError(err);
                    }, this);
                },

                onDestroy: function() {
                    this.intercom.off(null, null, this);
                },

                onDomRefresh: function() {
                    this.ui.delete.remove();
                }
            });
        }
    });

    return App.Weekly.Sales.New.Views;
});