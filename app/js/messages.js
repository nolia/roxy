/**
 * Created by nikolaysoroka on 03.04.17.
 */
'use strict';

const rx = require('rxjs'),
      url = require('url');


function Message(req) {
    this.updateSubject = new rx.Subject();

    this.request = req;
    this.method = req.method;

    this.path = url.parse(req.url).path;
    this.host = req.headers['host'];

}

Message.prototype.updateResponse = function (proxyRes) {
    this.response = proxyRes;
    this.status = proxyRes.statusCode;
    this.updateSubject.next(this);
};

module.exports.Message = Message;