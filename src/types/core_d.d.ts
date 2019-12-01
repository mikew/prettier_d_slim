declare namespace CoreDClient {
  export function start(): void
  export function stop(): void
  export function restart(): void
  export function status(): void
  export function invoke(args: string[], text?: string): void
}

declare module 'core_d' {
  export = CoreDClient
}

declare module 'core_d/lib/client' {
  export = CoreDClient
}

declare module 'core_d/lib/connect' {
  import { Socket } from 'net'

  export interface ConnectCallback {
    (errorMessage: string): void
    (errorMessage: null, socket: Socket, token: string): void
  }

  export default function connect(callback: ConnectCallback): void
}

declare module 'core_d/lib/launcher' {
  import { ConnectCallback } from 'core_d/lib/connect'

  export function launch(callback: ConnectCallback): void
}

declare module 'core_d/lib/out' {
  export function write(
    message: Parameters<typeof process.stdout.write>[0],
  ): void
}

declare module 'core_d/lib/portfile' {
  export interface ReadCallback {
    (data: null): void
    (data: { port: number; token: string }): void
  }

  export function write(port: number, token: string): void
  export function read(callback: (data: ReadCallback) => void): void
  export function unlink(): void
}

declare module 'core_d/lib/server' {
  import { Server } from 'net'
  export function start(): Server
}
