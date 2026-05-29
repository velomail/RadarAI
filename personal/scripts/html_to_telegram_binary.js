/**
 * Convert HTML string -> binary file for Telegram "Send Document".
 * Pass json.caption through to the Telegram node.
 *
 * n8n Code node: JavaScript, "Run Once for All Items"
 * Telegram node MUST have: Resource=Message, Operation=Send Document,
 *   Binary Data=ON, Input Binary Field=data, additionalFields.caption set to
 *   "={{ $json.caption }}".
 */

// === N8N COPY START ===

const items = $input.all();
const stamp = new Date().toISOString().slice(0, 10);
const fileName = `job_matches_${stamp}.html`;

const output = [];

for (const item of items) {
  const data = item.json || {};
  const htmlContent = data.html;
  if (!htmlContent) {
    throw new Error('Missing item.json.html from Parse AI to HTML node.');
  }

  const buffer = Buffer.from(htmlContent, 'utf8');

  let binary;
  if (this.helpers?.prepareBinaryData) {
    binary = await this.helpers.prepareBinaryData(buffer, fileName, 'text/html');
  } else {
    binary = {
      data: buffer.toString('base64'),
      mimeType: 'text/html',
      fileName,
      fileExtension: 'html',
    };
  }

  output.push({
    json: {
      ...data,
      fileName,
      caption: data.caption || '',
    },
    binary: {
      data: binary,
    },
  });
}

return output;

// === N8N COPY END ===
