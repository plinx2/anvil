import type { AnswerQuestion, AskQuestion, RequestContext } from '@anvil/usecase';
import { type AnswerQuestionInput, AnswerQuestionInputSchema } from '../input/answer-question-input';
import { type AskQuestionInput, AskQuestionInputSchema } from '../input/ask-question-input';
import { type AnswerQuestionOutput, toAnswerQuestionOutput } from '../output/answer-question-output';
import { type AskQuestionOutput, toAskQuestionOutput } from '../output/ask-question-output';

/** 承認待ちフラグ(途中の質問と、回答)。 */
export class FlagService {
  constructor(
    private readonly askQuestion: AskQuestion,
    private readonly answerQuestion: AnswerQuestion,
  ) {}

  /** 質問。フラグを立てて、同じ状態で止まる(担当のロールだけ)。 */
  async ask(ctx: RequestContext, input: AskQuestionInput): Promise<AskQuestionOutput> {
    return toAskQuestionOutput(await this.askQuestion.execute(ctx, AskQuestionInputSchema.parse(input)));
  }

  /** 回答(人間のみ)。フラグが下りて、同じ状態が続く。 */
  async answer(ctx: RequestContext, input: AnswerQuestionInput): Promise<AnswerQuestionOutput> {
    return toAnswerQuestionOutput(await this.answerQuestion.execute(ctx, AnswerQuestionInputSchema.parse(input)));
  }
}
