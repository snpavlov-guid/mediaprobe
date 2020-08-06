
namespace app.util.data {

    export function extend(deep : boolean, out: object, ...args: object[]) {
        out = out || {};

        for (var i = 1; i < arguments.length; i++) {
            var obj = arguments[i];

            if (!obj) continue;

            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {

                    if (deep && typeof obj[key] === 'object') {
                        if (obj[key] == null)
                            out[key] = obj[key];
                        else
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

}