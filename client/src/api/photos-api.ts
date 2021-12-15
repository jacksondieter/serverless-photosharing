import { apiEndpoint } from '../config'
import { Photo } from '../types/Photo';
import { CreatePhotoRequest } from '../types/CreatePhotoRequest';
import Axios from 'axios'
import { UpdatePhotoRequest } from '../types/UpdatePhotoRequest';

export async function getPhotos(idToken: string): Promise<Photo[]> {
  console.log('Fetching photos')

  const response = await Axios.get(`${apiEndpoint}/photos`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Photos:', response.data)
  return response.data.items
}

export async function createPhoto(
  idToken: string,
  newPhoto: CreatePhotoRequest
): Promise<Photo> {
  const response = await Axios.post(`${apiEndpoint}/photos`,  JSON.stringify(newPhoto), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchPhoto(
  idToken: string,
  photoId: string,
  updatedPhoto: UpdatePhotoRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/photos/${photoId}`, JSON.stringify(updatedPhoto), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deletePhoto(
  idToken: string,
  photoId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/photos/${photoId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  photoId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/photos/${photoId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
