import { ServerSocketEvents } from "peerprep-shared-types";
import { IMatch, IMatchRequest, IQueue } from "./queue";
import { createRoom } from "./room";

export interface INotifier {
  (
    success:
      | ServerSocketEvents.MATCH_FOUND
      | ServerSocketEvents.MATCH_REQUESTED
      | ServerSocketEvents.MATCH_CANCELED
      | ServerSocketEvents.MATCH_TIMEOUT,
    username: string,
    message?: any
  ): void;
}

export class Matcher {
  private readonly interval: number = 1000; // In milliseconds
  private queue: IQueue;
  private notifer: INotifier;
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(queue: IQueue, notifier: INotifier) {
    this.queue = queue;
    this.notifer = notifier;
  }

  public async match() {
    const map = this.queue.getRequests();
    const { expired } = this.removeExpiredRequests(map);
    this.notifyExpired(expired);
    const rooms = await this.matchUsers(map);
    this.notifyMatches(rooms);
    const queueLength = this.queue.getLength();
    console.log(`Current Queue Length is: ${queueLength}`);
    if (!queueLength) {
      console.log("Queue is empty, stopping matcher...");
      this.stop();
      return;
    }
    this.timeoutId = setTimeout(() => this.match(), this.interval);

    //TODO: Create rooms in database
  }

  private removeExpiredRequests(requestMap: Map<string, IMatchRequest[]>): {
    expired: IMatchRequest[];
  } {
    const expired: IMatchRequest[] = [];
    const now = Date.now();

    requestMap.forEach((requests, key, map) => {
      // Remove requests older than 30 seconds
      for (let i = requests.length - 1; i >= 0; i--) {
        if (requests[i].timestamp < now - 30 * 1000) {
          expired.push(requests[i]);
          requests.splice(i, 1);
        }
      }
    });

    return { expired };
  }

  private async matchUsers(
    requestMap: Map<string, IMatchRequest[]>
  ): Promise<IMatch[]> {
    let rooms: IMatch[] = [];
    for (let key of Array.from(requestMap.keys())) {
      const requests = requestMap.get(key);
      if (!requests || requests.length < 2) {
        continue;
      }

      while (requests.length >= 2) {
        const users = requests.splice(0, 2);

        if (users.length != 2) {
          continue;
        }

        // Create Room and place users inside
        const user1 = users[0];
        const user2 = users[1];
        const room = await this.createRoom(user1, user2);
        rooms.push(room);

        // Remove users from queue
        this.queue.cancel({ username: user1.username });
        this.queue.cancel({ username: user2.username });
      }
    }

    return rooms;
  }

  private async createRoom(
    user1: IMatchRequest,
    user2: IMatchRequest
  ): Promise<IMatch> {
    // Match user1 and user2
    let users = [user1.username, user2.username];
    let room = await createRoom(user1.topic, user1.difficulty, users);
    if (room) {
      console.log(`Match Found, Forwarding to room${room._id.toString()}`);
      return {
        roomId: room._id.toString(),
        usernames: room.users,
        topic: room.topic,
        difficulty: room.difficulty,
      };
    }
    throw Error("Invalid Room");
  }

  private async notifyExpired(expired: IMatchRequest[]) {
    for (let request of expired) {
      this.notifer(ServerSocketEvents.MATCH_TIMEOUT, request.username);
    }
  }

  private async notifyMatches(matches: IMatch[]) {
    matches.forEach((room) => {
      this.notifer(ServerSocketEvents.MATCH_FOUND, room.usernames[0], {
        roomId: room.roomId,
        opponentUsername: room.usernames[1],
      });
      this.notifer(ServerSocketEvents.MATCH_FOUND, room.usernames[1], {
        roomId: room.roomId,
        opponentUsername: room.usernames[0],
      });
    });
  }

  public start() {
    if (this.timeoutId === null) {
      this.match();
    }
  }

  public stop() {
    clearTimeout(this.timeoutId as NodeJS.Timeout);
    this.timeoutId = null;
  }
}
