import express, { Express } from "express";
import compression from "compression";
import path from "path";

export default function (app: Express) {
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
}
