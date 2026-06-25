import http, {IncomingMessage, ServerResponse} from "http"
import WebSocket, { WebSocketServer } from "ws";
import fs from "fs/promises";
import path from "path";

const port = process.env.PORT ?? 9000;

const server = http.createServer( async (req: IncomingMessage, res: ServerResponse) => {
    const htmlfile = await fs.readFile(path.resolve('./index.html'), "utf-8")
    res.setHeader('Content-Type', 'text/html')
    res.end(htmlfile)
})

const wsServer = new WebSocketServer({server})

wsServer.on("connection", async (websocket: WebSocket) => {
    console.log("ws running");

    websocket.on("message", function (data) {
        console.log(data.toString());
        
        wsServer.clients.forEach((client) => {
            if( client.readyState === websocket.OPEN && client !== websocket ) {
                client.send(data.toString())
            }
        })
    })

    websocket.on("close", () => {
        console.log("disconnect from server");
        
    })
})


server.listen(port, () => {
    console.log(`server is running on http://localhost:${port}`)
})