import { Rcon } from './rcon';
import { TOptions } from './types';

const promise = (
  options: TOptions,
): Promise<ReturnType<typeof Rcon>> => {
  const { rconEmitter, client, ...rest } = Rcon(options, true);

  return new Promise((resolve, reject) => {
    rconEmitter.once('connected', () =>
      resolve({ rconEmitter, client, ...rest }),
    );

    rconEmitter.once('close', () => {
      client.end();
      reject();
    });

    rconEmitter.once('error', (error) => {
      reject(error);
    });
  });
};

export const RconPromise = async (
  options: TOptions,
): Promise<ReturnType<typeof Rcon>> => {
  try {
    return await promise(options);
  } catch {
    if (
      (typeof options.autoReconnect === 'undefined' && true) ||
      options.autoReconnect
    ) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(RconPromise(options));
        }, options.autoReconnectDelay || 10000);
      });
    }

    throw Error('Connection close');
  }
};
