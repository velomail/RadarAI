import { extractPdfText } from '@/lib/pdf';

export async function extractResumeFromFile(file: File): Promise<string> {
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('Resume must be under 2MB.');
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const resumeText = await extractPdfText(buf);
  if (!resumeText || resumeText.length < 100) {
    throw new Error('Could not extract enough text from this PDF.');
  }

  return resumeText;
}
