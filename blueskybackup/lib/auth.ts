import { BskyAgent } from '@atproto/api'
import { BLUESKY_CONFIG } from './config'

export interface AuthSession {
  accessJwt: string
  refreshJwt: string
  handle: string
  did: string
  active: boolean
}

export async function loginWithBluesky(identifier: string, password: string): Promise<AuthSession> {
  const agent = new BskyAgent({ service: BLUESKY_CONFIG.service })
  
  const response = await agent.login({
    identifier,
    password,
  })

  return {
    accessJwt: response.data.accessJwt,
    refreshJwt: response.data.refreshJwt,
    handle: response.data.handle,
    did: response.data.did,
    active: true
  }
}

export async function getAuthenticatedAgent(session: AuthSession) {
  const agent = new BskyAgent({ service: BLUESKY_CONFIG.service })
  await agent.resumeSession(session)
  return agent
} 