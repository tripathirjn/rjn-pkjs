import LogManager from  '../lib/Logger/LogManager'

describe('Test logger with info level', () => {
  test('Should get text output', () => {
    const logger = LogManager.getLogger('test');
    const logSpy = jest.spyOn(logger, 'info');
    logger.info('Hello Test!');
    expect(logSpy).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledTimes(1);
    logSpy.mockRestore();
  });
});
