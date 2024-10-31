"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
  useEffect,
  use,
} from "react";
import { useSocket } from "./socket-context";
import { useAuth } from "./auth-context";
import Peer from "simple-peer";
import { ClientSocketEvents, CallStates } from "peerprep-shared-types";
import Modal from "@/components/common/modal";
import Button from "@/components/common/button";

interface CallContextType {
  callState: CallState;
  callPermissions: CallPermissions;
  ownVideoRef: React.RefObject<HTMLVideoElement>;
  userVideoRef: React.RefObject<HTMLVideoElement>;
  call: (roomId: string) => void;
  acceptCall: (roomId: string) => void;
  endCall: (roomId: string) => void;
  setVideo: (on: boolean) => void;
  setAudio: (on: boolean) => void;
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

interface CallState {
  current_state: CallStates;
  otherUser: string;
  signalData: Peer.SignalData | null;
}

interface CallPermissions {
  videoOn: boolean;
  audioOn: boolean;
}

export const CallProvider: React.FC<CallProviderProps> = ({ children }) => {
  const { socket } = useSocket();
  const { username } = useAuth();

  const [videoStream, setVideoStream] = useState<MediaStream | undefined>(
    undefined
  );
  const [audioStream, setAudioStream] = useState<MediaStream | undefined>(
    undefined
  );
  const [callState, setCallState] = useState<CallState>({
    current_state: CallStates.CALL_ENDED,
    otherUser: "",
    signalData: null,
  });

  const ownVideoRef = useRef<HTMLVideoElement>(null);
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const connectionRef = useRef<Peer.Instance | null>(null);
  const [isCallEndedModalOpen, setIsCallEndedModalOpen] = useState(false);
  const [isVideoAllowed, setIsVideoAllowed] = useState(false);
  const [isAudioAllowed, setIsAudioAllowed] = useState(false);

  useEffect(() => {
    if (!socket) return;
    // For receiving calls
    socket.on(
      ClientSocketEvents.INITIATE_CALL,
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
      ClientSocketEvents.ACCEPT_CALL,
      ({ from, signalData }: { from: string; signalData: Peer.SignalData }) => {
        setCallState({
          current_state: CallStates.CALL_ACCEPTED,
          otherUser: from,
          signalData: signalData,
        });

        connectionRef.current?.signal(signalData);
      }
    );

    socket.on(ClientSocketEvents.END_CALL, () => {
      setCallState({
        current_state: CallStates.CALL_ENDED,
        otherUser: "",
        signalData: null,
      });

      connectionRef.current?.destroy();
      setIsCallEndedModalOpen(true);
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

  useEffect(() => {
    if (videoStream) {
      videoStream.getAudioTracks().forEach((track) => {
        track.enabled = isAudioAllowed;
      });
      videoStream.getVideoTracks().forEach((track) => {
        track.enabled = isVideoAllowed;
      });
    }
  }, [isAudioAllowed, isVideoAllowed, videoStream]);

  const setVideo = (on: boolean) => {
    setIsVideoAllowed(on);
  };

  const setAudio = (on: boolean) => {
    setIsAudioAllowed(on);
  };

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
      socket.emit(ClientSocketEvents.INITIATE_CALL, {
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
      socket.emit(ClientSocketEvents.ACCEPT_CALL, {
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

    socket.emit(ClientSocketEvents.END_CALL, {
      roomId: roomId,
      from: username,
    });

    setCallState({
      current_state: CallStates.CALL_ENDED,
      otherUser: "",
      signalData: null,
    });

    connectionRef.current?.destroy();
  };

  const CallEndedModal = () => {
    return (
      <Modal isOpen={isCallEndedModalOpen} isCloseable={false} width="md">
        <div>
          <h1>Call ended by other user</h1>
          <div>
            <Button
              type="button"
              onClick={() => setIsCallEndedModalOpen(false)}
              text="Ok"
            />
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <CallContext.Provider
      value={{
        callState,
        callPermissions: { videoOn: isVideoAllowed, audioOn: isAudioAllowed },
        ownVideoRef,
        userVideoRef,
        call,
        acceptCall,
        endCall,
        setVideo,
        setAudio,
      }}
    >
      {children}
      <CallEndedModal />
    </CallContext.Provider>
  );
};
