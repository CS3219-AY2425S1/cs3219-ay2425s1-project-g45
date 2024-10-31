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
  ServerSocketEvents,
} from "peerprep-shared-types";
import { CollaborationEvents } from "peerprep-shared-types/dist/types/kafka/collaboration-events";
import { MatchingEvents } from "peerprep-shared-types/dist/types/kafka/matching-events";
import { handleMatchFound } from "./services/matchingHandler";
import RedisService from "./services/redisService";
import { setUpChatHandler } from "./socketHandlers/chatHandler";
import { setupRoomHandler } from "./socketHandlers/roomHandler";
import { setUpCallHandler } from "./socketHandlers/callHandler";

type CollaborationEventKeys = Extract<keyof EventPayloads, CollaborationEvents>;

export class WebSocketHandler {
  private io: Server;
  private kafka: Kafka;
  private producer: any;
  private consumer: any;
  private redis: RedisService;

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
    this.redis = RedisService.getInstance();
  }

  private async setUsernameSocketId(username: string, socketId: string) {
    let key = `${username}-socket`;
    await this.redis.set(key, socketId);
  }

  private async getUsernameSocketId(username: string) {
    let key = `${username}-socket`;
    let result = await this.redis.get(key);
    return result;
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

      socket.on(ClientSocketEvents.REQUEST_MATCH, async (data) => {
        console.log("Match Requested");
        const event = createEvent(MatchingEvents.MATCH_REQUESTED, {
          username: data.username,
          difficulty: data.selectedDifficulty,
          topic: data.selectedTopic,
        });
        await this.setUsernameSocketId(data.username, socket.id);
        await this.producer.send({
          topic: Topics.MATCHING_EVENTS,
          messages: [
            {
              key: socket.id,
              value: JSON.stringify(event),
            },
          ],
        });
        console.log(`Sent event: ${JSON.stringify(event)}`);
      });

      setUpChatHandler(socket, this.sendCollaborationEvent.bind(this));
      setupRoomHandler(socket, this.sendCollaborationEvent.bind(this));
      setUpCallHandler(socket, this.sendCollaborationEvent.bind(this));
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
        case GatewayEvents.NEW_CHAT:
          const newChatPayload =
            event.payload as EventPayloads[GatewayEvents.NEW_CHAT];
          console.log(
            "Sending new chat to room:",
            newChatPayload.roomId,
            newChatPayload.message
          );
          this.io
            .to(newChatPayload.roomId)
            .emit(ClientSocketEvents.NEW_CHAT, newChatPayload.message);
          break;
        case GatewayEvents.REFRESH_CHAT_STATE:
          const chatStatePayload =
            event.payload as EventPayloads[GatewayEvents.REFRESH_CHAT_STATE];
          console.log(
            "Sending chat state to room:",
            chatStatePayload.roomId,
            chatStatePayload.chatState
          );
          this.io
            .to(chatStatePayload.roomId)
            .emit(ClientSocketEvents.CHAT_STATE, {
              messages: chatStatePayload.chatState.messages,
            });
          break;
        case GatewayEvents.MATCH_FOUND:
          const matchFoundPayload =
            event.payload as EventPayloads[GatewayEvents.MATCH_FOUND];
          let room = await handleMatchFound(
            matchFoundPayload.usernames,
            matchFoundPayload.topic,
            matchFoundPayload.difficulty
          );
          for (const username of matchFoundPayload.usernames) {
            console.log(username);
            const socketId = await this.getUsernameSocketId(username);
            if (socketId) {
              this.io.to(socketId).emit(ServerSocketEvents.MATCH_FOUND, {
                roomId: room._id,
                questionId: room.question,
              });
            } else {
              throw Error("No socket found for user");
            }
          }
          break;
        case GatewayEvents.CHANGE_QUESTION:
          const changeQuestionPayload =
            event.payload as EventPayloads[GatewayEvents.CHANGE_QUESTION];
          console.log(
            "Sending question change to room:",
            changeQuestionPayload.roomId,
            changeQuestionPayload.questionId
          );
          this.io
            .to(changeQuestionPayload.roomId)
            .emit(ClientSocketEvents.QUESTION_CHANGE, {
              questionId: changeQuestionPayload.questionId,
            });
          break;
      }
    } catch (error) {
      console.error("Error handling gateway event:", error);
    }
  }

  private async sendCollaborationEvent<T extends CollaborationEventKeys>(
    event: KafkaEvent<T>,
    key: string
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
          key: key,
          value: JSON.stringify(event),
        },
      ],
    });
  }
}
