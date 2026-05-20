import type {Interaction, SendFn} from './types'

export async function interact<T>(
  interaction: Interaction<T>,
  send: SendFn,
  sendFirst: SendFn = send,
): Promise<T> {
  let cursor = interaction.next()
  let first = true
  while (!cursor.done) {
    const apdu = cursor.value
    const response = await (first ? sendFirst : send)(apdu)
    first = false
    cursor = interaction.next(response)
  }
  return cursor.value
}
