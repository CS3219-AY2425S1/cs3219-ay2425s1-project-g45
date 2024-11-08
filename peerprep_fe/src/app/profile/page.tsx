"use client";

import { useState } from "react";
import Header from "../../components/common/header";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/auth-context";
import Button from "../../components/common/button";
import Modal from "../../components/common/modal";
import { deleteUser, resetPasswordWithPassword } from "../actions/auth";
import Textfield from "../../components/common/text-field";

const Profile: React.FC = () => {
  const router = useRouter();
  const { username, logout, token } = useAuth();
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const [oldpassword, setOldpassword] = useState("");
  const [newpassword, setNewpassword] = useState("");

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

  const handleChangePassword = async () => {
    setIsPasswordChanging(true);
    const response = await resetPasswordWithPassword(
      username,
      oldpassword,
      newpassword
    );
    setIsPasswordChanging(false);
    if (response.message) {
      alert(response.message);
    } else {
      alert(response.errors.errorMessage);
    }
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
      <div className="h-screen w-9/12 flex flex-col max-w-6xl mx-auto py-10 overscroll-contain">
        <h1 className="text-3xl font-hairline leading-snug font-albert">
          {username}'s Profile
        </h1>
        <div className="py-5">
          <h3 className="text-xl font-hairline leading-snug font-albert">
            Change Password:
          </h3>
          <form>
            <Textfield
              name="oldpassword"
              required
              minLength={8}
              maxLength={20}
              placeholder_text="Old Password"
              onChange={(e) => setOldpassword(e.target.value)}
            />
            <Textfield
              name="newpassword"
              required
              minLength={8}
              maxLength={20}
              placeholder_text="New Password"
              onChange={(e) => setNewpassword(e.target.value)}
            />
            <Button
              text="Change Password"
              type="submit"
              onClick={handleChangePassword}
              loading={isPasswordChanging}
            />
          </form>
        </div>
        <Button
          text="Logout"
          onClick={() => {
            logout();
            router.push("/");
          }}
        />
        <Button
          text="Delete Account"
          type="reset"
          onClick={toggleWarningModal}
        />
      </div>
      <WarningModal />
      <DeleteModal />
    </div>
  );
};
export default Profile;
