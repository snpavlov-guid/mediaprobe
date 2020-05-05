
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

        public checkObjects(objectNames: string[]): ICheckResult[] {
            const results: ICheckResult[] = [];

            for (let i = 0; i < objectNames.length; i++) {
                const objName = objectNames[i];
                const res: ICheckResult = {
                    propertyName: objName,
                    isSupported: !(typeof window[objName] === 'undefined')
                }
                results.push(res);
            }

            return results;
        }

        public areSupportedProperties(propertyNames: string[]): boolean {
            const results = this.checkProperties(propertyNames);
            const notSupported = results.filter(item => !item.isSupported);
            return notSupported.length == 0;
        }

        public areSupportedObjects(objectNames: string[]): boolean {
            const results = this.checkObjects(objectNames);
            const notSupported = results.filter(item => !item.isSupported);
            return notSupported.length == 0;
        }

        public showNotSupportedProperties(propertyNames: string[], template: string, destination: string): boolean {

            if (!this.areSupportedProperties(propertyNames)) {
                const content = app.util.dom.getTemplate(template);
                const dest = document.querySelector(destination);
                dest.innerHTML = "";
                dest.appendChild(content);
                return false;
            }

            return true;
        }

        public showNotSupportedObjects(objectNames: string[], template: string, destination: string): boolean {

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
 
}