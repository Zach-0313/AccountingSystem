import React, { useState } from "react";

const HelpButton: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Toggle modal open/close
    const toggleModal = () => setIsModalOpen(prev => !prev);

    return (
        <>
            {/* Help Button */}
            <button
                onClick={toggleModal}
                className="fixed bottom-4 right-4 bg-red-600 text-white text-lg font-bold px-6 py-3 rounded-full shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
                HELP
            </button>

            {/* Help Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-2xl w-4/5 max-w-2xl transform scale-100 transition-transform duration-300">
                        {/* Modal Header */}
                        <header className="p-4 border-b">
                            <h2 className="text-xl font-semibold">Help & Support</h2>
                        </header>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto max-h-96">
                            <h3 className="text-lg font-semibold mb-4">Topics</h3>
                            <ul className="list-disc pl-5">
                                <li><strong>Introduction:</strong> Overview of the software.</li>
                                <li><strong>Navigation:</strong> How to move between pages.</li>
                                <li><strong>Features:</strong> Description of key features.</li>
                                <li><strong>FAQs:</strong> Common user queries.</li>
                                <li><strong>Contact Support:</strong> Steps to get additional help.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default HelpButton;
