define([
    'app',
    'hbs!apps/main/common/templates/modal',
    'hbs!apps/afe/common/templates/layout'
], function (App, modalTpl, layoutTpl) {
    App.module('AFE.Views', {
        define: function (Views, App, Backbone, Marionette, $, _) {
            Views.LayoutView = Marionette.LayoutView.extend({
                // Configuration
                template: layoutTpl,

                // Regions
                regions: {
                    modalRegion: '#afe-modal',
                    contentRegion: '#afe-content'
                }
            });

            Views.ModalView = M.ModalView.extend({
                template: modalTpl
            });
        }
    });

    return App.AFE.Views;
});