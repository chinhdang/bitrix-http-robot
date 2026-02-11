import { reactive } from 'vue'

interface B24Auth {
  domain: string
  authId: string
  refreshId: string
  memberId: string
  lang: string
}

const auth = reactive<B24Auth>({
  domain: '',
  authId: '',
  refreshId: '',
  memberId: '',
  lang: 'en'
})

export function useB24Auth() {
  // Read from window.__B24_AUTH__ injected by server
  const w = window as any
  if (w.__B24_AUTH__ && !auth.memberId) {
    Object.assign(auth, w.__B24_AUTH__)
  }
  return auth
}
