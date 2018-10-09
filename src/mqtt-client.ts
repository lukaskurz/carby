import { IConfig } from "config";
import * as Mqtt from "mqtt";
import { MqttClient } from "mqtt";
import { Observable, Subject, Observer, observable } from 'rxjs';

export default class MqttManager {
    client: MqttClient;
    messages: Subject<MqttMessage>;

    constructor(public config: IConfig) {
        this.client = Mqtt.connect(this.config.get("mqtt.url"));
        this.messages = new Subject();
    }

    connect(url = this.config.get("mqtt.url") as string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.client.once("connect", () => {
                console.log("MQTT: Connect successful");
                resolve();
            });
            this.client.once("error", (err) => {
                console.log("MQTT: Connect unsuccessful");
                reject(err);
            });
        })
    }

    subscribe(topics?: string[]) {
        const configTopics = this.config.get("mqtt.topics") as Array<string>;
        let concatTopics: string[] = [];

        if (!!topics && topics.length != 0) { // If topics from param exist and have entries
            concatTopics = concatTopics.concat(topics);
        } else if (!!configTopics && configTopics.length != 0) { // If topics from config exist and have entries
            concatTopics = concatTopics.concat(configTopics);
        } else {
            console.log("MQTT: No topics defined");
            return Promise.reject("No topics defined")
        }

        if (this.client.connected) {
            let index = concatTopics.length;
            let promises = [];
            while (index--) {
                let currentTopic = concatTopics[index];
                promises.push(new Promise((resolve, reject) => {
                    this.client.subscribe(currentTopic, (err) => {
                        if (err) {
                            console.log(`MQTT: Subscription to ${currentTopic} unsuccessful`);
                            reject(err);
                        } else {
                            console.log(`MQTT: Subscription to ${currentTopic} successful`);
                            resolve();
                        }
                    });
                }));
            }
            return Promise.all(promises).then(() => { console.log(`MQTT: Subscription to all topics successful`); })
        } else {
            console.log(`MQTT: Client not connected`);
            return Promise.reject("Client not connected");
        }
    }

    listen(): Subject<MqttMessage> {
        this.messages = new Subject();

        this.client.on("message", (topic, message) => {
            console.log(`MQTT: Message: ${topic}: ${message}`);

            let data = JSON.parse(message.toString());
            if (!this.isMeasurement(data)) {
                console.log("MQTT: Message: Not a measurement");
                this.messages.error("Message: Not a measurement");
            } else {
                this.messages.next({ topic: topic, data: data as Measurement });
            }
        });

        return this.messages;
    }

    private isMeasurement(data: Object) {
        return data.hasOwnProperty("timestamp") && data.hasOwnProperty("value");
    }
}

export interface Measurement {
    timestamp: number;
    value: number;
}

export interface MqttMessage {
    topic: string;
    data: Measurement;
}