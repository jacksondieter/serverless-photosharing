import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getPhotosForUser as getPhotosForUser } from '../../helpers/photos'
import { getUserId, Responses } from '../utils';
import {createLogger} from '../../utils/logger'
const logger = createLogger('getPhoto')

const getPhotosHandler =
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info(`Event: ${event}`)
    const userId = getUserId(event)
    const items = await getPhotosForUser(userId)
    if (!items) {
      logger.info(`Event fail`)
      return Responses._404({ message: 'Failed to get photos' })
    }
    logger.info(`Event success`)
    return Responses._200({ items })
  }

export const handler = middy(getPhotosHandler)
    .use(httpErrorHandler())
    .use(
      cors({
        credentials: true
      })
    )
