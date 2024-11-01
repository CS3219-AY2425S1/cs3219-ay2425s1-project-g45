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
import {
  ClientSocketEvents,
  CallStates,
  ServerSocketEvents,
} from "peerprep-shared-types";
import Modal from "@/components/common/modal";
import Button from "@/components/common/button";
import { useOnPageLeave } from "@/components/hooks/onPageLeave";
import { Server } from "http";

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
  stopStream: () => void;
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
      ServerSocketEvents.CALL_REQUESTED,
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
      ServerSocketEvents.CALL_ACCEPTED,
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

    socket.on(ServerSocketEvents.CALL_ENDED, () => {
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
      socket.off(ServerSocketEvents.CALL_REQUESTED);
      socket.off(ServerSocketEvents.CALL_ACCEPTED);
      socket.off(ServerSocketEvents.CALL_ENDED);
    };
  }, [socket, peer]);

  useEffect(() => {
    const getUserMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setVideoStream(stream);
        if (ownVideoRef.current) {
          ownVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error getting user media:", error);
      }
    };

    getUserMedia();

    return () => {
      stopStream();
    };
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
        event: ClientSocketEvents.INITIATE_CALL,
        roomId: roomId,
        username: username,
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

  const stopStream = () => {
    if (videoStream) {
      console.log("stopping stream");
      console.log(videoStream.getTracks());
      const tracks = videoStream.getTracks();
      tracks.forEach((track) => {
        track.stop();
        videoStream.removeTrack(track);
      });
      console.log(videoStream.getTracks());
      setVideoStream(undefined);
    }
    peer?.destroy();
    setPeer(null);
  };

  useOnPageLeave(stopStream);

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
        stopStream,
      }}
    >
      {children}
      <CallEndedModal />
    </CallContext.Provider>
  );
};
