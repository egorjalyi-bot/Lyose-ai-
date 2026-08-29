const http = require("http");
const fs = require("fs");
const path = require("path");
const WebSocket = require("ws");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {

  let file = req.url === "/"
    ? "index.html"
    : req.url.substring(1);

  const filePath = path.join(__dirname, file);

  fs.readFile(filePath, (err, data) => {

    if (err) {

      res.writeHead(404);
      res.end("Not found");
      return;

    }

    let type = "text/html";

    if (file.endsWith(".js"))
      type = "text/javascript";

    if (file.endsWith(".css"))
      type = "text/css";

    res.writeHead(200, {
      "Content-Type": type
    });

    res.end(data);

  });

});


const wss = new WebSocket.Server({
  server
});


const clients = new Set();


wss.on("connection", socket => {

  clients.add(socket);

  console.log(
    "User connected. Online:",
    clients.size
  );


  socket.on("message", raw => {

    let message;

    try {

      message =
        JSON.parse(raw.toString());

    } catch {

      return;

    }


    /*
      GLOBAL PREMIUM

      Любой пользователь,
      который уже имеет Premium,
      может отправить команду.

      Сервер рассылает событие
      ВСЕМ подключённым клиентам.
    */

    if(
      message.type ===
      "givePremiumAll"
    ){

      console.log(
        "GLOBAL PREMIUM EVENT"
      );


      for(
        const client of clients
      ){

        if(
          client.readyState ===
          WebSocket.OPEN
        ){

          client.send(
            JSON.stringify({
              type:"premiumAll"
            })
          );

        }

      }

    }

  });


  socket.on("close", () => {

    clients.delete(socket);

    console.log(
      "User disconnected. Online:",
      clients.size
    );

  });

});


server.listen(
  PORT,
  () => {

    console.log(
      `LunaSpaceLyos 1.9 running on port ${PORT}`
    );

  }
);
