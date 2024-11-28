import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import './App.css';

const server =
    process.env.NODE_ENV === 'development'
        ? 'http://localhost:9090'
        : 'https://api.booking.oslo.kommune.no';

const useInfoScreen = () => {
    const [dailyBookings, setDailyBookings] = React.useState<{
        dailyBookings: number;
        yesterdayBookings: number;
    }>({
        dailyBookings: 0,
        yesterdayBookings: 0,
    });

    useEffect(() => {
        let interval = setInterval(() => {
            fetch(server + '/api/info-screen/bookings').then(async (res) => {
                setDailyBookings(await res.json());
            });
        }, 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetch(server + '/api/info-screen/bookings').then(async (res) => {
            setDailyBookings(await res.json());
        });
    }, []);

    return {
        dailyBookings,
    };
};

function App() {
    const {
        dailyBookings: { dailyBookings, yesterdayBookings },
    } = useInfoScreen();
    const [prevBookings, setPrevBookings] = useState<number>(0);
    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        if (prevBookings !== 0 && dailyBookings > prevBookings) {
            // Trigger confetti if bookings have increased
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000); // Show confetti for 3 seconds
        }
        setPrevBookings(dailyBookings); // Update previous bookings
    }, [dailyBookings, prevBookings]);

    return (
        <div className="App">
            {showConfetti && <Confetti />}
            <table>
                <tbody>
                <tr>
                    <td>Bookinger i dag:</td>
                    <td className="bookings">{dailyBookings}</td>
                </tr>
                <tr>
                    <td>Bookinger i går:</td>
                    <td className="bookings">{yesterdayBookings}</td>
                </tr>
                </tbody>
            </table>
        </div>
    );
}

export default App;
