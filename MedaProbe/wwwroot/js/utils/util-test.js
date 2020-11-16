var app;
(function (app) {
    var util;
    (function (util) {
        var test;
        (function (test) {
            function funcMethod() {
                let cnt = 1;
                return () => {
                    cnt++;
                    return () => {
                        cnt++;
                        return () => {
                            cnt++;
                            return cnt;
                        };
                    };
                };
            }
            test.funcMethod = funcMethod;
            function testFuncMethod() {
                const res = funcMethod()()()();
                console.log(res);
            }
            test.testFuncMethod = testFuncMethod;
        })(test = util.test || (util.test = {}));
    })(util = app.util || (app.util = {}));
})(app || (app = {}));
//# sourceMappingURL=util-test.js.map