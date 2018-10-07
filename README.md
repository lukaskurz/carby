# carby

A slack chatbot interacting with an MQTT network.
Made for IOT-style projects using MQTT who want to incorporate a slackbot into their solution.

# Get started

You can either start the project directly, if you have `npm` and `node` installed or you can build a `docker` image and create a container running the application.

## Without docker

Clone the repo and then install the npm dependecies.

```npm install```

To start the project you first have to build it using

```npm run build```

or if you want to code and develop on it, you can keep it running, watching file changes and compiling when necessary.

```npm run build:watch```

After having built the project, you need to do some configuration, by creating a `default.json` in the `config` folder using the `template.json`.
After having done that, you can finally start the project by typing the following command.

```npm start```

## With docker

Clone the repo and configure the application by creating a `default.json` in the `config` folder using the `template.json`.
After that, build a new image using this.

```docker build carby:latest .```

Having built the image you can start a new container with the application running by typing this.

```docker run -p 80:80 carby:latest```

If you want to be to close the terminal/session without the application stopping, add the `-d` flag after `docker run`.
The `-p` flag tells docker with ports to expose, so if you any other ports (for exaple `1883` and `8080`) just add them to the command as shown in the following command.

```docker run -p 1883:1883 -p 8080:8080```



Ideally, you should be ready to go after that. If there are some problems with this process, please look for help in the issues or create an issue for the problem.
And if you're eager to do some open source work, you can go ahead, fix the bug yourself and create a pull request :)
