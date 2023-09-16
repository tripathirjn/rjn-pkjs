import * as fs from 'fs';
import path from 'path';
import { LoggerConfig } from '../types';
import { default as logConfig } from './logConfig';
import { stdout } from 'process';
const overrideConfigFile = 'logRules.json';
const overrideConfigFilePath = path.join(process.cwd(), overrideConfigFile);
let config: LoggerConfig = logConfig;

const showMessage = (message: string) => {
  stdout.write(message);
};

try {
  const customConfig = fs.readFileSync(overrideConfigFilePath);
  config = Object.assign(logConfig, JSON.parse(customConfig.toString()));
} catch (ex) {
  showMessage('To override default rules, create logRules.json at root of project and paste following configs:');
  showMessage(JSON.stringify(logConfig));
}

export default config;
