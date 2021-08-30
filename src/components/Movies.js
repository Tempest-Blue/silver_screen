import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { ImageList, ImageListItem } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';


const useStyles = theme => ({
  icon: {
    marginRight: theme.spacing(2),
  },
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    paddingTop: '56.25%', // 16:9
    'background-size': 'contain',
  },
  cardContent: {
    flexGrow: 1,
  },
  img: {
    height: '100%',
    width: 'auto',
  },
});

class Movies extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

  }

  componentDidMount() {
    fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${process.env.REACT_APP_TMDB_API_KEY}&region=us`)
      .then(res => res.json())
      .then(
        (response) => {
          console.log(response)
          this.setState({
            isLoaded: true,
            items: response.results
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  render() {
    const { classes } = this.props;
    const { error, isLoaded, items } = this.state;
    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
      return <div>Loading...</div>;
    } else {
      return (
        <React.Fragment>
          <main>
            <Container className={classes.cardGrid} maxWidth="lg">
              <ImageList rowHeight={300} className={classes.imageList} cols={5} gap={20}>
                {items.map((item) => (
                  <ImageListItem key={item.img} cols={item.cols || 1}>
                    <img src={`https://image.tmdb.org/t/p/original/${item.poster_path}`} alt={item.title} className={classes.img} />
                  </ImageListItem>
                  
                ))}
              </ImageList>
              {/* {<Grid container spacing={4}>
                {items.map((item) => (
                  <Grid item key={item} xs={12} sm={6} md={4} lg={2}>
                    <Card className={classes.card}>
                      <CardMedia
                        className={classes.cardMedia}
                        image={`https://image.tmdb.org/t/p/original/${item.poster_path}`}
                        title="Image title"
                      />
                      <CardContent className={classes.cardContent}>
                        <Typography gutterBottom>
                          {item.original_title}
                        </Typography>
                        {<Typography variant="body2" color="textSecondary">
                          {item.overview}
                        </Typography>}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>} */}
            </Container>
          </main>
        </React.Fragment>
      )
    }
  }
}

export default withStyles(useStyles)(Movies);