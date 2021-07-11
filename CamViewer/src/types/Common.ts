export interface CamFeedProps {
  host: string // host:port
  creds: string // user:pw
  id: number,
  height: number,
  width: number,
  stream_type?: string
}
