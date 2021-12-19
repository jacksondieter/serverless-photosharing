import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { CreatePhotoRequest } from '../../requests/CreatePhotoRequest'
import { getUserId, Responses } from '../utils';
import { createPhoto } from '../../businessLogic/photosLogic'
import {createLogger} from '../../utils/logger'
const logger = createLogger('createPhoto')

const createPhotoHandler =
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Event: ${event}`)
    const userId = getUserId(event)
    const newPhoto: CreatePhotoRequest = JSON.parse(event.body)
    const item = await createPhoto(newPhoto,userId)
    if (!item) {
      logger.info(`Event fail`)
      return Responses._404({ message: 'Failed to create photo' })
    }
    logger.info(`Event success`)
    return Responses._201({item})
  }
export const handler = middy(createPhotoHandler)
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
