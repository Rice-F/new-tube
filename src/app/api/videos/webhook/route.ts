import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'  // Next.js 内置获取请求头
import {
  VideoAssetCreatedWebhookEvent,
  VideoAssetErroredWebhookEvent,
  VideoAssetReadyWebhookEvent,
  VideoAssetTrackReadyWebhookEvent,
  VideoAssetDeletedWebhookEvent,
} from '@mux/mux-node/resources/webhooks'  // Mux 提供的事件类型

import { db } from "@/db"
import { mux } from '@/lib/mux'
import { videos } from '@/db/schema'

import { UTApi } from "uploadthing/server";
import logger from '@/lib/logger'

const SIGNING_SECRET = process.env.MUX_WEBHOOK_SECRET!

// 联合类型
type WebhookEvent = 
  | VideoAssetCreatedWebhookEvent
  | VideoAssetErroredWebhookEvent
  | VideoAssetReadyWebhookEvent
  | VideoAssetTrackReadyWebhookEvent
  | VideoAssetDeletedWebhookEvent

export const POST = async (request: Request) => {
  if(!SIGNING_SECRET) {
    throw new Error('MUX_WEBHOOK_SECRET is not set ')
  }

  const headersPayload = await headers()
  const muxSignature = headersPayload.get('mux-signature')

  if(!muxSignature) {
    return new Response('No signature found', { status: 401 })
  }

  const payload = await request.json() // 请求体
  const body = JSON.stringify(payload)

  mux.webhooks.verifySignature(
    body,  // body
    {
      "mux-signature": muxSignature,  // header
    },
    SIGNING_SECRET // secret
  )

  // 类型断言
  // WebhookEvent["type"] 索引访问类型
  switch(payload.type as WebhookEvent["type"]) {
    // 已创建
    case "video.asset.created": {
      const data = payload.data as VideoAssetCreatedWebhookEvent["data"]

      if(!data.upload_id) return new Response("Missing upload Id", { status: 400 })

      await db
        .update(videos)
        .set({
          muxAssetId: data.id,
          muxStatus: data.status
        })
        .where(eq(videos.muxUploadId, data.upload_id)) // 与数据库数据做匹配
      break;
    }

    // 已准备好播放
    case "video.asset.ready": {
      const data = payload.data as VideoAssetReadyWebhookEvent["data"]
      const playbackId = data.playback_ids?.[0].id

      if(!data.upload_id || !playbackId) {
        return logger.error("Missing upload Id or playback ID")
      }

      const tempThumbnailUrl = `https://image.mux.com/${playbackId}/thumbnail.jpg`
      const tempPreviewUrl = `https://image.mux.com/${playbackId}/animated.gif`
      const duration = data.duration ? Math.round(data.duration * 1000) : 0;

      const utApi = new UTApi();

      // thumbnail - 确保异步操作不会阻塞事件循环 
      setImmediate(async () => {
        try {
          // 上传至uploadthing
          const uploadThumbnail = await utApi.uploadFilesFromUrl(tempThumbnailUrl)

          if(!uploadThumbnail.data?.ufsUrl) {
            return logger.error("Failed to upload thumbnail")
          }

          const { key: thumbnailKey, ufsUrl: thumbnailUrl } = uploadThumbnail.data

          await db
            .update(videos)
            .set({
              thumbnailUrl,
              thumbnailKey,
            })
            .where(eq(videos.muxUploadId, data.upload_id!)) // data.upload_id! 表示非空断言
        }catch(err) {
          logger.error('Error processing video.asset.ready webhook:', err)
        }
      }) 

      // previewUrl
      setImmediate(async () => {
        try {
          // 上传至uploadthing
          const uploadPreview = await utApi.uploadFilesFromUrl(tempPreviewUrl)

          if(!uploadPreview.data?.ufsUrl) {
            return logger.error("Failed to upload preview")
          }

          const { key: previewKey, ufsUrl: previewUrl } = uploadPreview.data

          await db
            .update(videos)
            .set({
              previewUrl,
              previewKey,
            })
            .where(eq(videos.muxUploadId, data.upload_id!))
        }catch (err) {
          logger.error('Error processing video.asset.ready webhook:', err)
        }

      })

      await db
        .update(videos)
        .set({
          muxStatus: data.status,
          muxPlaybackId: playbackId,
          muxAssetId: data.id,
          duration
        })
        .where(eq(videos.muxUploadId, data.upload_id))
      break;
    }

    // error
    case 'video.asset.errored': {
      const data = payload.data as VideoAssetErroredWebhookEvent['data']

      if(!data.upload_id) return new Response("Missing upload Id", { status: 400 })

      await db
        .update(videos)
        .set({
          muxStatus: data.status
        })
        .where(eq(videos.muxUploadId, data.upload_id))
      break;
    }

    // 已删除
    case 'video.asset.deleted': {
      const data = payload.data as VideoAssetDeletedWebhookEvent['data']

      if(!data.upload_id) return new Response("Missing upload Id", { status: 400 })

      await db
        .delete(videos)
        .where(eq(videos.muxUploadId, data.upload_id))
      break;
    }

    // 字幕文本轨道就绪
    case "video.asset.track.ready": {
      const data = payload.data as VideoAssetTrackReadyWebhookEvent['data'] & { asset_id: string }

      const assetId = data.asset_id
      const trackId = data.id
      const status = data.status

      if(!assetId) return new Response('Missing asset ID', {status: 400})

      await db
        .update(videos)
        .set({
          muxTrackId: trackId,
          muxStatus: status
        })
        .where(eq(videos.muxAssetId, assetId))
      break;
    }
  }

  return new Response('Webhook received', { status: 200 })
}