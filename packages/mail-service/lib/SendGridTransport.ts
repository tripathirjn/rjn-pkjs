import sendGridMail, { MailService } from '@sendgrid/mail';

export type SendGridAuth = {
  api_key: string;
  api_user?: string;
};
export type SendGridOption = {
  auth: SendGridAuth;
};

function getSendGridTransport(config: SendGridOption) {
  return new SendGridTransport(config);
}

export default getSendGridTransport;

class SendGridTransport {
  constructor(config: SendGridOption) {
    const {
      auth: { api_key, api_user },
    } = config;
    if (!api_key && !api_user) throw new Error('Authentication failed.');
    if (api_user) {
      // TODO: username and password authentication
    } else {
      sendGridMail.setApiKey(api_key);
    }
  }
  public send(mail: any, callback: (...args: any[]) => void) {
    mail.normalize((err: Error, source: any) => {
      if (err) {
        return callback(err);
      }
      const msg: any = {};
      const keys = Object.keys(source || {});
      for (const key of keys) {
        switch (key) {
          case 'subject':
          case 'text':
          case 'html':
            msg[key] = source[key];
            break;
          case 'from':
          case 'replyTo':
            msg[key] = []
              .concat(source[key] || [])
              .map((entry: any) => ({
                name: entry.name,
                email: entry.address,
              }))
              .shift();
            break;
          case 'to':
          case 'cc':
          case 'bcc':
            msg[key] = [].concat(source[key] || []).map((entry: any) => ({
              name: entry.name,
              email: entry.address,
            }));
            break;
          case 'attachments':
            {
              const attachments = source.attachments.map((entry: any) => {
                const attachment: any = {
                  content: entry.content,
                  filename: entry.filename,
                  type: entry.contentType,
                  disposition: 'attachment',
                };
                if (entry.cid) {
                  attachment.content_id = entry.cid;
                  attachment.disposition = 'inline';
                }
                return attachment;
              });

              msg.attachments = [].concat(msg.attachments || []).concat(attachments);
            }
            break;
          case 'alternatives':
            {
              const alternatives = source.alternatives.map((entry: any) => {
                const alternative = {
                  content: entry.content,
                  type: entry.contentType,
                };
                return alternative;
              });

              msg.content = [].concat(msg.content || []).concat(alternatives);
            }
            break;
          case 'icalEvent':
            {
              const attachment: any = {
                content: source.icalEvent.content,
                filename: source.icalEvent.filename || 'invite.ics',
                type: 'application/ics',
                disposition: 'attachment',
              };
              msg.attachments = [].concat(msg.attachments || []).concat(attachment);
            }
            break;
          case 'watchHtml':
            {
              const alternative: any = {
                content: source.watchHtml,
                type: 'text/watch-html',
              };
              msg.content = [].concat(msg.content || []).concat(alternative);
            }
            break;
          case 'normalizedHeaders':
            msg.headers = msg.headers || {};
            Object.keys(source.normalizedHeaders || {}).forEach((header) => {
              msg.headers[header] = source.normalizedHeaders[header];
            });
            break;
          case 'messageId':
            msg.headers = msg.headers || {};
            msg.headers['message-id'] = source.messageId;
            break;
          default:
            msg[key] = source[key];
        }
      }
      if (msg.content && msg.content.length) {
        if (msg.text) {
          msg.content.unshift({ type: 'text/plain', content: msg.text });
          delete msg.text;
        }
        if (msg.html) {
          msg.content.unshift({ type: 'text/html', content: msg.html });
          delete msg.html;
        }
      }

      sendGridMail.send(msg, undefined, callback);
    });
  }
}
