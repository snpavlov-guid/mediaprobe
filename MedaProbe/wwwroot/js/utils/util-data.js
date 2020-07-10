var app;
(function (app) {
    var util;
    (function (util) {
        var data;
        (function (data) {
            function extend(deep, out, ...args) {
                out = out || {};
                for (var i = 1; i < arguments.length; i++) {
                    var obj = arguments[i];
                    if (!obj)
                        continue;
                    for (var key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            if (deep && typeof obj[key] === 'object') {
                                if (obj[key] instanceof Array == true)
                                    out[key] = obj[key].slice(0);
                                else
                                    out[key] = extend(deep, out[key], obj[key]);
                            }
                            else
                                out[key] = obj[key];
                        }
                    }
                }
                return out;
            }
            data.extend = extend;
        })(data = util.data || (util.data = {}));
    })(util = app.util || (app.util = {}));
})(app || (app = {}));
//# sourceMappingURL=util-data.js.map