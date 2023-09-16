import path from 'path';
import fs from 'fs';
import { stdout } from 'process';
const DIR_MODE = 0o777;
const WIN_32 = 'win32';
const PATH_REGEX = /[<>:"|?*]/;

/**
 * Utility
 */
class Utility {
  /**
   * Ensures dir sync
   * @param dirPath
   * @returns
   */
  public static ensureDirSync(dirPath: string) {
    if (!dirPath) {
      return;
    }
    if (process?.platform === WIN_32 && PATH_REGEX?.test(dirPath?.replace(path?.parse(dirPath)?.root, ''))) {
      stdout.write(`[EINVAL] Invalid log path. path contains invalid characters: ${dirPath}`);
      return;
    }
    if (fs.existsSync(dirPath)) {
      return;
    }
    return fs.mkdirSync(dirPath, {
      recursive: true,
      mode: DIR_MODE, // this option not supported on window
    });
  }

  /**
   * To file name case
   * @param str
   * @returns
   */
  public static toFileNameCase(str: string) {
    if (!str) {
      return str;
    }
    const arr = str.split(' ');
    for (let i = 0; i < arr.length; i++) {
      arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
    }
    const str2 = arr.join(' ');
    return str2;
  }
}

export default Utility;
