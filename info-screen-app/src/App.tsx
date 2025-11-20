import React, {useEffect, useState} from 'react';
import Confetti from 'react-confetti';
import './App.css';
import {ZendeskTickets} from "./ZendeskTickets";

export const server =
    process.env.NODE_ENV === 'development'
        ? 'http://localhost:9090'
        : 'https://api.booking.oslo.kommune.no';

const useConfetti = (bookings: number) => {
    const [showConfetti, setShowConfetti] = useState(false);
    useEffect(() => {
        if (bookings > 0) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 7000); // Show confetti for 3 seconds
        }
    }, [bookings]);
    return {showConfetti};
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


const useReloadOnChangedAssets = () => {
    const assetTags: NodeListOf<HTMLScriptElement | HTMLLinkElement> = document.head.querySelectorAll('link[rel="stylesheet"], script[src]');
    const [reloadState, setReloadState] = useState<"RELOADING" | null>(null);
    useEffect(() => {
        window.setInterval(() => {
            assetTags.forEach((tag, index) => {
                // Do a HEAD request to check if the asset has changed
                fetch(tag instanceof HTMLLinkElement ? tag.href : tag.src, {
                    method: 'HEAD',
                    cache: 'no-cache',
                }).then(res => {
                    if (res.status === 404) {
                        // If the asset has changed, reload the page
                        console.log(`Asset changed: ${tag instanceof HTMLLinkElement ? tag.href : tag.src}`);
                        window.setTimeout(() => {
                            window.location.reload();
                        }, 10_000);
                        setReloadState("RELOADING");
                    }
                }).catch
                (err => {
                    console.error(`Error checking asset ${index}:`, err);
                });
            })
        }, 10 * 1000); // Check every 10 seconds
    }, [assetTags]);
    return {reloadState};

}

function App() {
    useReloadOnChangedAssets();
    const module = new URLSearchParams(window.location.search).get('module') || 'bookings';
    const {
        dailyBookings: {dailyBookings, yesterdayBookings},
    } = useInfoScreen();
    const {showConfetti} = useConfetti(dailyBookings);

    return (
        <div className="App">
            {showConfetti && <Confetti/>}
            {module === 'bookings' &&
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
            }
            {module === 'tickets' &&
                <ZendeskTickets/>
            }
        </div>
    );
}

export default App;
