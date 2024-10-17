export function validateSocketConnection(message: any): boolean {
  if (message.connectionId == null || message.connectionId == undefined) {
    console.error("No connectionId specified in message");
    return false;
  }

  if (message.event == null || message.event == undefined) {
    console.error("No event specified in message");
    return false;
  }

  return true;
}
