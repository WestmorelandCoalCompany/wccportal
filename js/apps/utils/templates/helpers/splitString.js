define('apps/utils/templates/helpers/splitString', [
    'hbs/handlebars'
], function (Handlebars) {

    Handlebars.registerHelper("splitString", function (context, options) {
        if (context) {
            var ret = "";

            var tempArr = context.trim().split(options.hash["delimiter"]);

            //for (var i = 0; i < tempArr.length; i++) {
                ret = ret + options.fn(tempArr[0]);
            //}

            return ret;
        }
    });
});