"use client";

import { useState } from "react";
import Header from "../../components/common/header";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/auth-context";
import Button from "../../components/common/button";
import Modal from "../../components/common/modal";
import { deleteUser } from "../actions/auth";

const Profile: React.FC = () => {
  const router = useRouter();
  const { username, logout, token } = useAuth();
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const toggleWarningModal = () => {
    setIsWarningModalOpen((prev) => !prev);
  };

  const toggleDeleteModal = () => {
    setIsDeleteModalOpen((prev) => !prev);
  };

  const onDelete = async () => {
    const response = await deleteUser(username, token);
    if (response.message) {
      toggleWarningModal();
      toggleDeleteModal();
    } else {
      alert(response.errors.errorMessage);
    }
  };

  const WarningModal = () => {
    return (
      <Modal
        isOpen={isWarningModalOpen}
        title="Are you sure?"
        onClose={toggleWarningModal}
      >
        <div>
          <h3 className="text-xl font-hairline">
            Deleting your account is irreversible
          </h3>
          <div className="flex-col">
            <Button text="Yes" type="reset" onClick={onDelete} />
            <Button text="No" type="button" onClick={toggleWarningModal} />
          </div>
        </div>
      </Modal>
    );
  };

  const DeleteModal = () => {
    return (
      <Modal isOpen={isDeleteModalOpen} title="Account deleted">
        <Button text="Return to login" onClick={logout} />
      </Modal>
    );
  };

  return (
    <div className="h-screen w-screen flex flex-col max-w-6xl mx-auto py-10 overscroll-contain">
      <Header>
        <Button
          text="History"
          onClick={() => {
            router.push("/history");
          }}
        />
        <Button
          text="Match"
          onClick={() => {
            router.push("/match");
          }}
        />
      </Header>
      <h1>{username}</h1>
      <Button
        text="Logout"
        onClick={() => {
          logout();
          router.push("/");
        }}
      />
      <Button text="Delete Account" type="reset" onClick={toggleWarningModal} />
      <WarningModal />
      <DeleteModal />
    </div>
  );
};
export default Profile;
