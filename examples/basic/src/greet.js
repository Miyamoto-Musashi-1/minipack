import { prefix } from "./constants.js"

export function greet(name) {
  const result = {
    message: `${prefix}, ${name}!`,
    timestamp: Date.now(),
  };

  return result.message;
}