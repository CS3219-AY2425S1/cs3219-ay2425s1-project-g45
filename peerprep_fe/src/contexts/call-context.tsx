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

  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
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
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  const setVideo = (on: boolean) => {
    if (callState.current_state === CallStates.CALL_ENDED) return;
    setIsVideoAllowed(on);
  };

  const setAudio = (on: boolean) => {
    if (callState.current_state === CallStates.CALL_ENDED) return;
    setIsAudioAllowed(on);
  };

  const getMedia = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();

    if (!devices.some((device) => device.kind === "audioinput")) {
      throw new Error("No audio input device found");
    }

    const hasCamera = devices.some(
      (device) =>
        device.kind === "videoinput" &&
        // Handle edge case where user does not have a camera but a virtual camera is present
        // Need to add all the possible virtual camera names
        !device.label.includes("virtual") &&
        !device.label.includes("NVIDIA")
    );
    const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: hasCamera,
    });

    return stream;
  };

  const removeUserMedia = () => {
    if (videoStream) {
      videoStream.getTracks().forEach((track) => {
        track.stop();
        videoStream.removeTrack(track);
      });
      setVideoStream(null);
    }
    if (ownVideoRef.current) {
      ownVideoRef.current.srcObject = null;
    }
    if (userVideoRef.current) {
      userVideoRef.current.srcObject = null;
    }
  };

  const call = () => {
    if (callState.current_state !== CallStates.CALL_ENDED || !socket) return;

    getMedia()
      .then((stream: MediaStream) => {
        console.log("Initiating call...");
        setVideoStream(stream);

        setCallState({
          current_state: CallStates.CALL_INITIATED,
          otherUser: "",
          signalData: null,
        });

        const peer = new Peer({
          initiator: true,
          trickle: false,
          stream: stream,
          config: {
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
            iceTransportPolicy: "all",
          },
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

        peer.on("stream", (peerStream) => {
          console.log("received stream");
          if (userVideoRef.current) {
            userVideoRef.current.srcObject = peerStream;
          }
        });

        setPeer(peer);
      })
      .catch((error) => {
        console.error("Error getting user media:", error);
        setIsPermissionModalOpen(true);
      });
  };

  const acceptCall = () => {
    if (!socket || !callState.signalData) return;

    getMedia()
      .then((stream: MediaStream) => {
        console.log("Accepting call...");
        setVideoStream(stream);

        setCallState({
          current_state: CallStates.CALL_ACCEPTED,
          otherUser: callState.otherUser,
          signalData: callState.signalData,
        });

        const peer = new Peer({
          initiator: false,
          trickle: false,
          stream: stream,
          config: {
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
            iceTransportPolicy: "all",
          },
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

        peer.on("stream", (peerStream) => {
          console.log("received stream");
          if (userVideoRef.current) {
            userVideoRef.current.srcObject = peerStream;
          }
        });

        peer.signal(callState.signalData);
        setPeer(peer);
      })
      .catch((error) => {
        console.error("Error getting user media:", error);
        setIsPermissionModalOpen(true);
      });
  };

  const endCall = () => {
    if (!socket || callState.current_state == CallStates.CALL_ENDED) return;
    console.log("Ending call...");
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
    removeUserMedia();
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
    endCall();
    setIsCallEndedModalOpen(true);
  };

  const stopStream = () => {
    console.log("Cleaning up call resources");
    endCall();
    peer?.destroy();
    setPeer(null);
  };

  const handleClosePermissionsModal = () => {
    setIsPermissionModalOpen(false);
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

  // Update video stream when available
  useEffect(() => {
    if (ownVideoRef.current && ownVideoRef.current.isConnected) {
      ownVideoRef.current.srcObject = videoStream;
    }
  }, [ownVideoRef, videoStream]);

  // Toggle mic
  useEffect(() => {
    if (!videoStream) return;
    console.log("Toggling mic", isAudioAllowed);
    videoStream.getTracks().forEach((track) => {
      if (track.kind === "audio") {
        console.log("Setting audio track enabled:", isAudioAllowed);
        track.enabled = isAudioAllowed;
      }
    });
  }, [isAudioAllowed, videoStream]);

  // Toggle camera
  useEffect(() => {
    if (!videoStream) return;
    console.log("Toggling camera", isVideoAllowed);
    videoStream.getTracks().forEach((track) => {
      if (track.kind === "video") {
        console.log("Setting video track enabled:", isVideoAllowed);
        track.enabled = isVideoAllowed;
      }
    });
  }, [isVideoAllowed, videoStream]);

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
        title="Please grant the following permissions to use the call feature"
        isOpen={isPermissionModalOpen}
        isCloseable={false}
      >
        <div>
          <h1>
            - Microphone
            <br />- Camera
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
