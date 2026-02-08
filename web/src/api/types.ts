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

export interface LogoutResponse {
  status: string;
  message: string;
}

export interface UserResponse {
  email: string;
}

export type ResumeListItem = {
  resume_id: string;
  created_at: string;
  has_content: boolean;
  label: string;
};

export type ResumeListResponse = {
  resumes: ResumeListItem[];
};

export type ResumeDeleteResponse = {
  status: string;
  message: string;
};

export type ResumeImportResponse = {
  resume_id: string;
  sections: {
    sectionKey: string;
    items: {
      id: string;
      values: Record<string, string>;
    }[];
  }[];
};

export type ResumeSchemaField = {
  key: string;
  label: string;
  type: string;
};

export type ResumeSchemaSection = {
  sectionKey: string;
  title: string;
  entryType: string;
  fields: ResumeSchemaField[];
};

export type ResumeSchemaResponse = {
  sections: ResumeSchemaSection[];
};
