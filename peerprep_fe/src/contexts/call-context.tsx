"use client";

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
  useEffect,
  useCallback,
} from "react";
import { useSocket } from "./socket-context";
import { useAuth } from "./auth-context";
import Peer from "simple-peer";
import {
  ClientSocketEvents,
  CallStates,
  ServerSocketEvents,
} from "peerprep-shared-types";
import Modal from "../components/common/modal";
import Button from "../components/common/button";
import { useOnPageLeave } from "../components/hooks/onPageLeave";
import {
  CallAcceptedResponse,
  CallRequestedResponse,
} from "peerprep-shared-types/dist/types/sockets/comms";
import { useWorkspaceRoom } from "./workspaceroom-context";

interface CallContextType {
  callState: CallState;
  callPermissions: CallPermissions;
  ownVideoRef: React.RefObject<HTMLVideoElement>;
  userVideoRef: React.RefObject<HTMLVideoElement>;
  call: () => void;
  acceptCall: () => void;
  endCall: () => void;
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
  const { roomId } = useWorkspaceRoom();

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
  const [isMicPermissionGranted, setIsMicPermissionGranted] = useState(true);
  const [isCameraPermissionGranted, setIsCameraPermissionGranted] =
    useState(true);

  const setVideo = (on: boolean) => {
    setIsVideoAllowed(on);
  };

  const setAudio = (on: boolean) => {
    setIsAudioAllowed(on);
  };

  const call = () => {
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

  const acceptCall = () => {
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
        username: username,
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

  const endCall = () => {
    if (!socket) return;

    socket.emit(ClientSocketEvents.END_CALL, {
      roomId: roomId,
      username: username,
    });

    setCallState({
      current_state: CallStates.CALL_ENDED,
      otherUser: "",
      signalData: null,
    });

    peer?.destroy();
    setPeer(null);
  };

  const handleCallRequested = (response: CallRequestedResponse) => {
    const { from, signalData } = response;
    console.log("Received call from:", from);
    setCallState({
      current_state: CallStates.CALL_RECEIVED,
      otherUser: from,
      signalData,
    });
  };

  const handleCallAccepted = (response: CallAcceptedResponse) => {
    const { from, signalData } = response;
    console.log("Call accepted by:", from);
    setCallState({
      current_state: CallStates.CALL_ACCEPTED,
      otherUser: from,
      signalData: signalData,
    });

    if (peer) {
      peer.signal(signalData);
    }
  };

  const handleCallEnded = () => {
    console.log("Call ended by other user");
    setCallState({
      current_state: CallStates.CALL_ENDED,
      otherUser: "",
      signalData: null,
    });

    peer?.destroy();
    setPeer(null);
    setIsCallEndedModalOpen(true);
  };

  const stopStream = useCallback(() => {
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
  }, [videoStream, peer]);

  const getUserMedia = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    let stream: MediaStream | null = null;
    try {
      if (devices.some((device) => device.kind === "audioinput")) {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        setIsMicPermissionGranted(true);
      } else {
        console.error("No audio input device found");
      }
    } catch (error) {
      console.error("Error getting user media:", error);
      setIsMicPermissionGranted(false);
    }

    try {
      if (devices.some((device) => device.kind === "videoinput")) {
        const vidStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (stream) {
          stream.addTrack(vidStream.getVideoTracks()[0]);
        } else {
          stream = vidStream;
        }
        setIsCameraPermissionGranted(true);
      } else {
        console.error("No video input device found");
      }
      setVideoStream(stream);
    } catch (error) {
      console.error("Error getting user media:", error);
      setIsCameraPermissionGranted(false);
    }
  };

  const handleClosePermissionsModal = () => {
    setIsMicPermissionGranted(true);
    setIsCameraPermissionGranted(true);
    getUserMedia();
  };

  useOnPageLeave(stopStream);

  useEffect(() => {
    if (!socket) return;
    // For receiving calls
    socket.on(ServerSocketEvents.CALL_REQUESTED, handleCallRequested);

    // For receiving call acceptance
    socket.on(ServerSocketEvents.CALL_ACCEPTED, handleCallAccepted);

    socket.on(ServerSocketEvents.CALL_ENDED, handleCallEnded);

    return () => {
      socket.off(ServerSocketEvents.CALL_REQUESTED);
      socket.off(ServerSocketEvents.CALL_ACCEPTED);
      socket.off(ServerSocketEvents.CALL_ENDED);
    };
  }, [socket, peer]);

  useEffect(() => {
    getUserMedia();

    return () => {
      stopStream();
    };
  }, []);

  useEffect(() => {
    if (ownVideoRef.current && ownVideoRef.current.isConnected && videoStream) {
      ownVideoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

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

  const PermissionsNotAllowedModal = () => {
    return (
      <Modal
        title="Please grant the following permissions"
        isOpen={!isMicPermissionGranted || !isCameraPermissionGranted}
        isCloseable={false}
      >
        <div>
          <h1>
            {!isMicPermissionGranted && "- Microphone"}
            <br />
            {!isCameraPermissionGranted && "- Camera"}
          </h1>
          <div>
            <Button
              type="button"
              onClick={handleClosePermissionsModal}
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
        stopStream,
      }}
    >
      {children}
      <CallEndedModal />
      <PermissionsNotAllowedModal />
    </CallContext.Provider>
  );
};
