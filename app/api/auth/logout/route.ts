import { jsonSuccess } from "@/lib/http";

export async function POST() {
  return jsonSuccess({ message: "Successfully logged out" });
}
