'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export default function Home () {
  const [blueskyAccount, setBlueskyAccount] = useState('')
  const [email, setEmail] = useState('')

  const handleBackup = async () => {
    console.log('Backing up data for:', blueskyAccount, 'Email:', email)
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-8'>
      <main className='flex flex-col items-center gap-8 w-full max-w-md'>
        <h1 className='text-4xl font-bold text-center'>Blueup</h1>

        <div className='flex flex-col gap-4 w-full'>
          <div className='flex flex-col gap-2'>
            <label htmlFor='bluesky-account' className='text-sm font-medium'>
              Bluesky Account
            </label>
            <Input
              id='bluesky-account'
              placeholder='Enter your Bluesky account'
              value={blueskyAccount}
              onChange={e => setBlueskyAccount(e.target.value)}
            />
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

          <Button className='w-full' onClick={handleBackup}>
            Start Backup
          </Button>
        </div>
      </main>
    </div>
  )
}
