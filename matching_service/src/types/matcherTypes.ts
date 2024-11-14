// Define necessary types within this file

export interface MatchRequest {
  username: string;
  topic: string;
  difficulty: string;
  timestamp?: number;
}

export interface MatchCancelRequest {
  username: string;
}

export interface MatchResponse {
  success: boolean;
}

export interface MatchCancelResponse {
  success: boolean;
}

export interface Match {
  usernames: string[];
  topic: string;
  difficulty: string;
}
