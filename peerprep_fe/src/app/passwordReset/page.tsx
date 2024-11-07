"use client";

import { useEffect, useState } from "react";
import React from "react";
import { useSearchParams } from "next/navigation";
import Header from "../../components/common/header";
import Textfield from "../../components/common/text-field";
import Button from "../../components/common/button";
import Modal from "../../components/common/modal";
import { resetPasswordWithToken } from "../actions/auth";
import { useRouter } from "next/navigation";

const PasswordReset: React.FC = () => {
  const searchParams = useSearchParams();
  const username = searchParams.get("username");
  const token = searchParams.get("token");
  const router = useRouter();
  const [isResetSuccessModalOpen, setIsResetSuccessModalOpen] = useState(false);

  const toggleResetSuccessModal = () => {
    setIsResetSuccessModalOpen((prev) => !prev);
  };

  const redirectToLanding = () => {
    router.push("/");
  };

  const ResetSuccessModal = () => {
    return (
      <Modal
        isOpen={isResetSuccessModalOpen}
        title="Successfully reset password"
      >
        <h3 className="py-5 font-bold">
          You may now login with your new password
        </h3>
        <Button text="Back to home" onClick={redirectToLanding} />
      </Modal>
    );
  };

  const action = async (formData: FormData) => {
    const newPassword: string = formData.get("password") as string;

    const response = await resetPasswordWithToken(username, token, newPassword);
    console.log(response);
    if (response.message) {
      toggleResetSuccessModal();
    }
    if (response.errors) {
      alert(response.errors.errorMessage);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col max-w-6xl mx-auto py-10">
      <Header />
      <main className="relative mx-5 flex items-center flex-1">
        <div className="w-full pb-60">
          <h3 className="text-2xl font-bold">Reset Password</h3>
          <form action={action}>
            <Textfield
              name="password"
              secure={false}
              placeholder_text="New Password"
              required={true}
              minLength={2}
              maxLength={20}
            />
            <Button type="submit" text="Update Password" />
          </form>
        </div>
      </main>
      <ResetSuccessModal />
    </div>
  );
};

export default PasswordReset;
