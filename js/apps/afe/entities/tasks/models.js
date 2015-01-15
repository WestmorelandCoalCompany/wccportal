/*
 *  name: models
 *  path: apps/afe/entities/tasks/models
 *  desc: SharePoint tasks created in conjunction with AFE projects
 */

define([
    'backbone',
    'backbone.sp'
], function (Backbone) {
    var Models = {};

    var treatAsUTC = function(date) {
        var result = new Date(date);
        result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
        return result;
    };

    var daysBetween = function(startDate, endDate) {
        var millisecondsPerDay = 24 * 60 * 60 * 1000;
        return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
    };

    Models.Task = Backbone.SP.Item.extend({
        site: '/',
        list: 'AFE Tasks',
        parse: function (res, options) {
            if (options.deleted || options.updated) return this.attributes;

            // parse dates
            _.each(['DueDate', 'StartDate', 'Modified', 'Created'], function (attr) {
                if (res[attr]) {
                    res[attr] = new Date(res[attr]);
                    if (attr == 'DueDate') {
                        res['dueIn'] = -1 * daysBetween(res[attr], new Date());
                    }
                }
            });
            return res;
        }
    });

    Models.Tasks = Backbone.SP.List.extend({
        model: Models.Task,
        fetch: function (options) {
            options || (options = {});
            $.extend(options, {
                select: '*'
            });
            if (options.userID) {
                $.extend(options, {
                    filter: "AssignedTo/Id eq " + options.userID + " and Status ne 'Completed'"
                });
            }
            Backbone.Collection.prototype.fetch.call(this, options);
        }
    });

    return Models;
});