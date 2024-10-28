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
import { MatchingEvents } from "peerprep-shared-types/dist/types/kafka/matching-events";

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

        await this.handleGatewayEvent(event);
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
        await this.sendCollaborationEvent(event, data.roomId);
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
        await this.sendCollaborationEvent(event, roomId);
      });

      socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
      });
    });
  }

  private async handleGatewayEvent(event: KafkaEvent<keyof EventPayloads>) {
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
        // todo send the error to the client socket
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
