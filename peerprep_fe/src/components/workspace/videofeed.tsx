import { useCall } from "@/contexts/call-context";
import Modal from "../common/modal";
import Button from "../common/button";
import { CallStates } from "peerprep-shared-types";

export interface VideoFeedProps {
  roomId: string;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({ roomId }) => {
  const {
    callState,
    callPermissions,
    ownVideoRef,
    userVideoRef,
    call,
    acceptCall,
    endCall,
    setVideo,
    setAudio,
  } = useCall();

  const AcceptCallModal = () => {
    return (
      <Modal
        isOpen={callState.current_state === "CALL_RECEIVED"}
        isCloseable={false}
        width="md"
      >
        <div>
          <h1>{callState.otherUser} is calling you</h1>
          <div>
            <Button type="button" onClick={() => acceptCall()} text="Accept" />
            <Button type="reset" onClick={() => endCall()} text="Reject" />
          </div>
        </div>
      </Modal>
    );
  };

  const ToggleVideoButton = () => {
    return (
      <Button
        type="button"
        onClick={() => {
          setVideo(!callPermissions.videoOn);
        }}
        text={callPermissions.videoOn ? "Video On" : "Video Off"}
      />
    );
  };

  const ToggleAudioButton = () => {
    return (
      <Button
        type="button"
        onClick={() => {
          setAudio(!callPermissions.audioOn);
        }}
        text={callPermissions.audioOn ? "Audio On" : "Audio Off"}
      />
    );
  };

  const CallButton = () => {
    return (
      <Button
        type="button"
        onClick={() => {
          if (callState.current_state == CallStates.CALL_ENDED) {
            call();
          } else {
            endCall();
          }
        }}
        text={
          callState.current_state == CallStates.CALL_ENDED ? "Call" : "End Call"
        }
      />
    );
  };

  return (
    <div className="h-full w-full flex-col">
      <div>
        <video playsInline autoPlay muted ref={ownVideoRef} />
        <video playsInline autoPlay ref={userVideoRef} />
      </div>
      <div>
        <ToggleVideoButton />
        <ToggleAudioButton />
        <CallButton />
      </div>
      <AcceptCallModal />
    </div>
  );
};
