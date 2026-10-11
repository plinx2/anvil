/** チケットの編集(誰でもできる項目)。指定した項目だけ変わる。 */
export interface TicketEdit {
  title?: string;
  body?: string;
  slug?: string;
  designNeeded?: boolean;
  targetRepos?: readonly string[];
}
