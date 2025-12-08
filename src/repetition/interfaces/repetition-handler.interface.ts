import { Repetition } from '../entities/repetition.entity';

export interface RepetitionHandler {
  handle(repetition: Repetition): Promise<void>;
}
