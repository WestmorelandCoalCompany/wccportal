/*
 *  name: api
 *  path: apps/afe/entities/api
 *  desc: Application level api controller
 */

var root = 'apps/afe/entities/';
var path = function(entityFolder) {
    return root + entityFolder + '/api';
};

define([
    'marionette.m',
    (path('amounts')),
    (path('projects')),
    (path('tasks')),
    (path('workOrders')),
    (path('workOrderAmounts'))
], function (M, Amounts, Projects, Tasks, WorkOrders, WorkOrderAmounts) {
    var API = {};

    API.Controller = M.Controller.extend({
        init: function(options) {
            _.each(this.initializers, function(method, name) {
                method.call(this, options);
            }, this);
        },

        initializers: {
            amounts: function(options) {
                this.initController('amounts', Amounts.Controller, null, options);
            },
            projects: function(options) {
                this.initController('projects', Projects.Controller, null, options);
            },
            tasks: function(options) {
                this.initController('tasks', Tasks.Controller, null, options);
            },
            workOrders: function(options) {
                this.initController('workOrders', WorkOrders.Controller, null, options);
            },
            workOrderAmounts: function(options) {
                this.initController('workOrderAmounts', WorkOrderAmounts.Controller, null, options);
            }
        }
    });

    return API;
});