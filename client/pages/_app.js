import 'bootstrap/dist/css/bootstrap.css';
import buildClient from '../api/build-client';
import Header from '../components/header';

const App =  ({ Component, pageProps, currentUser })=> {
  return (
		<div>
			<Header currentUser={currentUser} />
			 <Component {...pageProps} />
		</div>
	);
}

App.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx);
  const response = await client.get('/api/users/currentuser');
  let pageProps ={};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(appContext.ctx);
  }
  console.log(pageProps);
  return {
    pageProps,
    currentUser: response.data.currentUser
  }
}

export default App;