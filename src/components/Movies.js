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
import SimpleModal from './modal.js'

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
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    border: 'solid #383D3F 1px',
    'border-radius': '10px',
    'background-color': '#181A1B',
    '&:hover': {
      'cursor': 'pointer',
      'border': '5px white solid',
    }
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
    height: '100%',
    // 'background-size': 'contain',
    'background-color': '#1C1E1F',
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
    height: '10%',
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
      items: []
    }
  }

  componentDidMount() {
    this.getMovies()
  }

  getMovies = () => {
    fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.REACT_APP_TMDB_API_KEY}&region=us&page=${this.state.page}`)
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
    console.log(items)
    if (!items.length) {
      this.setState({ hasMore: false })
    }
    items = items.filter((item) => item.poster_path)
    items.map((movie) => {
      let date = new Date(movie.release_date)
      movie.release_date = date.getFullYear()
    })

    let newState = {
      items: this.state.items.concat(items),
    }
    if (this.state.page == 1) {
      newState.isLoaded = true
    }
    newState.page = this.state.page + 1
    this.setState(newState)
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
                        <Card className={classes.card}>
                          <CardMedia
                            className={classes.cardMedia}
                            image={`https://image.tmdb.org/t/p/original${movie.poster_path}`}
                            title={movie.title}
                          />
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
        </main>
      )
    }
  }
}

export default withStyles(useStyles)(Movies)