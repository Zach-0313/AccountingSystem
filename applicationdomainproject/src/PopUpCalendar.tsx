import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const PopUpCalendar: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isOpen, setIsOpen] = useState(false); // Track if the calendar is open

    const toggleCalendar = () => {
        setIsOpen(!isOpen); // Toggle open/close
    };

    return (
        <div className="fixed top-4 right-4 bg-white p-4 shadow-lg rounded-lg border z-50">
            <div className="flex items-center justify-between">
                <button
                    onClick={toggleCalendar}
                    className="flex items-center text-blue-600 font-semibold"
                >
                    <span>Calendar</span>
                    <span
                        className={`ml-2 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    >
                        {isOpen ? "▲" : "▼"} {/* Upward arrow when open, downward arrow when closed */}
                    </span>
                </button>
            </div>

            <div
                style={{
                    maxHeight: isOpen ? "400px" : "0", // Expand or collapse
                    overflow: "hidden", // Prevent content from spilling out
                    transition: "max-height 0.3s ease-out", // Smooth transition
                }}
            >
                <div className="mt-4">
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date: Date) => setSelectedDate(date)}
                        inline
                    />
                </div>
                {selectedDate && (
                    <p className="mt-2 text-sm text-gray-700">
                        Selected Date: {selectedDate.toDateString()}
                    </p>
                )}
            </div>
        </div>
    );
};

export default PopUpCalendar;
