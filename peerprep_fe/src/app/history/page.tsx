"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "../../styles/modal.css";

import { useAuth } from "../../contexts/auth-context";

import Header from "../../components/common/header";
import Button from "../../components/common/button";
import Modal from "../../components/common/modal";
import { getHistory } from "../actions/auth";

export default function History() {
    const router = useRouter();
    const { token, deleteToken, username } = useAuth();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [history, setHistory] = useState([]);
    const [selectedSolution, setSelectedSolution] = useState(""); // State to store the solution to be shown

    useEffect(() => {
        async function fetchHistory() {
            if (username) {
                const userHistory = await getHistory(username, token);
                if (userHistory.error) {
                    console.error("Failed to fetch history:", userHistory.error);
                } 
            }
        }
        fetchHistory();
    }, [username]);
    

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
                {/* Display the saved solution */}
                <div>{selectedSolution}</div>
            </Modal>
        );
    };

    return (
        <div className="h-screen w-screen flex flex-col max-w-6xl mx-auto py-10 overscroll-contain">
            <Header>
                <div className="w-full h-full flex items-center justify-center">
                    Hi {username}
                </div>
                <Button
                    text="Match"
                    onClick={() => {
                        router.push("/match");
                    }}
                />
                <Button
                    text="Logout"
                    onClick={() => {
                        deleteToken();
                        router.push("/");
                    }}
                />
            </Header>
            <h1 className="text-4xl font-semibold text-center text-gray-800 my-6">
                History
            </h1>
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto bg-white shadow-md scroll-smooth">
                    <thead className="sticky top-0">
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Question</th>
                            <th className="py-3 px-6 text-left">Date Attempted</th>
                            <th className="py-3 px-6 text-left">Saved Solution</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm font-light overflow-y-scroll">
                        {history?.length > 0 ? (
                            history.map((attempt, index) => (
                                <tr
                                    key={index}
                                    className="border-b border-gray-200 hover:bg-gray-100"
                                >
                                    <td className="py-3 px-6 text-left whitespace-nowrap">
                                        {attempt.question}
                                    </td>
                                    <td className="py-3 px-6 text-left whitespace-nowrap">
                                        {attempt.attemptDateTime}
                                    </td>
                                    <td
                                        className="py-3 px-6 text-left whitespace-nowrap cursor-pointer text-blue-500 hover:underline"
                                        onClick={() => openViewAttemptModal(attempt.attemptData)} // Pass the solution data to modal
                                    >
                                        View Attempt
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td className="py-3 px-6 text-center text-gray-500">
                                    No history available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* View Attempt Modal */}
            <ViewAttemptModal />
        </div>
    );
}
