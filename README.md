# carby

A slack chatbot interacting with an MQTT network.
Made for IOT-style projects using MQTT who want to incorporate a slackbot into their solution.

# Get started

Clone the repo using

```git clone https://github.com/lukaskurz/carby.git```

and then install the npm dependecies.

```npm install```

To start the project you first have to build it using

```npm run build```

or if you want to code and develop on it, you can keep it running, watching file changes and compiling when necessary.

```npm run build:watch```

After having built the project, you need to do some configuration, by creating a `default.json` in the `config` folder using the `template.json`.
After having done that, you can finally start the project by typing.

```npm start```

Ideally, you should be ready to go after that. If there are some problems with this process, please look for help in the issues or create an issue for the problem.
And if you're eager to do some open source work, you can go ahead, fix the bug yourself and create a pull request :)
