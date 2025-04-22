export interface Chat {
    id: string;
    other_user_id: string;
    created_at: string;
    last_message?: {
      content: string;
      sender: string;
      timestamp: string;
    };
  }