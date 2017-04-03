// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
'use strict';

const http = require('http'),
      url = require('url'),
      util = require('util'),
      pug = require('pug'),
      proxy = require('./js/proxy');


let isRunning;
let button;
let server;
let messageContainer;

const messageTemplate = pug.compileFile('./app/message-item.pug');

function initProxyServer() {
    if (server) {
        return server;
    }

    server = proxy.createProxy();
    server.proxy.messageSubject.subscribe(
        function (message) {
            const element = document.createElement('div');
            messageContainer.appendChild(element);

            const updateMessageView = function (message) {
                element.innerHTML = messageTemplate({message: message});
            };

            message.updateSubject.subscribe(updateMessageView);
        }
    );

    return server;
}

function setRunning (running) {
    isRunning = running;
    console.log('set running: ', running);

    if (isRunning) {
        if (!server) {
            server = initProxyServer();
        }

        server.listen(5050);
        button.innerHTML = 'stop';
    } else {
        if (server) {
            server.close();
        }

        button.innerHTML = 'start';
    }
}

window.onload = function () {
    button = document.getElementById("start-stop");    
    messageContainer = document.getElementById("messages-container");

    button.onclick = function () {
        setRunning(!isRunning);      
    };
    setRunning(false);

    console.log("I'm a teapot!!!");
};
