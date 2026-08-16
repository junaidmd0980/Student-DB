import crypto from "crypto";
import redisClient from "../config/redis.js";

const GRACE_PERIOD_SECONDS = 5;
const LOCK_PERIOD_SECONDS = 5;

function getGraceKey(oldTokenHash) {
  return `refresh:grace:${oldTokenHash}`;
}

function getLockKey(oldTokenHash) {
  return `refresh:lock:${oldTokenHash}`;
}

export async function getGraceResponse(oldTokenHash) {
  const value = await redisClient.get(
    getGraceKey(oldTokenHash)
  );

  if (!value) {
    return null;
  }

  return JSON.parse(value);
}

export async function saveGraceResponse(
  oldTokenHash,
  response
) {
  await redisClient.set(
    getGraceKey(oldTokenHash),
    JSON.stringify(response),
    {
      EX: GRACE_PERIOD_SECONDS,
    }
  );
}

export async function acquireRefreshLock(oldTokenHash) {
  const lockValue = crypto.randomUUID();

  const acquired = await redisClient.set(
    getLockKey(oldTokenHash),
    lockValue,
    {
      NX: true,
      EX: LOCK_PERIOD_SECONDS,
    }
  );

  if (acquired !== "OK") {
    return null;
  }

  return lockValue;
}

export async function releaseRefreshLock(
  oldTokenHash,
  lockValue
) {
  const script = `
    if redis.call("GET", KEYS[1]) == ARGV[1] then
      return redis.call("DEL", KEYS[1])
    else
      return 0
    end
  `;

  await redisClient.eval(script, {
    keys: [getLockKey(oldTokenHash)],
    arguments: [lockValue],
  });
}

export async function waitForGraceResponse(
  oldTokenHash,
  attempts = 20,
  delayMs = 50
) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const response = await getGraceResponse(oldTokenHash);

    if (response) {
      return response;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, delayMs);
    });
  }

  return null;
}