/*
 *  name: sp.rest
 *  path: utils/sp.rest
 *  desc: SharePoint REST common utilities
 */

(function(window, undefined) {
    var Rest = {};

    Rest.dateString = function(date) {
        return "datetime'" + new Date(date).toISOString() + "'";
    };

    if (typeof define === 'function' && define.amd) {
        define([], function() {return Rest});
    }

    //window.sp.rest = Rest;
})(window);