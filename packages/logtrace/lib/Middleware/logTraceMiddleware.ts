const logTraceMiddleware = (req: any, res: any, next: (...args: any[]) => void) => {
  const globalData = global as any;
  globalData.reqInfo = req;
  next();
};
export default logTraceMiddleware;
