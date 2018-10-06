import Config from "config"
import * as Mqtt from "mqtt";
import Axios from 'axios';

const mqttClient = Mqtt.connect(Config.get("mqtt.url"));

let lastAlert = new Date(2000, 1, 1).getTime();
let lastStatus = new Date(2000, 1, 1).getTime();

mqttClient.on('connect', function () {
    console.log("connecting to mqtt");
    mqttClient.subscribe((Config.get("mqtt.topics") as Array<string>)[0], function (err) {
        console.log("subscribing to mqtt");
        if (!err) {
            console.log("subscribed to mqtt");
        }
    })

    mqttClient.on("message", (topic, message) => {
        console.log(`${topic}: ${message}`);

        let data: { time: number, value: number } = JSON.parse(message.toString());

        const timeAgo = (new Date().getTime() - lastStatus) / 1000;
        if (timeAgo > Config.get("api.endpoints.carbyStatus.interval")) {
            lastStatus = new Date().getTime();
            sendUpdate(Config.get("api.endpoints.carbyStatus.url"), `Current CO² level: ${data.value}ppm`);
        }

        if (data.value > 1000) {
            const timeAgo = (new Date().getTime() - lastAlert) / 1000;
            if (timeAgo > Config.get("api.endpoints.general.interval")) {
                lastAlert = new Date().getTime();
                sendUpdate(Config.get("api.endpoints.general.url"), `The CO2 levels have reached an unbearable level of ${data.value}!`);
            }
        }
    });
})

function sendUpdate(url: string, message: string) {
    Axios.post(url, {
        text: message,
    })
}