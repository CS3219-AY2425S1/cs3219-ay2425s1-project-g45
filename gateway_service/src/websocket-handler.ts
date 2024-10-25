// api-gateway/websocket-handler.ts
import { Server, Socket } from "socket.io";
import { Kafka } from "kafkajs";
import { Groups, Topics, ClientSocketEvents } from "peerprep-shared-types";

export class WebSocketHandler {
  private io: Server;
  private kafka: Kafka;
  private producer: any;
  private consumer: any;

  constructor(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: `*`,
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    // this.kafka = new Kafka({
    //   clientId: "api-gateway",
    //   brokers: ["localhost:9092"],
    //   retry: {
    //     initialRetryTime: 100,
    //     retries: 8,
    //   },
    // });
    this.kafka = new Kafka({
      clientId: "api-gateway",
      brokers: [`kafka-service:${process.env.KAFKA_BROKER_PORT}`],
    });

    this.setupKafka();
    this.setupSocketHandlers();
  }

  private async setupKafka() {
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: Groups.API_GATEWAY_GROUP });

    await this.producer.connect();
    await this.consumer.connect();

    // Subscribe to gateway events from Collaboration Service
    await this.consumer.subscribe({ topic: Topics.COLLABORATION_EVENTS });

    // Handle events from Collaboration Service
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }: any) => {
        const event = JSON.parse(message.value.toString());
        console.log("Received event from collaboration service:", event.type);
        // eg after join room, send back the room details
        //  eg after code change, broadcast to all in room
        this.handleCollaborationEvent(event);
      },
    });
  }

  private setupSocketHandlers() {
    this.io.on("connection", (socket: Socket) => {
      console.log("Client connected:", socket.id);

      socket.on("requestMatch", async (data) => {
        await this.producer.send({
          topic: Topics.COLLABORATION_EVENTS,
          messages: [
            {
              key: socket.id,
              value: JSON.stringify({
                type: "MATCH_REQUEST",
                socketId: socket.id,
                ...data,
              }),
            },
          ],
        });
      });

      socket.on(ClientSocketEvents.JOIN_ROOM, async (data) => {
        console.log("Joining room:", data.roomId);
        socket.join(data.roomId);
        await this.producer.send({
          topic: Topics.COLLABORATION_EVENTS,
          messages: [
            {
              key: data.roomId,
              value: JSON.stringify({
                type: ClientSocketEvents.JOIN_ROOM,
                socketId: socket.id,
                username: data.username,
                roomId: data.roomId,
              }),
            },
          ],
        });
      });

      socket.on(ClientSocketEvents.CODE_CHANGE, async (data) => {
        const { roomId, username, message } = data;
        console.log("Code change in room:", message);

        socket.to(roomId).emit(ClientSocketEvents.CODE_CHANGE, {
          username,
          roomId,
          content: message.sharedCode,
          language: message.language,
          timestamp: Date.now(),
        });

        await this.producer.send({
          topic: Topics.COLLABORATION_EVENTS,
          messages: [
            {
              key: data.roomId,
              value: JSON.stringify({
                type: ClientSocketEvents.CODE_CHANGE,
                socketId: socket.id,
                content: data.message.sharedCode,
                roomId: data.roomId,
                username: data.username,
              }),
            },
          ],
        });
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  }

  private handleCollaborationEvent(event: any) {
    switch (event.type) {
      case "MATCH_FOUND":
        console.log("Match found:", event.participants);
        this.io.to(event.socketId).emit("matchFound", {
          roomId: event.roomId,
          participants: event.participants,
        });
        break;

      case "CODE_CHANGED":
        console.log("Broadcasting code change:");
        this.io.to(event.roomId).emit("codeChanged", {
          userId: event.userId,
          change: event.change,
          roomState: event.roomState, // Include room state
          language: event.language,
        });
        break;

      case "ROOM_UPDATED":
        console.log("Broadcasting room update:");
        console.log(event);
        this.io.to(event.roomId).emit("roomUpdated", event.room);
        break;
      case "REFRESH_STATE":
        console.log("Broadcasting room refresh:");
        console.log(event);
        this.io.to(event.roomId).emit("roomUpdated", event.state);
        break;
    }
  }
}
