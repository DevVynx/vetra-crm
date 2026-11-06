import { WhatsappNotConnectedError } from "../../whatsapp/errors";
import { whatsappServices } from "../../whatsapp/services";
import { nextActionDomain } from "../domain";
import {
  NextActionCannotBeSentError,
  NextActionNeedsConfirmationError,
  NextActionTextHasMarkerError,
} from "../errors";
import { deliverNextAction } from "../helpers/deliverNextAction";
import { getNextAction } from "./getNextAction";

// The one-click send. A lead that asked not to be contacted, or a text that still has a marker to
// fill in, is only sent after the user confirmed it: the screen asks, and this refuses without it.
export async function sendNextAction(id: string, confirmed: boolean): Promise<void> {
  const action = await getNextAction(id);

  if (!nextActionDomain.canBeSent(action)) throw new NextActionCannotBeSentError();
  if (!confirmed) {
    if (action.lead.doNotContact) throw new NextActionNeedsConfirmationError();
    if (nextActionDomain.hasMarker(action.body)) throw new NextActionTextHasMarkerError();
  }
  if (!whatsappServices.isWhatsappConnected()) throw new WhatsappNotConnectedError();

  await deliverNextAction(action, false);
}
