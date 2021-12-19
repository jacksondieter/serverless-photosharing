import { PhotoAccess } from './photosAccess'
import { AttachmentUtils } from './attachmentUtils';
import { PhotoItem } from '../models/PhotoItem'
import { CreatePhotoRequest } from '../requests/CreatePhotoRequest'
import { UpdatePhotoRequest } from '../requests/UpdatePhotoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
// import * as createError from 'http-errors'
// import { PhotoUpdate } from '../models/PhotoUpdate'

// TODO: Implement businessLogic
const photoAccess =  new PhotoAccess()
const attachment =  new AttachmentUtils()
const logger = createLogger('photoLogic')
const convertWithUrl = (item: PhotoItem)=>{
  if (item.attachmentUrl) {
    const attachmentUrl = attachment.getGetUrl(item.attachmentUrl)
    return {...item,attachmentUrl}
  }
  return item
}
export async function getPhotosForUser(userId): Promise<PhotoItem[]> {
    logger.info(`get Photos For User`)
    const items =  await (await photoAccess.getPhotosForUser(userId)).map(convertWithUrl)
    return items
  }

async function getPhoto(photoId: string, userId: string) {
  const photo = await photoAccess.getPhotoItem(photoId, userId)
  if (!photo) {
    throw new Error("Access denied")
  }
  return photo
}
  
export async function createPhoto(
  createPhotoRequest: CreatePhotoRequest,
  userId: string
): Promise<PhotoItem> {
  logger.info(`create Photos`)
  const photoId = uuid.v4()

  return await photoAccess.createPhoto({
    photoId,
    userId,
    name: createPhotoRequest.name,
    dueDate: createPhotoRequest.dueDate,
    createdAt: new Date().toISOString(),
    sharing:false
  })
}

export async function updatePhoto(
  updatePhotoRequest: UpdatePhotoRequest,
  photoUpdateId:string,
  userId: string
){
  logger.info(`update Photos`)
  await getPhoto(photoUpdateId,userId)

  return await photoAccess.updatePhoto(photoUpdateId,userId,updatePhotoRequest)
}

export async function deletePhoto(
  photoDeleteId:string,
  userId: string
){
  logger.info(`delete Photos`)
  try {
    const photo = await getPhoto(photoDeleteId,userId)  
    await photoAccess.deletePhoto(photoDeleteId, userId)
    await attachment.deleteImg(photo.attachmentUrl)
  return photo
  } catch (error) {
    
  }
  
}

export async function createAttachmentPresignedUrl(
  photoId:string,
  userId: string
){
  logger.info(`create Url`)
  const photo = await getPhoto(photoId,userId)
  const imageId = photo.attachmentUrl || uuid.v4()
  const uploadUrl = attachment.getPutSignedUrl(imageId)
  await photoAccess.updateAttachmentUrl(photoId, userId, imageId)
  return uploadUrl
}