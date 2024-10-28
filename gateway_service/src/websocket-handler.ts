// api-gateway/websocket-handler.ts
import { Server, Socket } from "socket.io";
import { Kafka } from "kafkajs";
import {
  Groups,
  Topics,
  ClientSocketEvents,
  GatewayEvents,
  KafkaEvent,
  EventPayloads,
  createEvent,
  validateKafkaEvent,
  ServiceNames,
} from "peerprep-shared-types";
import { CollaborationEvents } from "peerprep-shared-types/dist/types/kafka/collaboration-events";

type CollaborationEventKeys = Extract<keyof EventPayloads, CollaborationEvents>;

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
      clientId: ServiceNames.API_GATEWAY,
      brokers: [
        `${process.env.KAFKA_BROKER_ROUTE}:${process.env.KAFKA_BROKER_PORT}`,
      ],
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
    await this.consumer.subscribe({
      topic: Topics.GATEWAY_EVENTS,
      fromBeginning: false,
    });

    // Handle events from Collaboration Service
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }: any) => {
        const event = JSON.parse(message.value.toString());
        console.log(
          "Received gateway event from collaboration service:",
          event.type
        );

        validateKafkaEvent(event, topic as Topics);
        if (topic === Topics.GATEWAY_EVENTS) {
          const typedEvent = event as KafkaEvent<GatewayEvents>;
          await this.handleGatewayEvent(typedEvent);
        }
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

        // Purpose: to send the room details back to the user who joined the room
        //  first sends the join room event to collaboration service
        // collaboration will send back a refresh room state event which contains the current state of the room
        // this event will be sent back to the user who joined the room
        // create event
        const event = createEvent(CollaborationEvents.JOIN_ROOM, {
          roomId: data.roomId,
          username: data.username,
        });

        // send event to collaboration service
        await this.sendCollaborationEvent(event);
      });

      socket.on(ClientSocketEvents.CODE_CHANGE, async (data) => {
        const { roomId, username, message } = data;
        console.log("Code change in room:", message);

        // everyone in the room except the sender will receive the code change on frontend
        socket.to(roomId).emit(ClientSocketEvents.CODE_CHANGE, {
          username,
          roomId,
          content: message.sharedCode,
          language: message.language,
          timestamp: Date.now(),
        });

        const event = createEvent(CollaborationEvents.UPDATE_CODE, {
          roomId: data.roomId,
          username: data.username,
          content: data.message.sharedCode,
        });

        // send event to collaboration service
        await this.sendCollaborationEvent(event);
      });

      socket.on(ClientSocketEvents.SEND_MESSAGE, async (data) => {
        const { roomId, username, message } = data;
        console.log("Sending message in room:", data);

        const event = createEvent(CollaborationEvents.SEND_MESSAGE, {
          roomId: roomId,
          username: username,
          message: message,
        });

        // send event to collaboration service
        await this.sendCollaborationEvent(event);
      });

      socket.on(ClientSocketEvents.REQUEST_NEW_CHATS, async (data) => {
        const { roomId, lastMessageTimestamp } = data;
        console.log("Requesting new chats in room:", roomId);

        const event = createEvent(CollaborationEvents.REQUEST_NEW_CHATS, {
          roomId: roomId,
          lastMessageTimestamp: lastMessageTimestamp,
        });

        // send event to collaboration service
        await this.sendCollaborationEvent(event);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  }

  private async handleGatewayEvent(event: KafkaEvent<GatewayEvents>) {
    const { type, payload } = event;
    try {
      switch (type) {
        case GatewayEvents.REFRESH_ROOM_STATE:
          const roomPayload =
            event.payload as EventPayloads[GatewayEvents.REFRESH_ROOM_STATE];

          console.log("Room state refresh event received:", roomPayload);

          console.log("Broadcasting code change:");
          //   socket.emit("roomUpdated", {});
          this.io.to(roomPayload.roomId).emit("roomUpdated", {
            room: roomPayload.editorState,
          });

          break;
        case GatewayEvents.ERROR:
          console.log("Error event received:", payload);
          break;
        // todo send the error to the client socket
        case GatewayEvents.SIGNAL_NEW_CHAT:
          const newChatPayload =
            event.payload as EventPayloads[GatewayEvents.SIGNAL_NEW_CHAT];
          this.io
            .to(newChatPayload.roomId)
            .emit(ClientSocketEvents.SIGNAL_NEW_CHAT, {});
          break;
        case GatewayEvents.GET_NEW_CHATS:
          const newChatsPayload =
            event.payload as EventPayloads[GatewayEvents.GET_NEW_CHATS];
          this.io
            .to(newChatsPayload.roomId)
            .emit(ClientSocketEvents.REQUEST_NEW_CHATS, {
              newMessages: newChatsPayload.newMessages,
            });
          break;
      }
    } catch (error) {
      console.error("Error handling gateway event:", error);
    }
  }

  private async sendCollaborationEvent<T extends CollaborationEventKeys>(
    event: KafkaEvent<T>
  ) {
    console.log(
      "Sending collaboration event:",
      event.type,
      "to topic",
      Topics.COLLABORATION_EVENTS
    );

    await this.producer.send({
      topic: Topics.COLLABORATION_EVENTS,
      messages: [
        {
          key: event.payload.roomId,
          value: JSON.stringify(event),
        },
      ],
    });
  }
}
