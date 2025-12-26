import { Center, CenterId } from './Center';
import { Gate } from './Gate';
import { Channel } from './Channel';

const VALID_CENTER_IDS: CenterId[] = [
  'head',
  'ajna',
  'throat',
  'g',
  'heart',
  'spleen',
  'sacral',
  'solar',
  'root'
];

export function isValidCenterId(id: string): id is CenterId {
  return VALID_CENTER_IDS.includes(id as CenterId);
}

export function validateCenter(center: Center): boolean {
  return isValidCenterId(center.id) && typeof center.defined === 'boolean';
}

export function validateGate(gate: Gate): boolean {
  return (
    typeof gate.id === 'number' &&
    gate.id >= 1 &&
    gate.id <= 64 &&
    typeof gate.active === 'boolean'
  );
}

export function validateChannel(channel: Channel): boolean {
  const parsed = parseChannelId(channel.id);
  if (!parsed) {
    return false;
  }
  
  return (
    parsed.fromGate === channel.fromGate &&
    parsed.toGate === channel.toGate &&
    channel.fromGate >= 1 &&
    channel.fromGate <= 64 &&
    channel.toGate >= 1 &&
    channel.toGate <= 64 &&
    typeof channel.defined === 'boolean'
  );
}

function parseChannelId(channelId: string): { fromGate: number; toGate: number } | null {
  const parts = channelId.split('-');
  if (parts.length !== 2) {
    return null;
  }
  
  const fromGate = parseInt(parts[0], 10);
  const toGate = parseInt(parts[1], 10);
  
  if (isNaN(fromGate) || isNaN(toGate)) {
    return null;
  }
  
  return { fromGate, toGate };
}
