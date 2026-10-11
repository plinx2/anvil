/** チケットの番号をパスのパラメータにする */
export const ticketPath = (ticketId: number) => ({ params: { path: { ticketId: String(ticketId) } } });
