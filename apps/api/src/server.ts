import { profileServices, stageServices, systemServices, whatsappServices } from "@vetra/core";
import { envConfig } from "@vetra/env/server";
import { envConfig as wahaEnvConfig } from "@vetra/env/waha";

import { app } from "./app";

const { API_PORT, API_HOST, AUTO_MIGRATE, MIGRATIONS_DIR } = envConfig.get();

wahaEnvConfig.get();

if (AUTO_MIGRATE) {
  if (!MIGRATIONS_DIR) throw new Error("AUTO_MIGRATE needs MIGRATIONS_DIR");

  await systemServices.migrateDatabase(MIGRATIONS_DIR);
}
await profileServices.ensureProfile();
await stageServices.ensureStages();
whatsappServices.startWhatsappSync();

// There is no authentication, so the API must never be reachable from the network: it listens on
// this computer only, or, in a container, on every interface with the port published only here.
app.listen(API_PORT, API_HOST, () => {
  console.log(`Vetra rodando em http://localhost:${API_PORT} 🚀`);
});
