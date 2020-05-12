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
                checkObjects(objectNames) {
                    const results = [];
                    for (let i = 0; i < objectNames.length; i++) {
                        const objName = objectNames[i];
                        const res = {
                            propertyName: objName,
                            isSupported: !(typeof window[objName] === 'undefined')
                        };
                        results.push(res);
                    }
                    return results;
                }
                areSupportedProperties(propertyNames) {
                    const results = this.checkProperties(propertyNames);
                    const notSupported = results.filter(item => !item.isSupported);
                    return notSupported.length == 0;
                }
                areSupportedObjects(objectNames) {
                    const results = this.checkObjects(objectNames);
                    const notSupported = results.filter(item => !item.isSupported);
                    return notSupported.length == 0;
                }
                showNotSupportedProperties(propertyNames, template, destination) {
                    if (!this.areSupportedProperties(propertyNames)) {
                        const content = app.util.dom.getTemplate(template);
                        const dest = document.querySelector(destination);
                        dest.innerHTML = "";
                        dest.appendChild(content);
                        return false;
                    }
                    return true;
                }
                showNotSupportedObjects(objectNames, template, destination) {
                    if (!this.areSupportedObjects(objectNames)) {
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
