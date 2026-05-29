// pdf-parse is CJS and reads a sample PDF from disk on import in some setups.
// We import the function from its internal path to avoid that side effect.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const result = await pdfParse(buffer);
  return String(result?.text || '').trim();
}
