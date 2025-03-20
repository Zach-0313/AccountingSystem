import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const PopUpCalendar: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    return (
        <div className="fixed top-4 left-4 bg-white p-4 shadow-lg rounded-lg border z-50">
            <h3 className="text-lg font-semibold mb-2">Select a Date</h3>
            <DatePicker
                selected={selectedDate}
                onChange={(date: Date) => setSelectedDate(date)}
                inline
            />
            {selectedDate && (
                <p className="mt-2 text-sm text-gray-700">
                    Selected Date: {selectedDate.toDateString()}
                </p>
            )}
        </div>
    );
};

export default PopUpCalendar;
