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

const messageView = pug.compileFile('./app/message-item.pug');
const detailsView = pug.compileFile('./app/views/message-details.pug');

function initProxyServer() {
    if (server) {
        return server;
    }

    server = proxy.createProxy();
    server.proxy.messageSubject.subscribe(
        function (message) {
            const element = document.createElement('div');
            element.className = "message-wrap";
            element.tabIndex = -1;
            messageContainer.appendChild(element);

            element.onclick = function () {
                onMessageSelected(element, message);
            };

            const updateMessageView = function (message) {
                element.innerHTML = messageView({message: message});
            };

            message.updateSubject.subscribe(updateMessageView);
        }
    );

    return server;
}

function displayDetails(message) {
    var requestData = message.getRequestData();
    var responseData = message.getResponseData();

    document.getElementById('content').innerHTML = detailsView({
        requestData: requestData,
        responseData: responseData
    })
}
function onMessageSelected(element, message) {
    window.setTimeout(function () {
        console.log("focusing:", element);
        displayDetails(message);
    }, 0);
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
    setRunning(true);

    console.log("I'm a teapot!!!");
};
