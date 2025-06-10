import {useEffect, useState} from "react";
import {server} from "./App";
import {ZendeskTicket} from "./Ticket";

const TicketWidget = (props: { ticket: any }) => {
    let lastUpdatedDateTime = new Date(props.ticket.updated_at);
    return <li className={"ticket status-" + props.ticket.status}>
        <h2>#{props.ticket.id}</h2>
        <span
            className={'ticket-update-dt'}>{lastUpdatedDateTime.toLocaleDateString()} - {lastUpdatedDateTime.toLocaleTimeString()}</span>
    </li>;
};

export const ZendeskTickets = () => {
    const [tickets, setTickets] = useState<Array<ZendeskTicket> | null>(null);

    const fetchTickets = () => {
        fetch(server + '/api/info-screen/zendesk/tickets', {
            headers: {
                'X-API-KEY': 'min-api-key',
            }
        }).then(async (res) => {
            const tickets = await res.json();
            console.log('Fetched tickets:', tickets);
            setTickets(tickets);
        });
    };

    useEffect(() => {
        fetchTickets();
        let interval = setInterval(fetchTickets, 20 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (tickets === null) {
        return <div>Henter Zendesk-saker ...</div>;
    }
    // Make separate lists for each status
    const openTickets = tickets.filter(ticket => ticket.status === 'open');
    const pendingTickets = tickets.filter(ticket => ticket.status === 'pending');
    const solvedTodayTickets = tickets.filter(ticket => {
        const updatedAt = new Date(ticket.updated_at);
        const today = new Date();
        return ticket.status === 'solved' && updatedAt.toDateString() === today.toDateString();
    });

    return (
        <table className="zendesk-ticket-table">
            <caption>Zendesk-saker:</caption>
            <thead>
            <tr>
                <th>Åpne</th>
                <th>Venter</th>
                <th>Nylig løst</th>
            </tr>
            </thead>
            <tbody>
            <tr>
                <td>
                    {openTickets.length === 0 ? <div>🎉</div> :
                        <ul>
                            {openTickets.map((ticket) => (
                                <TicketWidget key={ticket.id} ticket={ticket}/>
                            ))}
                        </ul>
                    }
                </td>
                <td>
                    {pendingTickets.length === 0 ? <div></div> :
                        <ul>
                            {pendingTickets.map((ticket) => (
                                <TicketWidget key={ticket.id} ticket={ticket}/>
                            ))}
                        </ul>
                    }
                </td>
                <td>
                    {solvedTodayTickets.length === 0 ? <div></div> :
                        <ul>
                            {solvedTodayTickets.map((ticket) => (
                                <TicketWidget key={ticket.id} ticket={ticket}/>
                            ))}
                        </ul>
                    }
                </td>
            </tr>
            </tbody>
        </table>
    )


}
