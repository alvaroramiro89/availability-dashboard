export interface TeamMember {
  name: string;
  initial: string;
  color: string;
  password: string;
}

export interface AvailabilityData {
  [date: string]: {
    [member: string]: {
      [slot: string]: boolean;
    };
  };
}

export interface PendingChange {
  date: string;
  member: string;
  slot: string;
  available: boolean;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  updatedCount?: number;
}

