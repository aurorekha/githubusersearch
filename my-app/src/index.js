import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { render } from 'react-dom';

class App extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      username: '',
      repos: [],
      forks: [],
      openIssues: [],
      followers: 0,
      ownerName: '',
      location: '',
      readMe: '',
      repo: [],
      notFound: false
    }
  }

  componentDidMount() {
    this.fetchApi()
  }

  fetchApi() {
    const ACCESS_TOKEN = '291b237a35a2c3c94db103a0a3619bd7bd795a36';
    const BASE_URL = `https://api.github.com/users/${this.state.username}`;
    const user = fetch(`${BASE_URL}?access_token=${ACCESS_TOKEN}`).then(res => res.json());
    const repos = fetch(`${BASE_URL}/repos`).then(res => res.json());
    const getReadme = fetch(`https://api.github.com/repos/${this.state.username}/${this.state.repo}/readme`);
    getReadme
    .then(res => res.json())
    .then(data => data);
    const getForks = fetch(`https://api.github.com/repos/${this.state.username}/${this.state.repo}/forks`);
    getForks
    .then(res => res.json())
    .then(data => data);

    Promise.all([user, repos])
      .then(([user, repos]) => {
        // update state with API data
        this.setState({
          repos: Array.isArray(repos) ? repos.map((value) => value.name) : [],
          location: user.location,
          followers: user.followers,
          ownerName: user.name,
          repo: Array.isArray(repos) ? repos.map((value) => value.name) : [],
          readme: Array.isArray(getReadme) ? getReadme.map((val) => val) : [],
        })
      })
      .catch((err) => {
        this.setState({
          notFound: true,
        })
        console.log('Try Again!')
        console.log(err)
      })
  }

  fetchUser(e) {
    e.preventDefault()
    this.setState({ notFound: false })
    this.fetchApi()
  }

  setUsername(event) {
    const username = event.target.value;
    this.setState((state) => Object.assign({}, state, { username }))
  }

  render() {
    return (
      <div className="container">
        <SearchBox
          username={this.state.username}
          onChange={this.setUsername.bind(this)}
          onSubmit={this.fetchUser.bind(this)}
        />
        <Card data={this.state} />
      </div>
    )
  }
}

const SearchBox = ({ username, onChange, onSubmit }) => (
  <form className="row col-12 searchbox" onSubmit={onSubmit}>
    <input
      className="form-control form-control-lg mx-sm-3 mb-2 searchbox__input col-7"
      type="text"
      placeholder="type username..."
      value={username}
      onChange={onChange}
    />
    <input type="submit" className="searchbox__button btn btn-primary btn-lg col-3" value="Search GitHub User" />
  </form>
)

const Card = ({ data }) => {
  if (data.ownerName === undefined && data.username !== '') {
    // when number of requests exceed...
    if(data.readMe.documentation_url === "https://developer.github.com/v3/#rate-limiting") {
      return (<h3 className="card__notfound">Number Of Requests exceeded. Try again later!</h3>)
    }
    // when username is not found...
    return (<h3 className="card__notfound">User not found, try again!</h3>);
  }
  data.repos.map((repoName) => {
    return (
      fetch(`https://api.github.com/repos/${data.username}/${repoName}/readme`)
      .then(res => res.json())
      .then(params => (params.content)))
  });
  data.repos.map((repoName) => {
    return (
      fetch(`https://api.github.com/repos/${data.username}/${repoName}/forks`)
      .then(res => res.json())
      .then(params => ((params, 'params')))
    )
  });
  // if username found, then...
  return (
    <div className="container">
      {data.repos.map((repoName, repo, idx, readme) => (
        <div key={idx} className="my-3 p-3 bg-white rounded shadow-sm">
          <div className="media-body pb-3 mb-0 small lh-125 border-bottom border-gray">
            <div className="row">
              <div className="col-md-8">
                <div className="card mb-12 shadow-sm">
                  <div className="card-body">
                    <strong className="d-block text-gray-dark">Repo Name</strong>
                    <h4>{repoName}</h4>
                    <strong className="d-block text-gray-dark">Readme file link</strong>
                    <a href={`https://api.github.com/repos/${data.username}/${repoName}/readme`}>{repoName}</a>
                    <strong className="d-block text-gray-dark">Number of Open Issues</strong>
                    <h4>{(data.openIssues).length > 0 ? data.openIssues.length : 0 }</h4>
                    <strong className="d-block text-gray-dark">Location</strong>
                    <h4>{data.location === null ? 'No mentioned location' : data.location }</h4>
                    <strong className="d-block text-gray-dark">Number of followers</strong>
                    <h4>{data.followers}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

render(<App />, document.getElementById('root'));
