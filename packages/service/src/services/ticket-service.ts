import { Kind, State } from '@anvil/entity';
import type {
  AddDependency,
  AddEntry,
  CreateTicket,
  DiscardTicket,
  GetBoard,
  GetTicketDetail,
  ListEntries,
  RemoveDependency,
  RequestContext,
  SetAutoGate,
  UpdateTicket,
} from '@anvil/usecase';
import { type AddDependencyInput, AddDependencyInputSchema } from '../input/add-dependency-input';
import { type AddEntryInput, AddEntryInputSchema } from '../input/add-entry-input';
import { type CreateTicketInput, CreateTicketInputSchema } from '../input/create-ticket-input';
import { type DiscardTicketInput, DiscardTicketInputSchema } from '../input/discard-ticket-input';
import { type GetBoardInput, GetBoardInputSchema } from '../input/get-board-input';
import { type GetTicketDetailInput, GetTicketDetailInputSchema } from '../input/get-ticket-detail-input';
import { type ListEntriesInput, ListEntriesInputSchema } from '../input/list-entries-input';
import { type RemoveDependencyInput, RemoveDependencyInputSchema } from '../input/remove-dependency-input';
import { type SetAutoGateInput, SetAutoGateInputSchema } from '../input/set-auto-gate-input';
import { type UpdateTicketInput, UpdateTicketInputSchema } from '../input/update-ticket-input';
import { type AddDependencyOutput, toAddDependencyOutput } from '../output/add-dependency-output';
import { type AddEntryOutput, toAddEntryOutput } from '../output/add-entry-output';
import { type CreateTicketOutput, toCreateTicketOutput } from '../output/create-ticket-output';
import { type DiscardTicketOutput, toDiscardTicketOutput } from '../output/discard-ticket-output';
import { type GetBoardOutput, toGetBoardOutput } from '../output/get-board-output';
import { type GetTicketDetailOutput, toGetTicketDetailOutput } from '../output/get-ticket-detail-output';
import { type ListEntriesOutput, toListEntriesOutput } from '../output/list-entries-output';
import { type RemoveDependencyOutput, toRemoveDependencyOutput } from '../output/remove-dependency-output';
import { type SetAutoGateOutput, toSetAutoGateOutput } from '../output/set-auto-gate-output';
import { toUpdateTicketOutput, type UpdateTicketOutput } from '../output/update-ticket-output';

/** チケットの操作(起票、更新、破棄、依存、エントリ、一覧、詳細)。 */
export class TicketService {
  constructor(
    private readonly createTicket: CreateTicket,
    private readonly updateTicket: UpdateTicket,
    private readonly discardTicket: DiscardTicket,
    private readonly addDependencyOf: AddDependency,
    private readonly removeDependencyOf: RemoveDependency,
    private readonly setAutoGate: SetAutoGate,
    private readonly addEntry: AddEntry,
    private readonly listEntries: ListEntries,
    private readonly getBoard: GetBoard,
    private readonly getTicketDetail: GetTicketDetail,
  ) {}

  /** 起票(任意の状態で)。 */
  async create(ctx: RequestContext, input: CreateTicketInput): Promise<CreateTicketOutput> {
    const i = CreateTicketInputSchema.parse(input);
    const output = await this.createTicket.execute(ctx, {
      ...i,
      kind: i.kind ? Kind.of(i.kind) : undefined,
      state: i.state ? State.of(i.state) : undefined,
    });
    return toCreateTicketOutput(output);
  }

  /** チケットの更新(誰でもできる。slug はブランチを切る前だけ)。 */
  async update(ctx: RequestContext, input: UpdateTicketInput): Promise<UpdateTicketOutput> {
    return toUpdateTicketOutput(await this.updateTicket.execute(ctx, UpdateTicketInputSchema.parse(input)));
  }

  /** 破棄(削除)。ブランチとワークツリーは残す。 */
  async discard(ctx: RequestContext, input: DiscardTicketInput): Promise<DiscardTicketOutput> {
    return toDiscardTicketOutput(await this.discardTicket.execute(ctx, DiscardTicketInputSchema.parse(input)));
  }

  async addDependency(ctx: RequestContext, input: AddDependencyInput): Promise<AddDependencyOutput> {
    return toAddDependencyOutput(await this.addDependencyOf.execute(ctx, AddDependencyInputSchema.parse(input)));
  }

  async removeDependency(ctx: RequestContext, input: RemoveDependencyInput): Promise<RemoveDependencyOutput> {
    return toRemoveDependencyOutput(await this.removeDependencyOf.execute(ctx, RemoveDependencyInputSchema.parse(input)));
  }

  /** 自動ゲート承認フラグの切り替え(起票後も可能)。 */
  async changeAutoGate(ctx: RequestContext, input: SetAutoGateInput): Promise<SetAutoGateOutput> {
    return toSetAutoGateOutput(await this.setAutoGate.execute(ctx, SetAutoGateInputSchema.parse(input)));
  }

  /** エントリの追記(書き手は、文脈の主体)。 */
  async appendEntry(ctx: RequestContext, input: AddEntryInput): Promise<AddEntryOutput> {
    return toAddEntryOutput(await this.addEntry.execute(ctx, AddEntryInputSchema.parse(input)));
  }

  /** エントリの読み取り(状態、直近の件数で絞れる)。 */
  async entries(ctx: RequestContext, input: ListEntriesInput): Promise<ListEntriesOutput> {
    const i = ListEntriesInputSchema.parse(input);
    return toListEntriesOutput(await this.listEntries.execute(ctx, { ...i, state: i.state ? State.of(i.state) : undefined }));
  }

  /** カンバン(チケットの一覧)。 */
  async board(ctx: RequestContext, input: GetBoardInput): Promise<GetBoardOutput> {
    return toGetBoardOutput(await this.getBoard.execute(ctx, GetBoardInputSchema.parse(input)));
  }

  /** チケットの詳細。 */
  async detail(ctx: RequestContext, input: GetTicketDetailInput): Promise<GetTicketDetailOutput> {
    return toGetTicketDetailOutput(await this.getTicketDetail.execute(ctx, GetTicketDetailInputSchema.parse(input)));
  }
}
