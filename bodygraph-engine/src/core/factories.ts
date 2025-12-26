import { Center, CenterId } from './Center';
import { Gate } from './Gate';
import { Channel } from './Channel';

export function createCenter(id: CenterId, defined: boolean): Center {
  return { id, defined };
}

export function createGate(id: number, active: boolean): Gate {
  return { id, active };
}

export function createChannel(
  id: string,
  fromGate: number,
  toGate: number,
  defined: boolean
): Channel {
  return { id, fromGate, toGate, defined };
}

export function parseChannelId(channelId: string): { fromGate: number; toGate: number } | null {
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

export function formatChannelId(fromGate: number, toGate: number): string {
  return `${fromGate}-${toGate}`;
}
