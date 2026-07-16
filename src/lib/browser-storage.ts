export type StorageReader = Pick<Storage, "getItem">
export type StorageWriter = Pick<Storage, "setItem">

export function readStorageItem(
  storage: StorageReader,
  key: string
): string | null {
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

export function writeStorageItem(
  storage: StorageWriter,
  key: string,
  value: string
): boolean {
  try {
    storage.setItem(key, value)
    return true
  } catch {
    return false
  }
}
