import { useCall } from "@/contexts/call-context";
import Modal from "../common/modal";
import Button from "../common/button";

export interface VideoFeedProps {
  roomId: string;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({ roomId }) => {
  const { callState, ownVideoRef, userVideoRef, call, acceptCall, endCall } =
    useCall();

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
            <Button
              type="button"
              onClick={() => acceptCall(roomId)}
              text="Accept"
            />
            <Button
              type="reset"
              onClick={() => endCall(roomId)}
              text="Reject"
            />
          </div>
        </div>
      </Modal>
    );
  };

  return (
    <div className="h-full w-full flex-col">
      <div>
        <video playsInline autoPlay muted ref={ownVideoRef} />
        <video playsInline autoPlay ref={userVideoRef} />
      </div>
      <div>
        {callState.current_state === "CALL_ENDED" ? (
          <Button type="button" text="Call" onClick={() => call(roomId)} />
        ) : (
          <Button
            type="reset"
            onClick={() => endCall(roomId)}
            text="End Call"
          />
        )}
      </div>
      <AcceptCallModal />
    </div>
  );
};
