import { IConfig } from "config";
import { MqttMessage } from "./mqtt-client";

export default class MessageManager {
    lastStatus: number = new Date(1970, 12).getTime();
    lastAlert: number = new Date(1970, 12).getTime();
    alertReached = false;
    private indexCounter = 0;

    handlers: { id: number, handler: ((message: MqttMessage, scope: Object) => void), scope: Object }[];

    constructor(public config: IConfig) {
        this.handlers = [];
    }

    handle(message: MqttMessage) {
        let index = this.handlers.length;
        while (index--) {
            const currentHandler = this.handlers[index];
            currentHandler.handler(message, currentHandler.scope);
        }
    }

    addHandler(handler: (message: MqttMessage, scope: {}) => void, localScope: any) {
        this.handlers.push({ id: this.indexCounter++, handler: handler, scope: localScope });
    }
}

export interface MessageHandler {
    name: string;
    type: string;
    url: string;
}