import { BskyAgent } from '@atproto/api'
import { AuthSession, getAuthenticatedAgent } from './auth'

const BSKY_SERVICE = 'https://bsky.social'

export interface BackupProgress {
  status: string
  progress?: number
  total?: number
}

export async function backupAccount(
  session: AuthSession,
  onProgress?: (progress: BackupProgress) => void
) {
  try {
    // Get authenticated agent
    const agent = await getAuthenticatedAgent(session)
    const did = session.did
    
    // Step 2: Download repository data
    onProgress?.({ status: 'Downloading repository data...' })
    const repoUrl = `${BSKY_SERVICE}/xrpc/com.atproto.sync.getRepo?did=${did}`
    const repoResp = await fetch(repoUrl, {
      headers: {
        'Authorization': `Bearer ${session.accessJwt}`
      }
    })
    const repoBlob = await repoResp.blob()
    
    // Step 3: Get list of blobs (media files)
    onProgress?.({ status: 'Getting list of media files...' })
    const blobsUrl = `${BSKY_SERVICE}/xrpc/com.atproto.sync.listBlobs?did=${did}`
    const blobsResp = await fetch(blobsUrl, {
        headers: {
          'Authorization': `Bearer ${session.accessJwt}`
      }
    })
    const blobsList = await blobsResp.json()
    
    // Step 4: Download each blob
    const blobs: { [key: string]: Blob } = {}
    let downloaded = 0
    
    for (const cid of blobsList.cids) {
      onProgress?.({ 
        status: 'Downloading media files...', 
        progress: downloaded,
        total: blobsList.cids.length 
      })
      
      const blobUrl = `${BSKY_SERVICE}/xrpc/com.atproto.sync.getBlob?did=${did}&cid=${cid}`
      const blobResp = await fetch(blobUrl, {
        headers: {
          'Authorization': `Bearer ${session.accessJwt}`
        }
      })
      blobs[cid] = await blobResp.blob()
      downloaded++
    }

    // Step 5: Package everything into a single blob for download
    const backup = {
      meta: {
        handle: session.handle,
        did,
        timestamp: new Date().toISOString()
      },
      repo: repoBlob,
      blobs
    }

    onProgress?.({ status: 'Preparing download...' })
    
    // Convert to JSON and create downloadable blob
    const backupBlob = new Blob([JSON.stringify(backup)], {
      type: 'application/json'
    })

    // Create download URL
    const downloadUrl = URL.createObjectURL(backupBlob)
    
    return {
      url: downloadUrl,
      filename: `${session.handle}-backup-${new Date().toISOString()}.json`
    }

  } catch (error) {
    console.error('Backup failed:', error)
    throw error
  }
} 