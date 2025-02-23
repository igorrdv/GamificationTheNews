import { Request, Response } from "express";
import { updateUserStreak } from "../services/streakService";
import { PrismaClient } from "@prisma/client";

export const handleWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  const prisma = new PrismaClient();
  try {
    const { data } = req.body;
    if (!data) {
      res.status(400).json({ error: "Dados ausentes no corpo." });
      return;
    }

    const {
      id: subscriberIdRaw,
      email,
      status,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_channel,
      referring_site,
      created_at,
    } = data;

    const subscriberId = subscriberIdRaw ? String(subscriberIdRaw) : null;
    if (!email || !subscriberId) {
      res.status(400).json({ error: "Email e subscriberId são necessários." });
      return;
    }

    const newOpenDate = new Date(created_at);

    const startOfDay = new Date(
      Date.UTC(
        newOpenDate.getUTCFullYear(),
        newOpenDate.getUTCMonth(),
        newOpenDate.getUTCDate()
      )
    );
    const endOfDay = new Date(
      Date.UTC(
        newOpenDate.getUTCFullYear(),
        newOpenDate.getUTCMonth(),
        newOpenDate.getUTCDate() + 1
      )
    );

    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const existingOpen = await prisma.open.findFirst({
        where: {
          userId: user.id,
          openedAt: {
            gte: startOfDay,
            lt: endOfDay,
          },
        },
      });
      if (existingOpen) {
        res.json({ success: false, message: "Leitura já registrada." });
        return;
      }
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          subscriberId,
          email,
          status,
          createdAt: newOpenDate,
          referringSite: referring_site,
          streak: 1,
          bestStreak: 1,
          lastOpen: newOpenDate,
        },
      });
    } else {
      const newStreak = updateUserStreak(
        user.lastOpen,
        newOpenDate,
        user.streak
      );
      const newBestStreak = Math.max(user.bestStreak, newStreak);
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriberId,
          status,
          referringSite: referring_site,
          createdAt: newOpenDate,
          streak: newStreak,
          bestStreak: newBestStreak,
          lastOpen: newOpenDate,
        },
      });
    }

    await prisma.open.create({
      data: {
        userId: user.id,
        postId: subscriberId,
        openedAt: newOpenDate,
        utmSource: utm_source ? String(utm_source) : undefined,
        utmMedium: utm_medium ? String(utm_medium) : undefined,
        utmCampaign: utm_campaign ? String(utm_campaign) : undefined,
        utmChannel: utm_channel ? String(utm_channel) : undefined,
      },
    });

    res.json({ success: true, user });
  } catch (error) {
    console.error("Erro no webhook:", error);
    res.status(500).json({ error: "Erro interno no servidor." });
  } finally {
    await prisma.$disconnect();
  }
};
