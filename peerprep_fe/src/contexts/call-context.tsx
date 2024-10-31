"use client";

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
  const [peer, setPeer] = useState<Peer.Instance | null>(null);

  const [callState, setCallState] = useState<CallState>({
    current_state: CallStates.CALL_ENDED,
    otherUser: "",
    signalData: null,
  });

  const ownVideoRef = useRef<HTMLVideoElement>(null);
  const userVideoRef = useRef<HTMLVideoElement>(null);
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

        if (peer) {
          peer.signal(signalData);
        }
      }
    );

    socket.on(ClientSocketEvents.END_CALL, () => {
      setCallState({
        current_state: CallStates.CALL_ENDED,
        otherUser: "",
        signalData: null,
      });

      peer?.destroy();
      setPeer(null);
      setIsCallEndedModalOpen(true);
    });

    return () => {
      socket.off(ClientSocketEvents.INITIATE_CALL);
      socket.off(ClientSocketEvents.ACCEPT_CALL);
      socket.off(ClientSocketEvents.END_CALL);
    };
  }, [socket, peer]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setVideoStream(stream);
        if (ownVideoRef.current) {
          ownVideoRef.current.srcObject = stream;
        }
      });
  }, []);

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

    peer.on("connect", () => {
      console.log("Peer connection established");
    });

    peer.on("error", (err) => {
      console.error("Peer connection error:", err);
    });

    peer.on("signal", (signalData) => {
      console.log("sending signal data", signalData);
      socket.emit(ClientSocketEvents.INITIATE_CALL, {
        from: username,
        roomId: roomId,
        signalData: signalData,
      });
    });

    peer.on("stream", (stream) => {
      console.log("received stream");
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
      }
    });

    setPeer(peer);
  };

  const acceptCall = (roomId: string) => {
    if (!socket || !callState.signalData) return;

    console.log("Accepting call...");

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

    peer.on("connect", () => {
      console.log("Peer connection established");
    });

    peer.on("error", (err) => {
      console.error("Peer connection error:", err);
    });

    peer.on("signal", (signalData) => {
      console.log("sending signal data", signalData);
      socket.emit(ClientSocketEvents.ACCEPT_CALL, {
        roomId: roomId,
        from: username,
        signalData,
      });
    });

    peer.on("stream", (stream) => {
      console.log("received stream");
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
      }
    });

    peer.signal(callState.signalData);
    setPeer(peer);
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

    peer?.destroy();
    setPeer(null);
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
