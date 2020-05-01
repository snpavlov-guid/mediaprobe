var app;
(function (app) {
    var util;
    (function (util) {
        var dom;
        (function (dom) {
            function closest(targetNode, selectors) {
                for (var target = targetNode; target; target = target.parentElement) {
                    if (target.matches(selectors))
                        return target;
                }
                return null;
            }
            dom.closest = closest;
            function filterEvent(ev, selectors) {
                let targetNode = ev.target;
                for (var target = targetNode; target && target != this; target = target.parentElement) {
                    if (target.matches(selectors))
                        return true;
                }
                return false;
            }
            dom.filterEvent = filterEvent;
            function toFileNamedDateFormat(dt) {
                return `${pad(dt.getFullYear())}-${pad(dt.getMonth() + 1)}-${pad(dt.getDay())} ${pad(dt.getHours())}-${pad(dt.getMinutes())}-${pad(dt.getSeconds())}`;
            }
            dom.toFileNamedDateFormat = toFileNamedDateFormat;
            function pad(value, size = 2) {
                var s = value + "";
                while (s.length < (size || 2)) {
                    s = "0" + s;
                }
                return s;
            }
            dom.pad = pad;
        })(dom = util.dom || (util.dom = {}));
    })(util = app.util || (app.util = {}));
})(app || (app = {}));
//# sourceMappingURL=util-dom.js.map