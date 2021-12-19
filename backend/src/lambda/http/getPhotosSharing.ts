import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getPhotosSharing } from '../../helpers/photos'
import { Responses } from '../utils';
import {createLogger} from '../../utils/logger'
const logger = createLogger('getPhotoSharing')

const getPhotosSharingHandler =
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Event: ${event}`)
    const items =  await getPhotosSharing()
    if (!items) {
      logger.info(`Event fail`)
      return Responses._404({ message: 'Failed to get photos' })
    }
    logger.info(`Event success`)
    return Responses._200({ items })
  }

export const handler = middy(getPhotosSharingHandler)
    .use(httpErrorHandler())
    .use(
      cors({
        credentials: true
      })
    )
