import React, { useState } from "react";

const HelpButton: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <>
            /* Help Button */
            <button
                onClick={openModal}
                className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
                ?
            </button>

            /* Help Modal */
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-4/5 max-w-2xl">
                        <header className="flex justify-between items-center p-4 border-b">
                            <h2 className="text-xl font-semibold">Help & Support</h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✖
                            </button>
                        </header>
                        <div className="p-4 overflow-y-auto max-h-96">
                            <h3 className="text-lg font-semibold mb-2">Topics</h3>
                            <ul className="list-disc pl-5">
                                <li><strong>Introduction:</strong> Overview of the software.</li>
                                <li><strong>Navigation:</strong> How to move between pages.</li>
                                <li><strong>Features:</strong> Description of key features.</li>
                                <li><strong>FAQs:</strong> Common user queries.</li>
                                <li><strong>Contact Support:</strong> Steps to get additional help.</li>
                            </ul>
                        </div>
                        <footer className="p-4 border-t">
                            <button
                                onClick={closeModal}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Close
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </>
    );
};

export default HelpButton;
