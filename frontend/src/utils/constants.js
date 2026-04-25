export const API_BASE_URL = '/api';

export const TOKEN_KEY = 'auth_token';
export const USERNAME_KEY = 'auth_username';

export const JOB_STATUS = {
  CREATED: 'CREATED',
  QUEUED: 'QUEUED',
  PROCESSING: 'PROCESSING',
  DONE: 'DONE',
  ERROR: 'ERROR',
};
export const STATUS_LABELS = {
  [JOB_STATUS.CREATED]: 'Created',
  [JOB_STATUS.QUEUED]: 'In Queue',
  [JOB_STATUS.PROCESSING]: 'Processing',
  [JOB_STATUS.DONE]: 'Completed',
  [JOB_STATUS.ERROR]: 'Error',
};
