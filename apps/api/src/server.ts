import { profileServices, stageServices } from "@vetra/core";
import { envConfig } from "@vetra/env/server";
import { envConfig as wahaEnvConfig } from "@vetra/env/waha";

import { app } from "./app";

const { API_PORT } = envConfig.get();

wahaEnvConfig.get();

// There is no authentication, so the API must never be reachable from the network.
const HOST = "127.0.0.1";

await profileServices.ensureProfile();
await stageServices.ensureStages();

app.listen(API_PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${API_PORT}/api 🚀`);
});
