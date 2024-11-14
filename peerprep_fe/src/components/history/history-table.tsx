import React from "react";
import Button from "../../components/common/button";

export default function HistoryTable({ history, openViewAttemptModal }) {
    return (
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
              history
                .slice()
                .reverse()
                .map((attempt, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-200 hover:bg-gray-100"
                  >
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      {attempt.question}
                    </td>
                    <td className="py-3 px-6 text-left whitespace-nowrap">
                      {new Date(attempt.attemptDateTime).toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      })}
                    </td>
                    <td className="py-3 px-6 text-left whitespace-nowrap cursor-pointer text-blue-500">
                      <Button
                        type="submit"
                        onClick={() => openViewAttemptModal(attempt.attemptData)}
                        text="View Attempt"
                      />
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
    );
  }