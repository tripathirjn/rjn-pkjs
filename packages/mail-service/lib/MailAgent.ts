import { SendMailOpts } from './types';

/**
 * Mail service
 */
class MailAgent {
  /**
   * Html regex of mail service
   */
  private static HTML_REGEX: RegExp = /<\/?[a-z][\s\S]*>/i;

  /**
   * Mail sent from of mail service
   */
  private static MAIL_SENT_FROM: string = 'tripathirajan3@gmail.com';

  /**
   * Transport  of mail service
   */
  private transport: any = null;

  /**
   * Creates an instance of mail service.
   * @param transport
   */
  constructor(transport: any) {
    this.transport = transport;
  }

  /**
   * Sends mail
   * @param payload
   */
  private sendMail(payload: SendMailOpts) {
    const { to, subject, body, ...rest } = payload;
    if (!to || !subject || !body) {
      const err = new Error("Can't sent email, please check the params.") as any;
      err.data = payload;
      throw err;
    }
    let { isHtml, from } = rest;
    if (!isHtml) {
      isHtml = MailAgent.HTML_REGEX.test(body);
    }
    from = from || MailAgent.MAIL_SENT_FROM;
    const { callback } = rest;
    this.transport
      .sendMail({
        to,
        from,
        subject,
        ...(isHtml ? { html: body } : { text: body }),
      })
      .then((result: any) => {
        if (callback && typeof callback === 'function') {
          callback(result, null);
        }
        return result;
      })
      .catch((err: any) => {
        if (callback && typeof callback === 'function') {
          callback(null, err);
        }
      });
  }

  /**
   * Sends html mail
   * @param payload
   */
  sendHTMLMail(payload: SendMailOpts) {
    this.sendMail({ ...payload, isHtml: true });
  }

  /**
   * Sends plain text mail
   * @param payload
   */
  sendPlainTextMail(payload: SendMailOpts) {
    this.sendMail({ ...payload, isHtml: false });
  }
}

export default MailAgent;
