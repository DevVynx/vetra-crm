import { envConfig } from "@vetra/env/server";

import { app } from "./app";

const { API_PORT } = envConfig.get();

// There is no authentication, so the API must never be reachable from the network.
const HOST = "127.0.0.1";

app.listen(API_PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${API_PORT}/api 🚀`);
});
