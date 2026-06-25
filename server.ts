import http, {IncomingMessage, ServerResponse} from "http"
import WebSocket, { WebSocketServer } from "ws";
import { redisPublish, redisSubscribe } from "./redis";
import fs from "fs/promises";
import path from "path";

const port = process.env.PORT ?? 9000;
const REDIS_CHANNEL = "ws-message"

const server = http.createServer( async (req: IncomingMessage, res: ServerResponse) => {
    const htmlfile = await fs.readFile(path.resolve('./index.html'), "utf-8")
    res.setHeader('Content-Type', 'text/html')
    res.end(htmlfile)
})

const wsServer = new WebSocketServer({server})

redisSubscribe.subscribe(REDIS_CHANNEL)

redisSubscribe.on("message", (channel: string, message: string) => {
    if( channel === REDIS_CHANNEL ) {
        wsServer.clients.forEach((client) => {
            if( client.readyState === WebSocket.OPEN ) {
                client.send(message.toString())
            }
        })
    }
})

wsServer.on("connection", async (websocket: WebSocket) => {
    console.log("ws running");

    websocket.on("message", async function (data) {
        console.log(data.toString());
        
        await redisPublish.publish(REDIS_CHANNEL, data.toString());
    })

    websocket.on("close", () => {
        console.log("disconnect from server");
        
    })
})


server.listen(port, () => {
    console.log(`server is running on http://localhost:${port}`)
})