import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CustomerCatalog } from "./CustomerCatalog";

export default async function CustomersPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const customers = await prisma.customer.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      nif: true,
      email: true,
      tipoPersona: true,
      idScheme: true,
      idType: true,
      codigoPais: true,
      foreignId: true,
    },
  });

  return <CustomerCatalog customers={customers} />;
}
