import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "1vb3djf2",
  dataset: "production",
});

export default client;