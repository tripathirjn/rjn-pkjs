export type SmtpAuth = {
  user: string;
  pass: string;
};
export type SmtpOpts = {
  host: string;
  port: number;
  secure: boolean;
  auth: SmtpAuth;
};
export type SendGridAuth = {
  api_key: string;
};
export type SendGridConfig = {
  auth: SendGridAuth;
};

export type SendMailOpts = {
  to: string;
  from: string;
  subject: string;
  body: string;
  isHtml?: boolean;
  callback?: (result?: any, error?: any) => void;
};
