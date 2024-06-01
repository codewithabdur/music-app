import { createClient } from "@sanity/client";

const oldclient = createClient({
  projectId: "6rz6ozsr",
  dataset: "production",
  useCdn: false,
  apiVersion: "2024-06-01",
});

export default oldclient;
