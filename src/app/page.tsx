import { redirect } from "next/navigation";

export default function RootPage() {
  // Automatically send the user to the dashboard
  redirect("/home");
}