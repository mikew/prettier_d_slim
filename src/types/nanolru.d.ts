declare module 'nanolru' {
  type Key = string

  interface CacheEntry<T> {
    value: T
    modified: number
    next: Key | null
    prev: Key | null
  }

  class LRU<T = unknown> {
    constructor(opts?: number | { max?: number; maxAge?: number })
    length: number
    max: number
    maxAge: number
    keys: string[]
    clear: () => void
    remove: (key: Key) => T
    peek: (key: Key) => T | undefined
    set: (key: Key, value: T) => T
    get: (key: Key) => T | undefined
    cache: Record<Key, CacheEntry<T>>
    head: Key | null
    tail: Key | null
  }

  export default LRU
}
