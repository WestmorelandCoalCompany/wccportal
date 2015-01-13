define([
    'app',
    'apps/weekly/sales/common/views'
], function (App, CommonViews) {
    App.module('Weekly.Sales.Edit.Views', {
        define: function (Views, App, Backbone, Marionette, $, _) {
            Views.FormView = CommonViews.FormView.extend({
                initialize: function() {
                    this.intercom = Backbone.Radio.channel('weekly.sales.edit');

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
                    this.ui.save.text('Update');
                    this.ui.title.text('Update Sales Entry #' + this.model.get('Id'));
                }
            });
        }
    });

    return App.Weekly.Sales.Edit.Views;
});