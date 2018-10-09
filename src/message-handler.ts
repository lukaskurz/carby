import { IConfig } from "config";
import Axios from 'axios';
import { MqttMessage } from "./mqtt-client";

export default class MessageManager {
    lastStatus: number = new Date(1970,12).getTime();
    lastAlert: number = new Date(1970,12).getTime();

    constructor(public config: IConfig) { }

    sendUpdate(url: string, message: string) {
        Axios.post(url, {
            text: message,
        })
    }

    handle(message: MqttMessage) {
        const timeAgo = (new Date().getTime() - this.lastStatus);
        if (timeAgo > this.config.get("api.endpoints.carbyStatus.interval")) {
            this.lastStatus = new Date().getTime();
            this.sendUpdate(this.config.get("api.endpoints.carbyStatus.url"), `Current CO² level: ${message.data.value}ppm`);
        }

        if (message.data.value > this.config.get("api.endpoints.general.interval")) {
            const timeAgo = (new Date().getTime() - this.lastAlert);
            if (timeAgo > this.config.get("api.endpoints.general.interval")) {
                this.lastAlert = new Date().getTime();
                this.sendUpdate(this.config.get("api.endpoints.general.url"), `The CO2 levels have reached an unbearable level of ${message.data.value}!`);
            }
        }
    }
}

export interface MessageHandler {
    name: string;
    type: string;
    url: string;
}