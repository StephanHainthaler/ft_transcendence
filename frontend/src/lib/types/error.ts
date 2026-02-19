export interface AppError {
  message: string;
  code?: number;
  isAppError?: boolean;
  extra?: any;
}

export function isAppError(err: any): err is AppError {
  return (err && typeof err === 'object' 
    && (err.isAppError === true));
}