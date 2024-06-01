import { createClient } from "@sanity/client";

const client = createClient({
  projectId: "1vb3djf2",
  dataset: "production",
  useCdn: false,
  apiVersion: "2024-06-01",
});

export default client;