import { useState } from "react";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import "./FollowUpCalendar.css"; // (Optional: for custom styles)

export default function FollowUpCalendar() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
        console.log("Selected follow-up date:", date.toLocaleString());
    };

    return (
        <div className="bg-white p-6 rounded shadow max-w-md mx-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Follow-Up Calendar</h2>

            <Calendar
                // onChange={handleDateChange}
                value={selectedDate}
                className="rounded border-none"
                tileClassName={({ date }) =>
                    date.toDateString() === new Date().toDateString()
                        ? "bg-yellow-100 font-bold"
                        : ""
                }
            />

            <div className="mt-4 text-sm text-gray-700">
                <strong>Selected Date:</strong> {selectedDate.toLocaleDateString()}
            </div>
        </div>
    );
}
