import MqttManager, { Measurement, MqttMessage } from './mqtt-client';
import Config from "config"
import Axios from 'axios';
import { Observable, Subject, config } from 'rxjs';
import MessageManager from './message-handler';

const mqtt = new MqttManager(Config);
let messages: Subject<MqttMessage>;
let messageManager = new MessageManager(Config)

mqtt.connect()
    .then(() => {
        return mqtt.subscribe();
    })
    .then(() => {
        messages = mqtt.listen();
        messages.subscribe((message) => {
            messageHandler.handle(message);
        }, (error) => {
            console.log(error);
        });
    })
    .catch(() => {
        console.log("Error in MQTT process");
    });