import { create } from "zustand";

type ConnectionState = {
  isLost: boolean;
};

// Whether the server can't be reached. A store because the query client, outside React, is what
// notices, and the app shell, inside it, is what shows it.
export const useConnectionStore = create<ConnectionState>(() => ({ isLost: false }));
