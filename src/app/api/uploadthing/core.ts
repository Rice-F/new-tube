import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

import { z } from "zod";
import { auth } from '@clerk/nextjs/server'
import { db } from "@/db";
import { videos, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const f = createUploadthing();

// 上传路由
export const ourFileRouter = {
  thumbnailUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(z.object({
      videoId: z.string().uuid(),
    }))
    // 中间件return的值会传递给onUploadComplete的metadata
    .middleware(async ({ input }) => {
      const { userId: clerkUserId } = await auth();
      if (!clerkUserId) throw new UploadThingError("Unauthorized");

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkUserId));
      if (!user) throw new UploadThingError("Unauthorized");

      return { user, ...input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await db
        .update(videos)
        .set({ thumbnailUrl: file.ufsUrl }) // 上传后文件的访问地址
        .where(
          and(
            eq(videos.id, metadata.videoId),
            eq(videos.userId, metadata.user.id)
          )
        );
      return { uploadedBy: metadata.user.id };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
