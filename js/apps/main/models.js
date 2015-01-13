define([
    'app',
    'backbone.sp',
    'backbone.picky'
], function (App) {
    App.module('Main.Models', {
        define: function (Models, App, Backbone, Marionette, $, _) {
            // Ledgers
            Models.Ledger = Backbone.Model.extend({
                urlRoot: 'http://wccportal-test/-/_vti_bin/custom/data.svc/ledgers'
            });

            Models.Ledgers = Backbone.Collection.extend({
                model: Models.Ledger,
                url: '_vti_bin/custom/data.svc/ledgers'
            });

            // Operations
            Models.Operation = Backbone.SP.Item.extend({
                site: '/',
                list: 'Operations',

                initialize: function() {
                    var s = new Backbone.Picky.Selectable(this);
                    _.extend(this, s);
                }
            });

            Models.Operations = Backbone.SP.List.extend({
                model: Models.Operation,
                initialize: function() {
                    var ss = new Backbone.Picky.SingleSelect(this);
                    _.extend(this, ss);
                },
                fetch: function(options) {
                    options || (options = {});
                    $.extend(options, {
                        select: '*',
                        filter: "f8ie eq 'U.S. Coal'"
                    });
                    Backbone.Collection.prototype.fetch.call(this, options);
                }
            });

            // Current User
            Models.User = Backbone.SP.Item.extend({
                url: function() {
                    var userid= _spPageContextInfo.userId;
                    var requestUri = _spPageContextInfo.webAbsoluteUrl + "/_api/web/getuserbyid(" + userid + ")";
                    var test = 'http://wccportal-test/_api/SP.UserProfiles.PeopleManager/GetMyProperties';
                    return requestUri;
                },
                getLocation: function() {
                    var url = "http://wccportal-test/_api/SP.UserProfiles.PeopleManager/" +
                        "GetUserProfilePropertyFor(accountName=@v,propertyName='Office')" +
                        "?@v='" + this.get('LoginName').split('|')[1] + "'";
                    var defer = $.Deferred();
                    var xhr = $.ajax({
                        url: url,
                        type: 'GET',
                        dataType: 'json',
                        processData: true,
                        contentType: 'application/json;odata=verbose',
                        headers: {
                            "Accept": "application/json;odata=verbose"
                        }
                    });
                    $.when(xhr).then(
                        $.proxy(function(res, status, jqxhr) {
                            this.set({Location: (res && res.d && res.d.GetUserProfilePropertyFor)})
                            defer.resolve();
                        }, this),
                        function(jqxhr, status, err) {
                            defer.reject('There was an error retrieving your location from the server.');
                        }
                    );
                    return defer.promise();
                }
            });
        }
    });

    return App.Main.Models;
});