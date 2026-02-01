export interface HealthResponse {
  status: string;
  message: string;
}

export interface CreateSessionRequest {
  email: string;
  openai_key: string;
}

export interface CreateSessionResponse {
  email: string;
  session_token: string;
  openai_key: string;
}
