export type CenterId = 
  | 'head'
  | 'ajna'
  | 'throat'
  | 'g'
  | 'heart'
  | 'spleen'
  | 'sacral'
  | 'solar'
  | 'root';

export interface Center {
  id: CenterId;
  defined: boolean;
}
