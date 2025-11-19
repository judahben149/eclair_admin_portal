import { useState, useCallback } from 'react';
import { getWordCount, getCharacterCount, estimateReadingTime } from '@/lib/markdown-utils';

interface MarkdownStats {
  wordCount: number;
  characterCount: number;
  readingTime: number;
}

export function useMarkdown(initialValue: string = '') {
  const [markdown, setMarkdown] = useState(initialValue);
  const [stats, setStats] = useState<MarkdownStats>({
    wordCount: 0,
    characterCount: 0,
    readingTime: 0,
  });

  const updateMarkdown = useCallback((value: string) => {
    setMarkdown(value);
    setStats({
      wordCount: getWordCount(value),
      characterCount: getCharacterCount(value),
      readingTime: estimateReadingTime(value),
    });
  }, []);

  return {
    markdown,
    setMarkdown: updateMarkdown,
    stats,
  };
}
