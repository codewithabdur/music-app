import { createClient } from "@sanity/client";

const oldclient = createClient({
  projectId: "6rz6ozsr",
  dataset: "production",
});

export default oldclient;
