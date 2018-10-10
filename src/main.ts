import MqttManager, { Measurement, MqttMessage } from './mqtt-client';
import Config from "config"
import Axios from 'axios';
import { Observable, Subject, config } from 'rxjs';
import MessageManager from './message-handler';

const mqtt = new MqttManager(Config);
let messages: Subject<MqttMessage>;
let messageManager = new MessageManager(Config)
initMessageManager();

mqtt.connect()
    .then(() => {
        return mqtt.subscribe();
    })
    .then(() => {
        messages = mqtt.listen();
        messages.subscribe((message) => {
            messageManager.handle(message);
        }, (error) => {
            console.log(error);
        });
    })
    .catch(() => {
        console.log("Error in MQTT process");
    });

function initMessageManager() {
    const statusHandler = (message: MqttMessage, scope: any) => {
        scope = scope as { lastStatus: number };
        const timeAgo = (new Date().getTime() - scope.lastStatus);
        if (timeAgo > Config.get("api.endpoints.carbyStatus.interval")) {
            scope.lastStatus = new Date().getTime();
            sendUpdate(Config.get("api.endpoints.carbyStatus.url"), `Current CO² level: ${message.data.value}ppm`);
        }
    }

    const statusScope = {
        lastStatus: new Date().getTime()
    };

    messageManager.addHandler(statusHandler, statusScope);

    const generalHandler = (message: MqttMessage, scope: any) => {
        scope = scope as { lastAlert: number, alertReached: boolean };
        if (message.data.value > Config.get("api.endpoints.general.upperlimit")) {
            const timeAgo = (new Date().getTime() - scope.lastAlert);
            if (timeAgo > Config.get("api.endpoints.general.interval")) {
                scope.lastAlert = new Date().getTime();
                scope.alertReached = true;
                sendUpdate(Config.get("api.endpoints.general.url"), `The CO² levels have reached an unbearable high of ${message.data.value}ppm ! :anguished:`);
            }
        }

        if (scope.alertReached == true) {
            if (message.data.value < Config.get("api.endpoints.general.lowerlimit")) {
                scope.alertReached = false;
                sendUpdate(Config.get("api.endpoints.general.url"), `The CO² levels have reached an acceptable low of ${message.data.value}ppm :sunglasses:`);
            }
        }
    }

    const generalScope = {
        lastAlert: new Date().getTime(),
        alertReached: false
    };


    messageManager.addHandler(generalHandler, generalScope);

}

function sendUpdate(url: string, message: string) {
    Axios.post(url, {
        text: message,
    })
}