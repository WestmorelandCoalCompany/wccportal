define([
    'app',
    'hbs!apps/main/common/templates/alert',
    'hbs!apps/main/common/templates/modal'
], function (App, AlertTpl, ModalTpl) {
    App.module('Main.Common.Views', {
        define: function (Views, App, Backbone, Marionette, $, _) {
            //  Alert View
            //  ----------

            // Dismissible alert view to be shown inside a div.row
            Views.AlertView = Marionette.ItemView.extend({
                template: AlertTpl,
                tagName: 'div',
                className: 'col-sm-12',

                ui: {
                    close: 'button.close',
                    container: 'div.alert',
                    content: 'span.js-content'
                },

                initialize: function(options) {
                    options || (options = {});
                    var content = options.hasOwnProperty('content') ? options.content : '';
                    var context = options.hasOwnProperty('context') ? options.context : 'alert-warning';
                    this.model = new Backbone.Model({
                        content: content,
                        context: context
                    });
                },

                onRender: function() {
                    var classNames = 'alert alert-dismissible fade in' +
                        (this.model.has('context') ? ' ' + this.model.get('context') : '');
                    this.ui.container.attr('class', classNames);
                }
            });



            //  Modal View
            //  ----------

            Views.ModalView = M.ModalView.extend({
                template: ModalTpl
            });
        }
    });

    return App.Main.Common.Views;
});