import { PeerprepRequest, PeerprepResponse } from ".";
import { EditorState } from "../editor";

export enum EditorClientEvents {
  CHANGE_CODE = "CHANGE_CODE",
  CHANGE_LANGUAGE = "CHANGE_LANGUAGE",
  REQUEST_NEXT_QUESTION = "REQUEST_NEXT_QUESTION",
  REPLY_NEXT_QUESTION = "REPLY_NEXT_QUESTION",
}

export enum EditorServerEvents {
  EDITOR_STATE = "EDITOR_STATE",
  CODE_CHANGED = "CODE_CHANGED",
  LANGUAGE_CHANGED = "LANGUAGE_CHANGED",
  NEXT_QUESTION_REQUESTED = "NEXT_QUESTION_REQUESTED",
  NEXT_QUESTION_REPLIED = "NEXT_QUESTION_REPLIED",
  QUESTION_CHANGED = "QUESTION_CHANGED",
}

export interface CodeChangeRequest extends PeerprepRequest {
  event: EditorClientEvents.CHANGE_CODE;
  roomId: string;
  sharedcode: string;
}

export interface LanguageChangeRequest extends PeerprepRequest {
  event: EditorClientEvents.CHANGE_LANGUAGE;
  roomId: string;
  language: string;
}

export interface NextQuestionRequest extends PeerprepRequest {
  event: EditorClientEvents.REQUEST_NEXT_QUESTION;
  roomId: string;
}

export interface NextQuestionReply extends PeerprepResponse {
  event: EditorServerEvents.NEXT_QUESTION_REPLIED;
  roomId: string;
  accepted: boolean;
}

export interface EditorStateResponse extends PeerprepResponse {
  event: EditorServerEvents.EDITOR_STATE;
  roomId: string;
  state: EditorState;
}

export interface CodeChangedResponse extends PeerprepResponse {
  event: EditorServerEvents.CODE_CHANGED;
  roomId: string;
  sharedcode: string;
}

export interface LanguageChangedResponse extends PeerprepResponse {
  event: EditorServerEvents.LANGUAGE_CHANGED;
  roomId: string;
  language: string;
}

export interface NextQuestionResponse extends PeerprepResponse {
  event: EditorServerEvents.NEXT_QUESTION_REQUESTED;
  roomId: string;
}

export interface ReplyNextResponse extends PeerprepResponse {
  event: EditorServerEvents.NEXT_QUESTION_REPLIED;
  roomId: string;
  accepted: boolean;
}

export interface QuestionChangedResponse extends PeerprepResponse {
  event: EditorServerEvents.QUESTION_CHANGED;
  roomId: string;
  questionId: string;
}

export interface EditorClientToServerEvents {
  [EditorClientEvents.CHANGE_CODE]: (request: CodeChangeRequest) => void;
  [EditorClientEvents.CHANGE_LANGUAGE]: (
    request: LanguageChangeRequest
  ) => void;
  [EditorClientEvents.REQUEST_NEXT_QUESTION]: (
    request: NextQuestionRequest
  ) => void;
  [EditorClientEvents.REPLY_NEXT_QUESTION]: (
    request: NextQuestionReply
  ) => void;
}

export interface EditorServerToClientEvents {
  [EditorServerEvents.EDITOR_STATE]: (response: EditorStateResponse) => void;
  [EditorServerEvents.CODE_CHANGED]: (response: CodeChangedResponse) => void;
  [EditorServerEvents.LANGUAGE_CHANGED]: (
    response: LanguageChangedResponse
  ) => void;
  [EditorServerEvents.NEXT_QUESTION_REQUESTED]: (
    response: NextQuestionResponse
  ) => void;
  [EditorServerEvents.NEXT_QUESTION_REPLIED]: (
    response: ReplyNextResponse
  ) => void;
  [EditorServerEvents.QUESTION_CHANGED]: (
    response: QuestionChangedResponse
  ) => void;
}
