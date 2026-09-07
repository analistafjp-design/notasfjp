import { headers } from "next/headers";
import FlowApp from "./flow-app";

export const dynamic = "force-dynamic";

export default async function Home() {
  const h = await headers();
  const email = h.get("oai-authenticated-user-email") ?? "Conta conectada";
  const encoded = h.get("oai-authenticated-user-full-name");
  const name = encoded && h.get("oai-authenticated-user-full-name-encoding") === "percent-encoded-utf-8"
    ? decodeURIComponent(encoded)
    : email.split("@")[0];
  return <FlowApp user={{ name, email }} />;
}
