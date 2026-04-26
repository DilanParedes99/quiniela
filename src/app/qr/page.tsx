import { redirect } from "next/navigation";
import { qrConfig } from "@/lib/config.qr";

export default function QRPage() {
  qrConfig.mode === "bases" ? redirect("/") : redirect("/quiniela");
}
