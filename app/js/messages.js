/**
 * Created by nikolaysoroka on 03.04.17.
 */
'use strict';

const rx = require('rxjs'),
      util = require('util'),
      url = require('url');


function Message(req) {
    this.updateSubject = new rx.Subject();

    this.request = req;
    this.method = req.method;

    this.path = url.parse(req.url).path;
    this.host = req.headers['host'];

    this.requestBody = '';
    this.responseBody = '';

    var message = this;
    req.on('data', function (chunk) {
        message.requestBody += chunk;
    });
    req.on('end', function () {
        console.log("request-body-end", "\n----\n");
    });
}

Message.prototype.updateResponse = function (proxyRes) {
    this.response = proxyRes;
    this.status = proxyRes.statusCode;

    var message = this;
    proxyRes.on('data', function (chunk) {
        console.log('Add Chunk: \n' + chunk);
        message.responseBody += chunk;
    });
    proxyRes.on('end', function () {
        console.log("response-body-end", "\n----\n");
    });

    this.updateSubject.next(this);
};


Message.prototype.getRequestData = function () {
    var result = "";
    result += util.format("%s %s HTTP/%s", this.method, this.path, this.request.httpVersion);
    result += '\n';

    for (var h in this.request.headers) {
        result += util.format("\n%s: %s", h, this.request.headers[h]);
    }

    result += '\n';
    result += this.requestBody;

    return result;
};

Message.prototype.getResponseData = function () {
    var res = this.response;
    if (!res) {
        return null;
    }

    var result =  util.format("HTTP/%s %d", res.httpVersion, res.statusCode);

    for (var h in res.headers) {
        result += util.format("\n%s: %s", h, res.headers[h]);
    }


    result += this.responseBody;

    return result;
};

module.exports.Message = Message;