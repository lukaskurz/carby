import { IConfig } from "config";
import * as Mqtt from "mqtt";
import { MqttClient } from "mqtt";
import { Observable, Subject, Observer, observable } from 'rxjs';

export default class MqttManager {
    client: MqttClient;
    messages: Subject<Measurement>;

    constructor(public config: IConfig) {
        this.messages = new Subject();
        this.client = Mqtt.connect(this.config.get("mqtt.url"));
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
        const concatTopics: string[] = [];

        if (!!topics && topics.length != 0) { // If topics from param exist and have entries
            concatTopics.concat(topics);
        } else if (!!configTopics && configTopics.length != 0) { // If topics from config exist and have entries
            concatTopics.concat(configTopics);
        } else {
            console.log("MQTT: No topics defined");
            return Promise.reject("No topics defined")
        }

        if (this.client.connected) {
            let index = concatTopics.length;
            let promises = [];
            while (index--) {
                promises.push(new Promise((resolve, reject) => {
                    this.client.subscribe(concatTopics[index], (err) => {
                        if (err) {
                            console.log(`MQTT: Subscription to ${concatTopics[index]} unsuccessful`);
                            reject(err);
                        }
                        console.log(`MQTT: Subscription to ${concatTopics[index]} successful`);
                        resolve();
                    });
                }));
            }
            console.log(`MQTT: Subscription to all topics successful`);
            return Promise.all(promises)
        } else {
            console.log(`MQTT: Client not connected`);
            return Promise.reject("Client not connected");
        }
    }

    listen(): Observable<Measurement> {
        return Observable.create((observer: Observer<Measurement>) => {
            this.client.on("message", (topic, message) => {
                console.log(`MQTT: Message: ${topic}: ${message}`);

                let data = JSON.parse(message.toString());
                if (!(data instanceof Measurement)) {
                    console.log(`MQTT: Message: Not a measurement`);
                    observer.error("Not a measurement");
                }

                observer.next(data as Measurement);
            });
        });
    }
}

export class Measurement {
    constructor(public time: number, public value: number) { }
}