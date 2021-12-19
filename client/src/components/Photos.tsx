import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import {
  createPhoto,
  deletePhoto,
  getPhotos,
  patchPhoto
} from '../api/photos-api'
import Auth from '../auth/Auth'
import { Photo } from '../types/Photo'

interface PhotosProps {
  auth: Auth
  history: History
}

interface PhotosState {
  photos: Photo[]
  newPhotoName: string
  loadingPhotos: boolean
}

export class Photos extends React.PureComponent<PhotosProps, PhotosState> {
  state: PhotosState = {
    photos: [],
    newPhotoName: '',
    loadingPhotos: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPhotoName: event.target.value })
  }

  onEditButtonClick = (photoId: string) => {
    this.props.history.push(`/photos/${photoId}/edit`)
  }

  onPhotoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newPhoto = await createPhoto(this.props.auth.getIdToken(), {
        name: this.state.newPhotoName,
        dueDate
      })
      this.setState({
        photos: [...this.state.photos, newPhoto],
        newPhotoName: ''
      })
    } catch {
      alert('Photo creation failed')
    }
  }

  onPhotoDelete = async (photoId: string) => {
    try {
      await deletePhoto(this.props.auth.getIdToken(), photoId)
      this.setState({
        photos: this.state.photos.filter((photo) => photo.photoId !== photoId)
      })
    } catch {
      alert('Photo deletion failed')
    }
  }

  onPhotoCheck = async (pos: number) => {
    try {
      const photo = this.state.photos[pos]
      await patchPhoto(this.props.auth.getIdToken(), photo.photoId, {
        name: photo.name,
        dueDate: photo.dueDate,
        sharing: !photo.sharing
      })
      this.setState({
        photos: update(this.state.photos, {
          [pos]: { sharing: { $set: !photo.sharing } }
        })
      })
    } catch {
      alert('Photo deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const photos = await getPhotos(this.props.auth.getIdToken())
      this.setState({
        photos,
        loadingPhotos: false
      })
    } catch (e) {
      // @ts-ignore: Unreachable code error
      alert(`Failed to fetch photos: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">PHOTOs</Header>

        {this.renderCreatePhotoInput()}

        {this.renderPhotos()}
      </div>
    )
  }

  renderCreatePhotoInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New photo',
              onClick: this.onPhotoCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderPhotos() {
    if (this.state.loadingPhotos) {
      return this.renderLoading()
    }

    return this.renderPhotosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading PHOTOs
        </Loader>
      </Grid.Row>
    )
  }

  renderPhotosList() {
    return (
      <Grid padded>
        {this.state.photos.map((photo, pos) => {
          return (
            <Grid.Row key={photo.photoId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onPhotoCheck(pos)}
                  checked={photo.sharing}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {photo.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {photo.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(photo.photoId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onPhotoDelete(photo.photoId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {photo.attachmentUrl && (
                <Image src={photo.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
