import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUserData = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { email } = req.params;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { opens: true },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    res.json({ success: true, user });
  } catch (error) {
    console.error("Erro ao obter dados do usuário:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};

export const getUserReadDates = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { email } = req.params;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { opens: true },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    const readDates = user.opens.map(
      (open) => new Date(open.openedAt).toISOString().split("T")[0]
    );

    res.json({ readDates });
  } catch (error) {
    console.error("Erro ao buscar leituras:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};
