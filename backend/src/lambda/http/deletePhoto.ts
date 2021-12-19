import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deletePhoto } from '../../businessLogic/photosLogic'
import { getUserId, Responses } from '../utils'
import {createLogger} from '../../utils/logger'
const logger = createLogger('updatePhoto')

const deletePhotoHandler =
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Event: ${event}`)
    const userId = getUserId(event)
    const photoId = event.pathParameters.photoId
    const item = await deletePhoto(photoId, userId)
    if (!item) {
      logger.info(`Event fail`)
      return Responses._404({ message: 'Failed to delete photo' })
    }
    logger.info(`Event success`)
    return Responses._200({ photo: item })
  }
export const handler = middy(deletePhotoHandler)
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
