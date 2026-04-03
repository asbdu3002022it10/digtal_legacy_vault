import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import client from '@api/client'
import { SecurityLock } from '@components/SecurityLock'

export function NomineeAccept() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    async function accept() {
      try {
        const { data } = await client.post(`/nominee/accept/${token}`)
        setMessage(data.message)
        setStatus('success')
      } catch (err: any) {
        setMessage(err?.response?.data?.detail ?? 'Invalid or expired invitation link.')
        setStatus('error')
      }
    }
    if (token) accept()
  }, [token])

  return (
    <div className="min-h-screen bg-[#060b14] flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl border border-slate-800 bg-[#0f1621]/90 p-8 text-center shadow-2xl shadow-emerald-500/5">
        <div className="flex justify-center mb-6">
          <SecurityLock />
        </div>
        <h1 className="text-xl font-bold text-slate-100 mb-2">
          Digital Legacy Vault
        </h1>

        {status === 'loading' && (
          <>
            <div className="animate-spin text-4xl my-6">⏳</div>
            <p className="text-slate-400 text-sm">Verifying your invitation…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-5xl my-6">✅</div>
            <p className="text-emerald-400 font-semibold text-sm mb-2">Invitation Accepted!</p>
            <p className="text-slate-400 text-xs leading-relaxed">{message}</p>
            <p className="text-slate-500 text-xs mt-4">
              You will receive access to the vault items only when the owner has been inactive
              for a prolonged period. You will be notified by email.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-5xl my-6">❌</div>
            <p className="text-red-400 font-semibold text-sm mb-2">Error</p>
            <p className="text-slate-400 text-xs">{message}</p>
          </>
        )}

        <button
          onClick={() => navigate('/login')}
          className="mt-6 text-xs text-emerald-500 hover:text-emerald-400 underline"
        >
          Go to Login
        </button>
      </div>
    </div>
  )
}
