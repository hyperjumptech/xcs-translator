/**********************************************************************************
 *                                                                                *
 *    Copyright (C) 2021  XCS TRANSLATOR Contributors                             *
 *                                                                                *
 *   This program is free software: you can redistribute it and/or modify         *
 *   it under the terms of the GNU Affero General Public License as published     *
 *   by the Free Software Foundation, either version 3 of the License, or         *
 *   (at your option) any later version.                                          *
 *                                                                                *
 *   This program is distributed in the hope that it will be useful,              *
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of               *
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the                *
 *   GNU Affero General Public License for more details.                          *
 *                                                                                *
 *   You should have received a copy of the GNU Affero General Public License     *
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.       *
 *                                                                                *
 **********************************************************************************/

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
}
