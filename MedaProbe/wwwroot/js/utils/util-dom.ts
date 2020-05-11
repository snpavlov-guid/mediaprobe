
namespace app.util.dom {

    type EventFilterCallback = (target: Node) => boolean;

    export function closest(targetNode: HTMLElement, selectors: string): HTMLElement {

        for (var target = targetNode; target; target = target.parentElement) {
            if (target.matches(selectors)) return target;
        }

        return null;
    }

    export function filterEvent(ev: Event, selectors: string): boolean {

        let targetNode = <HTMLElement>ev.target;

        for (var target = targetNode; target && target != this; target = target.parentElement) {
            if (target.matches(selectors)) return true;
        }

        return false;
    }

    export function toFileNamedDateFormat(dt : Date) : string  {
        return `${pad(dt.getFullYear())}-${pad(dt.getMonth() + 1)}-${pad(dt.getDay())} ${pad(dt.getHours())}-${pad(dt.getMinutes())}-${pad(dt.getSeconds())}`;
    }

    export function pad(value: number, size: number = 2) {
        var s = value + "";
        while (s.length < (size || 2)) { s = "0" + s; }
        return s;
    }

    export function getTemplate(selector : string): Node {
        let template = <HTMLTemplateElement>document.querySelector(selector);
        return template.content.cloneNode(true);
    }

}