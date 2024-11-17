'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { backupAccount, BackupProgress } from '@/lib/backup'
import { loginWithBluesky, AuthSession } from '@/lib/auth'

const create = import('@/components/w3upWrap')

export default function Home () {
  const [blueskyAccount, setBlueskyAccount] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [progress, setProgress] = useState<BackupProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [uploadStatus, setUploadStatus] = useState<string>('')

  const handleLogin = async () => {
    try {
      setError(null)
      const authSession = await loginWithBluesky(blueskyAccount, password)
      setSession(authSession)
      setPassword('') // Clear password after successful login
    } catch (err) {
      console.error('Login failed:', err)
      setError('Login failed. Please check your credentials.')
    }
  }

  const handleBackup = async () => {
    if (!session) {
      setError('Please login first')
      return
    }

    try {
      setError(null)
      setProgress({ status: 'Starting backup...' })

      const backup = await backupAccount(session, progress => {
        setProgress(progress)
      })

      setProgress({ status: 'Initializing storage...' })
      const { default: createClient } = await create
      const client = await createClient()

      if (!email.includes('@')) {
        throw new Error('Invalid email format')
      }
      const account = await client.login(email as `${string}@${string}`)

      //const space = await client.createSpace('bluesky-backup',)
      const spaces = await client.spaces()
      let space

      if (spaces.length === 0) {
        // If no space exists, create a new one
        space = await client.createSpace('default-space')
        console.log('Space created:', space.did())
        await client.addSpace(await space.createAuthorization(account))
        client.setCurrentSpace(space.did())
      } else {
        // Use the first available space
        space = spaces[0]
        console.log('Using existing space:', space.did())
        await client.setCurrentSpace(space.did())
      }

      const blob = new Blob([JSON.stringify(backup)], {
        type: 'application/json'
      })
      const file = new File([blob], `bluesky-backup-${session.handle}.json`, {
        type: 'application/json'
      })

      setProgress({ status: 'Uploading to Storacha...' })
      const cid = await client.uploadFile(file)

      setUploadStatus(`Backup stored with CID: ${cid}`)
      setProgress({ status: 'Backup complete!' })
    } catch (err) {
      console.error('Backup failed:', err)
      setError('Backup failed. Please check your account and try again.')
      setProgress(null)
    }
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-8'>
      <main className='flex flex-col items-center gap-8 w-full max-w-md'>
        <h1 className='text-4xl font-bold text-center'>Blueup</h1>

        <div className='flex flex-col gap-4 w-full'>
          {!session ? (
            <>
              <div className='flex flex-col gap-2'>
                <label
                  htmlFor='bluesky-account'
                  className='text-sm font-medium'
                >
                  Bluesky Account
                </label>
                <Input
                  id='bluesky-account'
                  placeholder='Enter your Bluesky handle'
                  value={blueskyAccount}
                  onChange={e => setBlueskyAccount(e.target.value)}
                />
              </div>

              <div className='flex flex-col gap-2'>
                <label htmlFor='password' className='text-sm font-medium'>
                  Password
                </label>
                <Input
                  id='password'
                  type='password'
                  placeholder='Enter your password'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>

              <Button
                className='w-full'
                onClick={handleLogin}
                disabled={!blueskyAccount || !password}
              >
                Login
              </Button>
            </>
          ) : (
            <>
              <div className='text-center mb-4'>
                Logged in as <span className='font-bold'>{session.handle}</span>
              </div>

              <div className='flex flex-col gap-2'>
                <label htmlFor='email' className='text-sm font-medium'>
                  Email Address
                </label>
                <Input
                  id='email'
                  type='email'
                  placeholder='Enter your email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>

              <Button
                className='w-full'
                onClick={handleBackup}
                disabled={!email || !!progress}
              >
                {progress ? progress.status : 'Start Backup'}
              </Button>

              <Button
                className='w-full'
                variant='outline'
                onClick={() => setSession(null)}
              >
                Logout
              </Button>
            </>
          )}

          {progress?.progress !== undefined && progress?.total !== undefined && (
            <div className='text-sm text-center'>
              Downloading media: {progress.progress} of {progress.total}
            </div>
          )}

          {uploadStatus && (
            <div className='text-sm text-green-500 text-center mt-2'>
              {uploadStatus}
            </div>
          )}

          {error && (
            <div className='text-sm text-red-500 text-center'>{error}</div>
          )}
        </div>
      </main>
    </div>
  )
}
