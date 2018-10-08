import MqttManager, { Measurement } from './mqtt-client';
import Config from "config"
import Axios from 'axios';
import { Observable } from 'rxjs';

const mqtt = new MqttManager(Config);
let messages: Observable<Measurement>;

mqtt.connect()
    .then(() => {
        return mqtt.subscribe()
    })
    .then(() => {
        messages = mqtt.listen()
        messages.subscribe((measurement) => {
            console.log(JSON.stringify(measurement));
        })
    })
    .catch(()=>{
        console.log("Error in MQTT process");
    });


function sendUpdate(url: string, message: string) {
    Axios.post(url, {
        text: message,
    })
}