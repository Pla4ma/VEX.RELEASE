import { authHandlers } from './handlers/auth';
import { databaseHandlers } from './handlers/database';
import { sessionHandlers } from './handlers/session';
import { errorHandlers } from './handlers/error';

export { authHandlers, databaseHandlers, sessionHandlers, errorHandlers };

export const handlers = [
  ...authHandlers,
  ...databaseHandlers,
  ...sessionHandlers,
  ...errorHandlers,
];
