## Othello sample app

This is a custom implementation of the game named Othello

> Want to learn more about Othello? [Click here](https://www.mastersofgames.com/rules/reversi-othello-rules.htm)

### Setting up your dev environment

1. Clone or fork this repo

2. Install dependencies by running `npm i` in the project root

3. You can run the command `npm start` to spin up an instance of the game, and enable hot-reloading for the _server_ directory in the project root

4. You can run the command `npm run start-babel` to enable hot-reloading for the _static/jsx_ directory in the project root

5. You can use the command `npm run debug` to start the server-side processes in debug mode. After running, open `chrome://inspect` and then click the link that says `open dedicated devtools for node`. The inspector window that opens should connect to your running debug process

### Deploying this app

Today, there isn't a 'production' deploy or build step. If you'd like to run the game on your own machine, clone or fork the repo, install dependencies, and then run the command `npm start` to spin up an instance of the game on your home network

### TODOs

- make a production build of this app (using dotenv configs and a clean source tree)
- implement 'room' functionality for multiple games and clients
- add auto-detection for no available moves for a user to take (auto-skip, refactor to validate moves ahead of time?)
