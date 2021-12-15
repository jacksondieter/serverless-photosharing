import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { updatePhoto } from '../../helpers/photos'
import { UpdatePhotoRequest } from '../../requests/UpdatePhotoRequest'
import { getUserId, Responses } from '../utils'
import {createLogger} from '../../utils/logger'
const logger = createLogger('updatePhoto')

const updatePhotoHandler =
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Event: ${event}`)
    const userId = getUserId(event)
    const photoId = event.pathParameters.photoId
    const updatedPhoto: UpdatePhotoRequest = JSON.parse(event.body)
    const photo = await updatePhoto(updatedPhoto, photoId, userId)
    if (!photo) {
      logger.info(`Event fail`)
      return Responses._404({ message: 'Failed to update photo' })
    }
    logger.info(`Event success`)
    return Responses._200({ photo })
  }
export const handler = middy(updatePhotoHandler)
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
