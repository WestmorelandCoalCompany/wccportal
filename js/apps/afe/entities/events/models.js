/*
 *  name: models
 *  path: apps/afe/entities/events/models
 *  desc: Workflow history event items
 */

define([
    'backbone',
    'backbone.sp'
], function (Backbone) {
    var Models = {};

    Models.Event = Backbone.SP.Item.extend({
        site: '/',
        list: 'WorkflowHistory'
    });

    Models.Events = Backbone.SP.List.extend({
        model: Models.HistoryEntry,
        fetch: function (options) {
            options || (options = {});
            $.extend(options, {
                select: '*',
                filter: "WorkflowHistoryParentInstance eq '" + options.projectID + "'"
            });
            Backbone.Collection.prototype.fetch.call(this, options);
        }
    });

    return Models;
});