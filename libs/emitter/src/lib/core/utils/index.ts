import { ReceiverMetaData, RECEIVER_META_KEY } from '../internal/internals';

export function flatten<T>(flattenable: T | T[]): T[] {
  return Array.isArray(flattenable) ? flattenable : [flattenable];
}

export function getReceiverMetadata(receiver: Function): ReceiverMetaData {
  return (receiver as any)[RECEIVER_META_KEY];
}
