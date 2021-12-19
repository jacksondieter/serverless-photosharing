// import * as AWS from 'aws-sdk'
import {XAWS as AWS}from './AWS'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { PhotoItem } from '../models/PhotoItem'
import { PhotoUpdate } from '../models/PhotoUpdate';

const logger = createLogger('PhotosAccess')

export class PhotoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly photosTable = process.env.PHOTOS_TABLE,
    private readonly photosIndexTable = process.env.PHOTOS_CREATED_AT_INDEX
    ) {
  }

  async getPhotosForUser(userId): Promise<PhotoItem[]> {
    logger.info(`Getting all photos for user:${userId}`)

    const result = await this.docClient.query({
      TableName: this.photosTable,
      IndexName: this.photosIndexTable,
      ExpressionAttributeValues: {':uid': userId},
      KeyConditionExpression: 'userId = :uid',        
    }).promise()

    return result.Items as PhotoItem[]
  }

  async getPhotosSharing(): Promise<PhotoItem[]> {
    logger.info(`Getting all shared photos`)

    const result = await this.docClient.scan({
      TableName: this.photosTable,
      FilterExpression: 'sharing = :s',
      ExpressionAttributeValues: {
        ":s": true
      }
    }).promise()

    return result.Items as PhotoItem[]
  }

  async createPhoto(photo: PhotoItem): Promise<PhotoItem> {
    logger.info(`Create photos`)
    await this.docClient.put({
      TableName: this.photosTable,
      Item: photo
    }).promise()

    return photo
  }

  async getPhotoItem(photoId: string, userId: string): Promise<PhotoItem> {
    logger.info(`Getting photo ${photoId} from ${this.photosTable}`)

    const result = await this.docClient.get({
      TableName: this.photosTable,
      Key: {
        photoId,
        userId
      }
    }).promise()

    return result.Item as PhotoItem

  }
  async updatePhoto(photoId: string, userId:string, photoUpdate:PhotoUpdate) {
    logger.info(`Update photos for photo:${photoId}`)
    logger.info(`Update ${photoUpdate}`)
    return await this.docClient.update({
        TableName: this.photosTable,
        Key: {
          photoId,
          userId
        },
        UpdateExpression: 'set sharing = :s',
        ExpressionAttributeValues: {
            ":s": photoUpdate.sharing
        }
    }).promise()
  }

  async deletePhoto(photoId: string, userId:string) {
    logger.info(`Delete photos for photo:${photoId}`)
      return await this.docClient.delete({
          TableName: this.photosTable,
          Key: {
            photoId,
            userId
          }
        }).promise()
  }  

  async updateAttachmentUrl(photoId: string, userId:string, imageId:string) {
    logger.info(`Update url for photo:${photoId}`)
    return await this.docClient.update({
        TableName: this.photosTable,
        Key: {
          photoId,
          userId
        },
        UpdateExpression: 'set attachmentUrl = :url',
        ExpressionAttributeValues: {
            ":url": imageId
        }
    }).promise()
  }
}
  
function createDynamoDBClient() {
  // @ts-ignore: Unreachable code error
  return new AWS.DynamoDB.DocumentClient()
}
