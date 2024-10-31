import React, {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
  useEffect,
} from "react";
import { useSocket } from "./socket-context";
import { useAuth } from "./auth-context";
import Peer from "simple-peer";

interface CallContextType {
  callState: CallState;
  ownVideoRef: React.RefObject<HTMLVideoElement>;
  userVideoRef: React.RefObject<HTMLVideoElement>;
  call: (roomId: string) => void;
  acceptCall: (roomId: string) => void;
  endCall: (roomId: string) => void;
}

const CallContext = createContext<CallContextType | null>(null);

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
};

interface CallProviderProps {
  children: ReactNode;
}

enum CallAction {
  CALL_USER = "CALL_USER",
  ACCEPT_CALL = "ACCEPT_CALL",
  END_CALL = "END_CALL",
}

enum CallStates {
  CALL_INITIATED = "CALL_INITIATED",
  CALL_RECEIVED = "CALL_RECEIVED",
  CALL_ACCEPTED = "CALL_ACCEPTED",
  CALL_ENDED = "CALL_ENDED",
}

interface CallState {
  current_state: CallStates;
  otherUser: string;
  signalData: Peer.SignalData | null;
}

export const CallProvider: React.FC<CallProviderProps> = ({ children }) => {
  const { socket } = useSocket();
  const { username } = useAuth();

  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [callState, setCallState] = useState<CallState>({
    current_state: CallStates.CALL_ENDED,
    otherUser: "",
    signalData: null,
  });

  const ownVideoRef = useRef<HTMLVideoElement>(null);
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<Peer.Instance | null>(null);

  useEffect(() => {
    if (!socket) return;
    // For receiving calls
    socket.on(
      CallAction.CALL_USER,
      ({ from, signalData }: { from: string; signalData: Peer.SignalData }) => {
        setCallState({
          current_state: CallStates.CALL_RECEIVED,
          otherUser: from,
          signalData,
        });
      }
    );

    // For receiving call acceptance
    socket.on(
      CallAction.ACCEPT_CALL,
      ({ from, signalData }: { from: string; signalData: Peer.SignalData }) => {
        setCallState({
          current_state: CallStates.CALL_ACCEPTED,
          otherUser: from,
          signalData: signalData,
        });

        connectionRef.current?.signal(signalData);
      }
    );

    socket.on(CallAction.END_CALL, () => {
      setCallState({
        current_state: CallStates.CALL_ENDED,
        otherUser: "",
        signalData: null,
      });

      connectionRef.current?.destroy();
    });
  }, [socket]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setVideoStream(stream);
        if (ownVideoRef.current) {
          ownVideoRef.current.srcObject = stream;
        }
      });
  }, [ownVideoRef, setVideoStream]);

  const call = (roomId: string) => {
    if (callState.current_state !== CallStates.CALL_ENDED || !socket) return;

    setCallState({
      current_state: CallStates.CALL_INITIATED,
      otherUser: "",
      signalData: null,
    });

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: videoStream,
    });

    peer.on("signal", (signalData) => {
      socket.emit(CallAction.CALL_USER, {
        from: username,
        roomId: roomId,
        signalData: signalData,
      });
    });

    peer.on("stream", (stream) => {
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
      }
    });

    connectionRef.current = peer;
  };

  const acceptCall = (roomId: string) => {
    if (!socket || !callState.signalData) return;

    setCallState({
      current_state: CallStates.CALL_ACCEPTED,
      otherUser: callState.otherUser,
      signalData: callState.signalData,
    });

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: videoStream,
    });

    peer.on("signal", (signalData) => {
      socket.emit(CallAction.ACCEPT_CALL, {
        roomId: roomId,
        from: username,
        signalData,
      });
    });

    peer.signal(callState.signalData);

    peer.on("stream", (stream) => {
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
      }
    });

    connectionRef.current = peer;
  };

  const endCall = (roomId: string) => {
    if (!socket) return;

    socket.emit(CallAction.END_CALL, {
      roomId: roomId,
      to: callState.otherUser,
    });

    setCallState({
      current_state: CallStates.CALL_ENDED,
      otherUser: "",
      signalData: null,
    });

    connectionRef.current?.destroy();
  };

  return (
    <CallContext.Provider
      value={{
        callState,
        ownVideoRef,
        userVideoRef,
        call,
        acceptCall,
        endCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
