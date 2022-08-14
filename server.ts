import devServer from "@/server/dev";
import prodServer from "@/server/prod";
import express from "express";
import { Server } from 'socket.io'
import http from 'http'
import UserService from "@/service/UserService";
import moment from 'moment';
import compression from "compression";
import path from "path";

const port = 3000;
const app = express();
const server = http.createServer(app)
const io = new Server(server)
const userService = new UserService()

// 2. 監測連接
io.on('connection', (socket) => {

  // 3. 針對當個連接發送訊息
  socket.emit('userID', socket.id)

  socket.on('join', ({ userName, roomName }: { userName: string, roomName:string }) => {
    const userData = userService.userDataInfoHandler(
      socket.id,
      userName,
      roomName
    )

    // socket內建，讓用戶夾到某空間
    socket.join(userData.roomName)
    userService.addUser(userData)
    // socket.broadcast.to(roomName) => socket.join(roomName)
    socket.broadcast
      .to(userData.roomName)
      .emit('join', `${userName} 加入了 ${roomName} 聊天室`)
  })

  socket.on('chat', (msg) => {  
    const time = moment.utc() 
    const userData = userService.getUser(socket.id)
    if (userData) {
      // 
      io
        .to(userData.roomName)
        .emit('chat', { userData, msg, time })
    }
  })

  // socket原生事件 disconnect -> 斷開連結
  socket.on('disconnect', () => {
    const userData = userService.getUser(socket.id)
    const userName = userData?.userName
    if (userName) {
      socket.broadcast
        .to(userData.roomName)
        .emit('leave', `${userData.userName} 離開 ${userData.roomName} 聊天室`)
    }    
    userService.removeUser(socket.id)
  })

})

// 執行npm run dev本地開發 or 執行npm run start部署後啟動線上伺服器
app.use(compression());
app.use(express.static(path.resolve(__dirname, "../../dist")));

app.get("/", function (req, res, next) {
  res.sendFile("./main/main.html", { root: 'dist' });
});

app.get("/main", function (req, res, next) {
  res.sendFile("./main/main.html", { root: 'dist' });
});

app.get("/chatroom", function (req, res, next) {
  res.sendFile("./chatroom/chatroom.html", { root: 'dist' });
});

server.listen(port, () => {
  console.log(`The application is running on port ${port}.`);
});
