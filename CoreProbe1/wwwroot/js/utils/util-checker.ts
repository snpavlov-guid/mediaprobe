
namespace app.util.check {

    export interface ICheckResult {
        propertyName: string,
        isSupported: boolean,
    }

    export class Checker {
        constructor() {

        }

        public checkProperties(propertyNames: string[]): ICheckResult[] {
            const results: ICheckResult[] = [];
            const computed = window.getComputedStyle(document.body);

            for (let i = 0; i < propertyNames.length; i++) {
                const propName = propertyNames[i];
                const res: ICheckResult = {
                    propertyName: propName,
                    isSupported: !(typeof computed[propName] === 'undefined')
                }
                results.push(res);
            }

            return results;
        }

        public areSupported(propertyNames: string[]): boolean {
            const results = this.checkProperties(propertyNames);
            const notSupported = results.filter(item => !item.isSupported);
            return notSupported.length == 0;
        }

        public showNotSupported(propertyNames: string[], template: string, destination: string): boolean {

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
 
}