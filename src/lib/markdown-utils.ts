// Markdown utility functions

export function getWordCount(markdown: string): number {
  const plainText = markdown
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]+`/g, '') // Remove inline code
    .replace(/[#*_\[\]()]/g, ''); // Remove markdown symbols

  const words = plainText.trim().split(/\s+/);
  return words.filter(word => word.length > 0).length;
}

export function getCharacterCount(markdown: string): number {
  return markdown.length;
}

export function estimateReadingTime(markdown: string): number {
  const wordCount = getWordCount(markdown);
  const wordsPerMinute = 200;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, minutes);
}

export function validateImageUrl(url: string): boolean {
  try {
    new URL(url);
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url);
  } catch {
    return false;
  }
}

export function extractHeadings(markdown: string): Array<{ level: number; text: string }> {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Array<{ level: number; text: string }> = [];

  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2],
    });
  }

  return headings;
}

export function sanitizeMarkdown(markdown: string): string {
  // Basic sanitization - remove potentially harmful scripts
  return markdown
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}
