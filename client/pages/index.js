import buildClient from '../api/build-client';

const Landing = ({ currentUser }) => {
  return currentUser 
    ?
      <h1>
        You are signed in
      </h1> 
    :
      <h1>
        You are NOT signed in
      </h1>
}

Landing.getInitialProps = async (context) => {
  const client = buildClient(context);
  const response = await client.get('/api/users/currentuser');
  return response.data;
}

export default Landing;