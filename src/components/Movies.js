import React from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import CssBaseline from '@material-ui/core/CssBaseline'
import InfiniteScroll from "react-infinite-scroll-component"
import Fade from 'react-reveal/Fade'
import youtube from '../images/youtube.png'
import rotten_tomatoes from '../images/rotten_tomatoes.svg'
import * as AWS from 'aws-sdk'

const useStyles = theme => ({
  main: {
    display: 'flex',
    'background-color': '#181A1B',
  },
  movieGrid: {
    'margin-top': '20px',
    '& .MuiGrid-grid-xs-3': {
      'flex-basis': '20%',
    }
  },
  gridItem: {
    'height': '600px',
    [theme.breakpoints.up('lg')]: {
      'flex-basis': '20%',
    },
    [theme.breakpoints.up('xl')]: {
      'flex-basis': '14%',
    },
  },
  card: {
    'height': '100%',
    'display': 'flex',
    'flexDirection': 'column',
    'border': 'solid #383D3F 1px',
    'border-radius': '10px',
    'background-color': '#181A1B',
    '&:hover': {
      'border': '5px white solid',
    }
  },
  cardMedia: {
    'paddingTop': '56.25%', // 16:9
    'height': '100%',
    'background-color': '#1C1E1F',
  },
  hovering: {
    'height': '100%',
    'width': '100%',
    'display': 'grid',
    'place-items': 'center',
    'grid-template': '\'inner-div\'',
  },
  hoverImg: {
    'height': '105%',
    'width': '100%',
    'opacity': '20%',
    'background-size': 'cover',
    'grid-area': 'inner-div'
  },
  hoverLinks: {
    'grid-area': 'inner-div',
    'display': 'flex',
    'justify-content': 'center',
    'align-items': 'center',
    'flex-direction': 'column',

    '& img': {
      'height': 'auto',
      'width': '50%',
      'cursor': 'pointer',
      'z-index': '100',
      'margin': '10px',
    }
  },
  cardContent: {
    // flexGrow: 1,
    'background-color': '#1C1E1F',
    'color': '#E8E6E3',
    'max-height': '16%',
  },
  movieTitle: {
    'line-height': '1.4',
    'max-height': '75%',
  },
  label: {
    'height': '10%',
    'font-family': 'Open Sans Regular,Helvetica Neue,Helvetica,Arial,sans-serif',
  },
  infiniteScroll: {
    'margin': '0 20px',
    'overflow': 'hidden !important',
  }
})

class Movies extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      page: 1,
      items: [],
      opened: false,
      youtube_api_key: null,
      tmdb_api_key: null,
    }
  }

  async componentDidMount() {
    await this.loadAWS()
    this.getMovies()
    this.loadYoutubeAPI()
  }

  loadAWS = async () => {
    const configuration = {
      region: 'us-west-1',
      secretAccessKey: process.env.REACT_APP_SECRET_ACCESS_KEY,
      accessKeyId: process.env.REACT_APP_ACCESS_KEY_ID,
    }
    AWS.config.update(configuration)
    const keys = await this.scanTable('api_keys')
    const newState = {
      youtube_api_key: keys.find((key) => key.id.toLowerCase().includes('youtube')).value,
      tmdb_api_key: keys.find((key) => key.id.toLowerCase().includes('tmdb')).value
    }
    this.setState(newState)
  }

  scanTable = async (tableName) => {
    var docClient = new AWS.DynamoDB.DocumentClient();

    const params = {
      TableName: tableName,
    }

    const scanResults = []
    let items
    do {
      items = await docClient.scan(params).promise()
      items.Items.forEach((item) => scanResults.push(item))
      params.ExclusiveStartKey = items.LastEvaluatedKey
    } while (typeof items.LastEvaluatedKey !== "undefined")

    return scanResults
  }

  loadYoutubeAPI = () => {
    const api_key = this.state.youtube_api_key
    function start() {
      // 2. Initialize the JavaScript client library.
      window.gapi.client.setApiKey(api_key);
      return window.gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
        .then(function () { console.log("GAPI client loaded for API"); },
          function (err) { console.error("Error loading GAPI client for API", err); });
    };
    // 1. Load the JavaScript client library.
    window.gapi.load('client', start);
  }

  getMovies = () => {
    fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${this.state.tmdb_api_key}&region=us&page=${this.state.page}`)
      .then(res => res.json())
      .then(
        (response) => this.updateMovieList(response),
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            error
          })
        }
      )
  }

  updateMovieList = (response) => {
    let items = response.results
    // console.log(items)
    if (!items.length) {
      this.setState({ hasMore: false })
    }
    items = items.filter((item) => item.poster_path)
    items.map((movie) => {
      let date = new Date(movie.release_date)
      movie.release_date = date.getFullYear()
      return []
    })

    let newState = {
      items: this.state.items.concat(items),
    }
    if (this.state.page === 1) {
      newState.isLoaded = true
    }
    newState.page = this.state.page + 1
    this.setState(newState)
  }

  openInNewTab = (url) => {
    const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
    if (newWindow) newWindow.opener = null
  }

  openYoutubeInNewTab = (movie_title) => {
    window.gapi.client.youtube.search.list({
      "part": "snippet",
      "maxResults": 1,
      "q": `${movie_title} + trailer`,
      "type": "video",
    })
      .then(function (response) {
        // Handle the results here (response.result has the parsed body).
        // console.log("Response", response);
        const video_id = response.result.items[0].id.videoId
        const url = `https://www.youtube.com/watch?v=${video_id}`
        const newWindow = window.open(url, '_blank', 'noopener,noreferrer')
        if (newWindow) newWindow.opener = null
      },
        function (err) { console.error("Execute error", err); });
  }

  render() {
    const { classes } = this.props
    const { error, isLoaded, items } = this.state
    if (error) {
      return <div>Error: {error.message}</div>
    } else if (!isLoaded) {
      return <div>Loading...</div>
    } else {
      return (
        <main className={classes.main}>
          <CssBaseline />
          {/* <SimpleModal /> */}
          <Grid container>
            {/* <Grid item xs={2}>...</Grid> */}
            <Grid item xs>
              <InfiniteScroll
                dataLength={this.state.items.length}
                next={this.getMovies}
                hasMore={true}
                className={classes.infiniteScroll}>
                <Fade big>
                  <Grid className={classes.movieGrid} spacing={2} container>
                    {items.map((movie) => (
                      <Grid item key={movie.id} xs={12} sm={5} md={3} className={classes.gridItem}>
                        <Card
                          className={classes.card}
                          onMouseEnter={() => this.setState({ [`${movie.id}_opened`]: true })}
                          onMouseLeave={() => this.setState({ [`${movie.id}_opened`]: false })}>
                          {
                            !this.state[`${movie.id}_opened`] &&
                            <CardMedia
                              className={classes.cardMedia}
                              image={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
                              title={movie.title}
                            />
                          }
                          {
                            this.state[`${movie.id}_opened`] &&
                            <>
                              <div className={classes.hovering}>
                                <div className={classes.hoverImg} style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.poster_path})` }}></div>
                                <div className={classes.hoverLinks}>
                                  <img
                                    src={youtube}
                                    alt="Youtube"
                                    onClick={() => this.openYoutubeInNewTab(`${movie.title} ${movie.release_date}`)} />
                                  <img
                                    src={rotten_tomatoes}
                                    alt="Rotten Tomatoes"
                                    onClick={() => this.openInNewTab(`https://www.rottentomatoes.com/m/${movie.title.replaceAll(' ', '_').replace(/[^a-zA-Z0-9_]/g, '')}`)} />
                                </div>
                              </div>
                            </>
                          }
                          <CardContent className={classes.cardContent}>
                            <Typography gutterBottom variant="subtitle1" component="h2" className={classes.movieTitle}>
                              {movie.title}
                            </Typography>
                            <Typography variant="body1" component="h2">
                              {movie.release_date}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Fade>
              </InfiniteScroll>
            </Grid>
          </Grid>
        </main >
      )
    }
  }
}

export default withStyles(useStyles)(Movies)