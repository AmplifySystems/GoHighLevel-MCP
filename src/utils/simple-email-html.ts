/**
 * Minimal HTML wrapper for GHL workflow / template emails.
 * Keeps body readable on mobile: single column, ~18px body text, dark-on-light safe defaults.
 */

export interface SimpleEmailHtmlOptions {
  /** Body font size in px (default 18 — matches “18 point” readability target in Quick Compose) */
  fontSizePx?: number;
  /** Max content width in px */
  maxWidthPx?: number;
  /** Optional line-height unitless (default 1.55) */
  lineHeight?: number;
  /** If true, body is escaped as plain text (line breaks → <br/>); if false, body is inserted as HTML fragment */
  bodyIsPlainText?: boolean;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Returns a full HTML document suitable for `create_email_template` / workflow “HTML” email steps.
 * Merge tags like {{contact.first_name}} pass through unchanged when bodyIsPlainText is false.
 */
export function buildSimpleEmailHtml(body: string, options: SimpleEmailHtmlOptions = {}): string {
  const fontSizePx = options.fontSizePx ?? 18;
  const maxWidthPx = options.maxWidthPx ?? 640;
  const lineHeight = options.lineHeight ?? 1.55;
  const bodyIsPlainText = options.bodyIsPlainText ?? false;

  const inner = bodyIsPlainText
    ? escapeHtml(body).replace(/\r\n/g, '\n').split('\n').join('<br/>\n')
    : body;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title></title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:${maxWidthPx}px;background-color:#ffffff;border-radius:8px;">
          <tr>
            <td style="padding:28px 24px;font-family:Verdana,Geneva,sans-serif;font-size:${fontSizePx}px;line-height:${lineHeight};color:#1a1a1a;">
${inner}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
