import {useEffect, useState} from "react";
import {server} from "./App";
import {ZendeskTicket} from "./Ticket";

const TicketWidget = (props: { ticket: ZendeskTicket }) => {
    let lastUpdatedDateTime = new Date(props.ticket.updated_at);
    const status = ['new', 'open'].includes(props.ticket.status) ? 'open' : props.ticket.status;

    return <li className={"ticket status-" + status}>
        <h2>#{props.ticket.id}</h2>
        <span
            className={'ticket-update-dt'}>{lastUpdatedDateTime.toLocaleDateString()} - {lastUpdatedDateTime.toLocaleTimeString()}</span>
    </li>;
};

type ListWithOverflow<T> = Array<T> & {
    overflow: number | boolean;
}

const useListWithOverflow = <T, >(list: Array<T>, maxItems: number): ListWithOverflow<T> => {
    const [overflow, setOverflow] = useState<number | boolean>(false);

    useEffect(() => {
        if (list.length > maxItems) {
            setOverflow(maxItems < 0 || list.length - maxItems);
        } else {
            setOverflow(false);
        }
    }, [list, maxItems]);

    let result = list.slice(0, maxItems);
    (result as ListWithOverflow<T>).overflow = overflow;
    return result as ListWithOverflow<T>;
}

const TicketsColumn = (props: { ticketsList: ListWithOverflow<ZendeskTicket>, emptyContent?: JSX.Element }) => <>
    {props.ticketsList.length === 0 ? (props.emptyContent || <div></div>) :
        <ul>
            {props.ticketsList.map(ticket => <TicketWidget key={ticket.id} ticket={ticket}/>)}
            {props.ticketsList.overflow && <li className="overflow-indicator">&nbsp; {props.ticketsList.overflow} flere</li>}
        </ul>
    }
</>;

export const ZendeskTickets = () => {
    const [tickets, setTickets] = useState<Array<ZendeskTicket> | null>(null);
    const [error, setError] = useState<object | null>(null);

    const fetchTickets = () => {
        fetch(server + '/api/info-screen/zendesk/tickets', {
            headers: {
                'X-API-KEY': 'min-api-key',
            }
        }).then(async (res) => {
            console.log("Response status", res.status);
            if (res.status !== 200) {
                setError(res.statusText ? {status: res.status, statusText: res.statusText} : {status: res.status});
                setTickets(null);
            } else {
                const tickets = await res.json();
                setError(null);
                setTickets(tickets);
            }
        }).catch((error) => {
            console.error("Error fetching Zendesk tickets:", error);
            setError(error);
            setTickets([]);
        });
    };

    useEffect(() => {
        fetchTickets();
        let interval = setInterval(fetchTickets, 20 * 1000);
        return () => clearInterval(interval);
    }, []);

    if (error) {
        return <div className="error">
            <div role={"alert"}>Kunne ikke hente Zendesk-saker: {'status' in error && error.status as string}</div>
            <blockquote>{JSON.stringify(error)}</blockquote>
        </div>;
    }

    if (tickets === null) {
        return <div>Henter Zendesk-saker ...</div>;
    }

    return <ZendeskTicketsTable tickets={tickets}/>;
}

const ZendeskTicketsTable = ({tickets}: { tickets: Array<ZendeskTicket> }) => {
    const maxTicketsInColumn = 5;
    // Make separate lists for each status
    const openTickets = useListWithOverflow(tickets.filter(ticket => ['new', 'open'].includes(ticket.status)), maxTicketsInColumn);
    const pendingTickets = useListWithOverflow(tickets.filter(ticket => ticket.status === 'pending'), maxTicketsInColumn);
    const solvedTodayTickets = useListWithOverflow(tickets.filter(ticket => {
        const updatedAt = new Date(ticket.updated_at);
        const today = new Date();
        return ticket.status === 'solved' && updatedAt.toDateString() === today.toDateString();
    }), 5);

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
                    <TicketsColumn ticketsList={openTickets} emptyContent={<div>Ingen!</div>}/>
                </td>
                <td>
                    <TicketsColumn ticketsList={pendingTickets}/>
                </td>
                <td>
                    <TicketsColumn ticketsList={solvedTodayTickets}/>
                </td>
            </tr>
            </tbody>
        </table>
    )


}
