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
let listenAddressText;
let selectedMessageView;
let selectedMessageSubscription;

const messageView = pug.compileFile('./app/message-item.pug');
const detailsView = pug.compileFile('./app/views/message-details.pug');

function initProxyServer() {
    if (server) {
        return server;
    }

    server = proxy.createProxy();
    server.proxy.messageSubject.subscribe(
        function (message) {
            console.log('adding message');

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

            updateMessageView(message);
            message.updateSubject.subscribe(updateMessageView);
        }
    );

    return server;
}

function displayDetails(message) {
    var requestData = message.getRequestData();
    var responseData = message.getResponseData();

    let args = {
        requestData: requestData,
        responseData: null
    };

    if (responseData) {
        args.responseData = responseData;
    }

    document.getElementById('content').innerHTML = detailsView(args)
}

function onMessageSelected(element, message) {
    window.setTimeout(function () {
        if (selectedMessageView) {
            selectedMessageView.style.backgroundColor = 'transparent';
        }
        if (selectedMessageSubscription) {
            selectedMessageSubscription.unsubscribe();
        }
        selectedMessageSubscription = message.updateSubject.subscribe(displayDetails);

        element.style.backgroundColor = '#E9ECED';
        selectedMessageView = element;

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
        listenAddressText.innerHTML = util.format('addresses: %s\nport = 5050', proxy.getCurrentIpAddress());
    } else {
        if (server) {
            server.close();
        }

        button.innerHTML = 'start';
        listenAddressText.innerHTML = '';
    }
}

window.onload = function () {
    button = document.getElementById("start-stop");
    messageContainer = document.getElementById("messages-container");
    listenAddressText = document.getElementById("listen-address");

    button.onclick = function () {
        setRunning(!isRunning);      
    };
    setRunning(true);

    console.log("I'm a teapot!!!");
};
