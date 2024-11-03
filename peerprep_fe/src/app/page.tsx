"use client";

import Image from "next/image";
import { useState } from "react";

import Header from "../components/common/header";
import Button from "../components/common/button";
import Modal from "../components/common/modal";

import { LoginForm } from "../components/auth/login-form";
import { SignupForm } from "../components/auth/signup-form";

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const openSignUpModal = () => {
    setIsSignUpModalOpen(true);
  };

  const closeSignUpModal = () => {
    setIsSignUpModalOpen(false);
  };

  const LoginModal = () => {
    return (
      <Modal isOpen={isLoginModalOpen} title="Login" onClose={closeLoginModal}>
        <LoginForm />
      </Modal>
    );
  };

  const SignUpModal = () => {
    return (
      <Modal
        isOpen={isSignUpModalOpen}
        title="Sign Up"
        onClose={closeSignUpModal}
      >
        <SignupForm />
      </Modal>
    );
  };

  return (
    <div className="h-screen flex flex-col max-w-6xl mx-auto py-10 ">
      <Header>
        <Button text="Login" onClick={openLoginModal} />
      </Header>

      <main className="relative mx-5 flex space-x-20 items-center flex-1">
        <div className="w-1/2 pl-10">
          <h1 className="text-6xl font-hairline leading-snug font-albert">
            Real Time Collaboration
          </h1>
          <p className="text-2xl font-hairline font-albert">easier than ever</p>
          <div className="mt-10 w-3/4">
            <Button text="Sign Up" onClick={openSignUpModal} />
          </div>
        </div>

        <Image
          className="w-1/2"
          src="/icons/landing_icon.png"
          alt="Landing page icon"
          width={384}
          height={384}
          priority
        />
      </main>

      <LoginModal />
      <SignUpModal />
    </div>
  );
}
