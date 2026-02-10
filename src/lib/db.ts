import Dexie, { type Table } from 'dexie';

export interface LocalTicket {
  id: string; // ID of the ticket (or event_id + user_id)
  event_id: string; 
  user_id: string;
  status: string; // 'purchased', 'valid', 'used'
  purchase_date: string;
  event_title?: string;
  event_date?: string;
  event_location?: string;
}

export interface LocalProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_owner?: boolean;
  degree?: string;
  short_id?: string;
  gender?: string;
}

export interface LocalAgendaItem {
  id: string; // event_id
  title: string;
  description?: string;
  date: string;
  location?: string;
  type: string;
  status: 'interested' | 'attending'; // Status of user interaction
}

export interface LocalCertificate {
  id: string;
  user_id: string;
  event_id: string;
  issue_date: string;
  url: string;
  event_name?: string;
}

export class AppDatabase extends Dexie {
  tickets!: Table<LocalTicket>;
  profile!: Table<LocalProfile>;
  agenda!: Table<LocalAgendaItem>;
  certificates!: Table<LocalCertificate>;

  constructor() {
    super('CherryK2DB');
    this.version(1).stores({
      tickets: 'id, event_id, user_id',
      profile: 'id',
      agenda: 'id, date, status', // id is primary key
      certificates: 'id, user_id, event_id'
    });
  }
}

export const db = new AppDatabase();
