export interface ZendeskTicket {
    id: number,
    status: 'new' | 'open' | 'pending' | 'hold' | 'solved',
    updated_at: string,
    isNewArrival?: boolean,
}

export const Ticket = ({ticket}: { ticket: ZendeskTicket }) =>
    <svg className={`ticket status-${ticket.status}`} width="300" height="180" viewBox="0 0 300 180"
         xmlns="http://www.w3.org/2000/svg">
        <path
            d="M20,20
       Q35,30 50,20
       Q65,10 80,20
       Q95,30 110,20
       Q125,10 140,20
       Q155,30 170,20
       Q185,10 200,20
       Q215,30 230,20
       Q245,10 260,20
       h20
       v120
       Q265,170 250,160
       Q235,150 220,160
       Q205,170 190,160
       Q175,150 160,160
       Q145,170 130,160
       Q115,150 100,160
       Q85,170 70,160
       Q55,150 40,160
       Q25,170 20,160
       v-140
       z"
            fill="#fff"
            stroke="#bbb"
            stroke-width="3"
        />
        <text x="150" y="105" font-size="56" font-family="monospace" fill="#222" font-weight="bold"
              text-anchor="middle">{ticket.id}</text>

    </svg>
