import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../helpers/photos'
import { getUserId, Responses } from '../utils'
import {createLogger} from '../../utils/logger'
const logger = createLogger('updatePhoto')

const uploadUrlHandler =
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Event: ${event}`)
    const userId = getUserId(event)
    const photoId = event.pathParameters.photoId
    const uploadUrl = await createAttachmentPresignedUrl(photoId, userId) 
    if (!uploadUrl) {
      logger.info(`Event fail`)
      return Responses._404({ message: 'Failed to delete photo' })
    }
    logger.info(`Event success`)
    return Responses._200( {uploadUrl} )
  }
export const handler = middy(uploadUrlHandler)
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
