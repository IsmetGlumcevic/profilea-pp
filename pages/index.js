import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { Amplify, Auth, Hub, Logger } from 'aws-amplify';

import awsconfig from '../src/aws-exports';
import { useEffect, useState } from 'react';
Amplify.configure({ ...awsconfig, ssr: true });
Amplify.Logger.LOG_LEVEL = 'DEBUG'

const logger = new Logger('My-Logger');

function Home() {
  const [user, setUser] = useState(null)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    const listener = (data) => {
      switch (data.payload.event) {
        case 'configured':
          logger.info('the Auth module is configured');
          break;
        case 'signIn':
          fetchUser()
          logger.info('user signed in');
          break;
        case 'signIn_failure':
          logger.error('user sign in failed');
          break;
        case 'signUp':
          logger.info('user signed up');
          break;
        case 'signUp_failure':
          logger.error('user sign up failed');
          break;
        case 'confirmSignUp':
          logger.info('user confirmation successful');
          break;
        case 'completeNewPassword_failure':
          logger.error('user did not complete new password flow');
          break;
        case 'autoSignIn':
          logger.info('auto sign in successful');
          break;
        case 'autoSignIn_failure':
          logger.error('auto sign in failed');
          break;
        case 'forgotPassword':
          logger.info('password recovery initiated');
          break;
        case 'forgotPassword_failure':
          logger.error('password recovery failed');
          break;
        case 'forgotPasswordSubmit':
          logger.info('password confirmation successful');
          break;
        case 'forgotPasswordSubmit_failure':
          logger.error('password confirmation failed');
          break;
        case 'tokenRefresh':
          logger.info('token refresh succeeded');
          break;
        case 'tokenRefresh_failure':
          logger.error('token refresh failed');
          break;
        case 'cognitoHostedUI':
          logger.info('Cognito Hosted UI sign in successful');
          break;
        case 'cognitoHostedUI_failure':
          logger.error('Cognito Hosted UI sign in failed');
          break;
        case 'customOAuthState':
          logger.info('custom state returned from CognitoHosted UI');
          break;
        case 'customState_failure':
          logger.error('custom state failure');
          break;
        case 'parsingCallbackUrl':
          logger.info('Cognito Hosted UI OAuth url parsing initiated');
          break;
        case 'userDeleted':
          logger.info('user deletion successful');
          break;
        case 'signOut':
          logger.info('user signed out');
          break;
      }
    };

    console.log('hub initiated')
    Hub.listen("auth", listener)

    fetchUser()
      .catch(err => { console.log(err) })
      .finally(() => {
        console.log('finish')
      })

    return () => {
      Hub.remove("auth", listener)
    }
  }, [])

  const signIn = async () => {
    Auth.signIn({
      username: username,
      password: password
    })
  }

  const handleLogout = async () => {
    await Auth.signOut()
    onLogout()
    console.log('signed out')
  }

  const onLogout = () => {
    console.log('On Logout called')
    setUser(null)
  }

  const fetchUser = async () => {
    let _user = await Auth.currentAuthenticatedUser()
    if (!_user) {
      handleLogout()
      return Promise.reject('Logged out')
    }
    setUser(_user)
    return Promise.resolve({
      _user
    })
  }


  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Auth page
        </h1>

        {user ? (
          <button onClick={handleLogout}>Sign out</button>
        ) : (
          <div style={{display: "flex", flexDirection: "column", gap: 20, marginTop: 50}}>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input type="text" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button onClick={signIn}>Sign in</button>
          </div>
        )}

      </main>

    </div>
  )
}

export default Home;
