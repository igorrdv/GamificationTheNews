import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

export const getMetrics = async (req: Request, res: Response): Promise<any> => {
  const prisma = new PrismaClient();
  const { startDate, endDate, streakStatus, newsletterId } = req.query;

  try {
    const openedAtFilter: any = {};
    if (startDate) {
      openedAtFilter.gte = new Date(startDate as string);
    }
    if (endDate) {
      openedAtFilter.lte = new Date(endDate as string);
    }

    const streakFilter =
      streakStatus === "active"
        ? { gt: 0 }
        : streakStatus === "inactive"
        ? { eq: 0 }
        : undefined;

    const postIdFilter = newsletterId ? { postId: String(newsletterId) } : {};

    const totalOpens = await prisma.open.count({
      where: {
        openedAt: openedAtFilter,
        ...postIdFilter,
      },
    });

    const ranking = await prisma.user.findMany({
      where: {
        streak: streakFilter,
      },
      orderBy: { streak: "desc" },
      select: {
        email: true,
        streak: true,
        opens: {
          select: {
            openedAt: true,
            postId: true,
          },
        },
      },
      take: 10,
    });

    return res.status(200).json({
      totalOpens,
      ranking,
    });
  } catch (error) {
    console.error("Erro ao buscar métricas:", error);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
};
