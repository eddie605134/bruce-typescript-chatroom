"use strict";
exports.__esModule = true;
var dev_1 = require("@/server/dev");
var prod_1 = require("@/server/prod");
var express_1 = require("express");
var socket_io_1 = require("socket.io");
var http_1 = require("http");
var UserService_1 = require("@/service/UserService");
var moment_1 = require("moment");
var port = 3000;
var app = (0, express_1["default"])();
var server = http_1["default"].createServer(app);
var io = new socket_io_1.Server(server);
var userService = new UserService_1["default"]();
// 2. 監測連接
io.on('connection', function (socket) {
    // 3. 針對當個連接發送訊息
    socket.emit('userID', socket.id);
    socket.on('join', function (_a) {
        var userName = _a.userName, roomName = _a.roomName;
        var userData = userService.userDataInfoHandler(socket.id, userName, roomName);
        // socket內建，讓用戶夾到某空間
        socket.join(userData.roomName);
        userService.addUser(userData);
        // socket.broadcast.to(roomName) => socket.join(roomName)
        socket.broadcast
            .to(userData.roomName)
            .emit('join', "".concat(userName, " \u52A0\u5165\u4E86 ").concat(roomName, " \u804A\u5929\u5BA4"));
    });
    socket.on('chat', function (msg) {
        var time = moment_1["default"].utc();
        var userData = userService.getUser(socket.id);
        if (userData) {
            // 
            io
                .to(userData.roomName)
                .emit('chat', { userData: userData, msg: msg, time: time });
        }
    });
    // socket原生事件 disconnect -> 斷開連結
    socket.on('disconnect', function () {
        var userData = userService.getUser(socket.id);
        var userName = userData === null || userData === void 0 ? void 0 : userData.userName;
        if (userName) {
            socket.broadcast
                .to(userData.roomName)
                .emit('leave', "".concat(userData.userName, " \u96E2\u958B ").concat(userData.roomName, " \u804A\u5929\u5BA4"));
        }
        userService.removeUser(socket.id);
    });
});
// 執行npm run dev本地開發 or 執行npm run start部署後啟動線上伺服器
if (process.env.NODE_ENV === "development") {
    (0, dev_1["default"])(app);
}
else {
    (0, prod_1["default"])(app);
}
server.listen(port, function () {
    console.log("The application is running on port ".concat(port, "."));
});
