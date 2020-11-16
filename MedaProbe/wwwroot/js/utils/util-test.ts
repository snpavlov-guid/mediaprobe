
namespace app.util.test {

    export function funcMethod(): () => () => () => number {
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

    export function testFuncMethod() {

        const res = funcMethod()()()();

        console.log(res);
    }

}