import { UUID } from "crypto";
import { v7 as uuidv7 } from "uuid";

export function generateUUID(): UUID {
  return uuidv7() as UUID;
}
