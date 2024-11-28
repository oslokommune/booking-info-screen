import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import './App.css';

const server =
    process.env.NODE_ENV === 'development'
        ? 'http://localhost:9090'
        : 'https://api.booking.oslo.kommune.no';

const useConfetti = (bookings : number) => {
    const [showConfetti, setShowConfetti] = useState(false);
    useEffect(() => {
        if (bookings > 0) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 7000); // Show confetti for 3 seconds
        }
    }, [bookings]);
    return { showConfetti };
}

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
    const {showConfetti} = useConfetti(dailyBookings);

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
