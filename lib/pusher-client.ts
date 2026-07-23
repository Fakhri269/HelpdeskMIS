import PusherJs from "pusher-js"

let pusherClient: PusherJs | null = null

export function getPusherClient(): PusherJs {
  if (!pusherClient) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY || "fa71315f14bad2d44a37"
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1"
    
    pusherClient = new PusherJs(key, {
      cluster: cluster,
    })
  }
  return pusherClient
}
