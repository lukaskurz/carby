import { IConfig } from "config";
import Axios from 'axios';
import { MqttMessage } from "./mqtt-client";

export default class MessageManager {
    lastStatus: number = new Date(1970,12).getTime();
    lastAlert: number = new Date(1970,12).getTime();
    alertReached = false;

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

        if (message.data.value > this.config.get("api.endpoints.general.upperlimit")) {
            const timeAgo = (new Date().getTime() - this.lastAlert);
            if (timeAgo > this.config.get("api.endpoints.general.interval")) {
                this.lastAlert = new Date().getTime();
                this.alertReached = true;
                this.sendUpdate(this.config.get("api.endpoints.general.url"), `The CO² levels have reached an unbearable high of ${message.data.value}ppm ! :anguished:`);
            }
        }

        if(this.alertReached == true){
            if(message.data.value < this.config.get("api.endpoints.general.lowerlimit")){
                this.alertReached = false;
                this.sendUpdate(this.config.get("api.endpoints.general.url"), `The CO² levels have reached an acceptable low of ${message.data.value}ppm :sunglasses:`);
            }
        }
    }
}

export interface MessageHandler {
    name: string;
    type: string;
    url: string;
}