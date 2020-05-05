var app;
(function (app) {
    var util;
    (function (util) {
        var check;
        (function (check) {
            class Checker {
                constructor() {
                }
                checkProperties(propertyNames) {
                    const results = [];
                    const computed = window.getComputedStyle(document.body);
                    for (let i = 0; i < propertyNames.length; i++) {
                        const propName = propertyNames[i];
                        const res = {
                            propertyName: propName,
                            isSupported: !(typeof computed[propName] === 'undefined')
                        };
                        results.push(res);
                    }
                    return results;
                }
                areSupported(propertyNames) {
                    const results = this.checkProperties(propertyNames);
                    const notSupported = results.filter(item => !item.isSupported);
                    return notSupported.length == 0;
                }
                showNotSupported(propertyNames, template, destination) {
                    if (!this.areSupported(propertyNames)) {
                        const content = app.util.dom.getTemplate(template);
                        const dest = document.querySelector(destination);
                        dest.innerHTML = "";
                        dest.appendChild(content);
                        return false;
                    }
                    return true;
                }
            }
            check.Checker = Checker;
        })(check = util.check || (util.check = {}));
    })(util = app.util || (app.util = {}));
})(app || (app = {}));
//# sourceMappingURL=util-checker.js.map