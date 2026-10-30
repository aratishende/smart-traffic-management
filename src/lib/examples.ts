import { supabase } from '@/lib/supabase';
import { ExampleAlgorithm, RealWorldExample } from '@/types';

export const ALGORITHM_LABELS: Record<ExampleAlgorithm, string> = {
  scheduling: 'CPU Scheduling',
  producerConsumer: 'Producer–Consumer',
  bankers: "Banker's Algorithm",
  memory: 'Memory Management',
};

export const SITUATION_MIN = 20;
export const SITUATION_MAX = 600;
export const NAME_MAX = 60;

export interface ExampleDraft {
  algorithm: ExampleAlgorithm;
  author_name: string;
  situation: string;
}

export async function listExamples(): Promise<RealWorldExample[]> {
  const { data, error } = await supabase
    .from('real_world_examples')
    .select('id, algorithm, author_name, situation, created_at')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  if (!Array.isArray(data)) throw new Error('Unexpected response from the server.');
  return data as RealWorldExample[];
}

export async function submitExample(draft: ExampleDraft): Promise<void> {
  const { error } = await supabase.from('real_world_examples').insert({
    algorithm: draft.algorithm,
    author_name: draft.author_name.trim(),
    situation: draft.situation.trim(),
  });
  if (error) throw new Error(error.message);
}
