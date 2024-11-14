"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../../styles/modal.css";

import { useAuth } from "../../contexts/auth-context";

import Header from "../../components/common/header";
import Button from "../../components/common/button";
import Modal from "../../components/common/modal";
import HistoryTable from "../../components/history/history-table";
import { getHistory } from "../actions/editor";

export default function History() {
  const router = useRouter();
  const { token, username, isAdmin } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedSolution, setSelectedSolution] = useState(""); // State to store the solution to be shown

  useEffect(() => {
    async function fetchHistory() {
      if (username) {
        const userHistory = await getHistory(username, token);
        if (userHistory.error) {
          console.error("Failed to fetch history:", userHistory.error);
        } else {
          setHistory(userHistory.history); // Update the history state with the fetched data
        }
      }
    }
    fetchHistory();
  }, [username, token]); // Include 'token' in the dependency array to refetch if it changes

  const openViewAttemptModal = (attemptData: string) => {
    setSelectedSolution(attemptData); // Set the solution to display
    setIsAddModalOpen(true); // Open the modal
  };

  const ViewAttemptModal = () => {
    if (!isAddModalOpen) return null;
    return (
      <Modal
        isOpen={isAddModalOpen}
        title="Saved Attempt"
        width="4xl"
        height="3xl"
        isScrollable={true}
        onClose={() => setIsAddModalOpen(false)} // Close the modal
      >
        <div className="bg-gray-100 p-4 rounded-md shadow-md">
          <p className="text-gray-800 whitespace-pre-wrap">
            {selectedSolution}
          </p>
        </div>
      </Modal>
    );
  };

  return (
    <div className="h-screen w-screen flex flex-col max-w-6xl mx-auto py-10 overscroll-contain">
      <Header>
        <div className="w-full h-full flex items-center justify-center">
          Hi {username}
        </div>
        {isAdmin && (
          <Button
            text="Questions"
            onClick={() => {
              router.push("/questions");
            }}
          />
        )}
        <Button text="Profile" onClick={() => router.push("/profile")} />
      </Header>
      <h1 className="text-4xl font-semibold text-center text-gray-800 my-6">
        History
      </h1>
      <HistoryTable
        history={history}
        openViewAttemptModal={openViewAttemptModal}
      />
      <ViewAttemptModal />
    </div>
  );
}
