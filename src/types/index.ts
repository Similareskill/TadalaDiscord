export type ItemCategory = 
  | 'Material de Craft'
  | 'Comum'
  | 'Raro'
  | 'Épico'
  | 'Lendário';

export type ItemStatus = 'pendente' | 'no_carrinho';

export interface ShoppingItem {
  id: string;
  name: string;
  category: ItemCategory | string;
  status: ItemStatus;
  quantity: number;
  unit: string;
  unitPrice?: number;
  packageInfo?: string;
  brandOrPreference?: string;
  notes?: string;
  imageUrl?: string;
  nameList?: string[];
  selected?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  createdByName?: string;
  collectedBy?: string;
  collectedByName?: string;
  collectedAt?: string;
}

export interface MemberStatus {
  id: string;
  memberName: string;
  level: number;
  classe: string;
  dano: number;
  defesa: number;
  acerto: number;
  power: number;
  notes?: string;
  imgurUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BossEvent {
  id: string;
  bossName: string;
  spawnTime: string; // ISO string
  location: string;
  minPower: number;
  status: 'agendado' | 'em_andamento' | 'derrotado';
  rewards?: string;
  notes?: string;
  createdAt: string;
}

export interface BossCheckin {
  id: string;
  eventId: string;
  bossName: string;
  memberName: string;
  checkinTime: string;
  points: number;
  confirmed: boolean;
}

export interface HouseholdMember {
  id: string;
  name: string;
  role: 'Líder' | 'Oficial' | 'Membro' | 'Recruta';
  avatar?: string;
  active?: boolean;
}

export interface ActivityLog {
  id: string;
  type: 'item_create' | 'item_collect' | 'item_delete' | 'status_update' | 'boss_checkin' | 'system';
  description: string;
  actor: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface ShoppingHistory {
  id: string;
  title: string;
  totalItems: number;
  completedAt: string;
  completedBy: string;
  itemsSummary: string;
}
