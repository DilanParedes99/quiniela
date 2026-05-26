import { redirect } from "next/navigation";
import { qrConfig } from "@/lib/config.qr";

export default function QRPage() {
  switch (qrConfig.mode) {
    case "juego":
      redirect("/juego");
      break;
    case "bases":
      redirect("/bases");
      break;
    default:
      redirect("/");
  }
}
