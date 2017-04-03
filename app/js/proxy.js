/**
 * Created by nikolaysoroka on 03.04.17.
 */
'use strict';

const http = require('http'),
    url = require('url'),
    util = require('util'),
    pug = require('pug'),
    rx = require('rxjs'),
    httpProxy = require('http-proxy'),

    Message = require('./messages').Message;

function createProxy () {

    function logRequest(req) {
        var parsedUrl = url.parse(req.url);

        var method = req.method;
        var path = url.path;
        // "GET /hello.txt HTTP/1.1"
        var httpVersion = req.httpVersion;

        // <METHOD> <PATH> <VERSION>
        console.log(util.format("%s %s HTTP/%s", method, parsedUrl.path, httpVersion));
        for (var h in req.headers) {
            console.log(util.format("%s: %s", h, req.headers[h]));
        }
        logBody(req);
    }

    function logBody(message) {
        var body = '';
        message.on('data', function (chunk) {
            body += chunk;
        });
        message.on('end', function () {
            console.log("\n", body, "\n----\n");
        });
    }

    function logResponse(res) {
        console.log(util.format("HTTP/%s %d", res.httpVersion, res.statusCode));
        for (var h in res.headers) {
            console.log(util.format("%s: %s", h, res.headers[h]));
        }

        logBody(res);
    }

    function addHtmlElement(proxyRes, req) {
        var message = {};
        message.method = req.method;

        var parsedUrl = url.parse(req.url);
        message.path = parsedUrl.path;
        message.host = req.headers['host'];

        message.status = proxyRes.statusCode;

        var messageHtml = messageTemplate({message: message});
        for (var i = 1; i < 20; i++) {
            var element = document.createElement('div');
            element.innerHTML = messageHtml;
            messageContainer.appendChild(element);
        }
    }

    // Create a proxy server with custom application logic
    //
    var proxy = httpProxy.createProxyServer({});
    proxy.messageSubject = new rx.Subject();
    proxy.requestMessageMap = new Map();
    proxy.messageSubject.subscribe(
        function (message) {
            proxy.requestMessageMap.set(message.request, message);
        }
    );


    proxy.on('proxyRes', function (proxyRes, req, res) {
        var message = proxy.requestMessageMap.get(req);
        if (!message) {
            return;
        }

        message.updateResponse(proxyRes);
        proxy.requestMessageMap.delete(req);
    });

    var server = http.createServer(function(req, res) {
        // Update request.
        proxy.messageSubject.next(new Message(req));

        var target = url.parse(req.url);
        // You can define here your custom logic to handle the request
        // and then proxy the request.
        proxy.web(req, res, {
            target: target.protocol + '//' + target.host
        });
    });

    server.proxy = proxy;

    return server
}

module.exports.createProxy = createProxy;