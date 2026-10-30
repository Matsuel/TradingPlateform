import { z } from "zod";

export const kafkaEventSchema = <T extends z.ZodType>(payload: T) =>
    z.object({
        eventId: z.string().min(1),
        eventType: z.string().min(1),
        occurredAt: z.iso.datetime(),
        version: z.literal(1),
        payload,
    });
