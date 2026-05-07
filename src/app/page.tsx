import { redirect } from "next/navigation";

// Root redirects to the default demo table.
export default function Home() {
  redirect("/table/1");
}
