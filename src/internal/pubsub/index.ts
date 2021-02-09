import EventEmitter from 'events'
import { v4 as uuidv4 } from 'uuid'

export default class PubSub {
  private readonly emitter: EventEmitter

  constructor() {
    const emitter = new EventEmitter()
    this.emitter = emitter
  }

  publish(topic: string, data?: any): string {
    const eventID = uuidv4()
    const unixTimestamp = Math.floor(new Date().getTime() / 1000)

    this.emitter.emit(topic, {
      message: data,
      context: { eventID, timestamp: unixTimestamp },
    })

    return eventID
  }

  subscribe(topic: string, listener: (data: any) => void): void {
    this.emitter.on(topic, listener)
  }
    this.emitter.on(topic, data)
  }
}
