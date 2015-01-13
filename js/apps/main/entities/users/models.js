define([
    'app',
    'backbone.sp'
], function (App) {
    App.module('Main.Entities.Users.Models', {
        define: function (Models, App, Backbone, Marionette, $, _) {
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

    return App.Main.Entities.Users.Models;
});