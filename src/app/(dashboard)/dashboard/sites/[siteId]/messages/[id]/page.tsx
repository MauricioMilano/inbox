'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, Check, Archive, Trash2, Globe, Monitor, Calendar, MapPin } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Message {
  id: string
  status: string
  senderName: string | null
  senderEmail: string | null
  senderPhone: string | null
  subject: string | null
  content: string | null
  metadata: string | null
  createdAt: string
}

export default function MessageDetailPage({ params }: { params: Promise<{ siteId: string; id: string }> }) {
  const { id, siteId } = use(params)
  const [message, setMessage] = useState<Message | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMessage()
  }, [id])

  async function loadMessage() {
    try {
      const res = await fetch(`/api/messages/${id}`)
      if (res.ok) {
        const data = await res.json()
        setMessage(data.message)
      }
    } catch (error) {
      console.error('Failed to load message:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(status: string) {
    if (!message) return

    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (res.ok) {
        setMessage({ ...message, status })
      }
    } catch (error) {
      console.error('Failed to update message:', error)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (!message) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Mensagem não encontrada</h2>
        <Link href={`/dashboard/sites/${siteId}/messages`} className="btn btn-primary">
          Voltar
        </Link>
      </div>
    )
  }

  const metadata = message.metadata ? JSON.parse(message.metadata) : {}

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/dashboard/sites/${siteId}/messages`}
          className="btn btn-ghost p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold truncate">
            {message.senderName || 'Mensagem'}
          </h1>
          <p className="text-sm text-slate-500">
            Recebida em {formatDate(message.createdAt)}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="grid gap-6">
        {/* Message content */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">📩</span>
            <h2 className="font-semibold">Mensagem</h2>
            {message.status === 'nova' && (
              <span className="badge badge-primary">Nova</span>
            )}
          </div>

          <div className="space-y-4">
            {message.senderName && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <span className="text-sm text-slate-500">Nome:</span>
                <span className="sm:col-span-2 font-medium">{message.senderName}</span>
              </div>
            )}

            {message.senderEmail && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <span className="text-sm text-slate-500">Email:</span>
                <a
                  href={`mailto:${message.senderEmail}`}
                  className="sm:col-span-2 text-blue-600 hover:underline"
                >
                  {message.senderEmail}
                </a>
              </div>
            )}

            {message.senderPhone && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <span className="text-sm text-slate-500">Telefone:</span>
                <a
                  href={`tel:${message.senderPhone}`}
                  className="sm:col-span-2 text-blue-600 hover:underline"
                >
                  {message.senderPhone}
                </a>
              </div>
            )}

            {message.subject && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <span className="text-sm text-slate-500">Assunto:</span>
                <span className="sm:col-span-2 font-medium">{message.subject}</span>
              </div>
            )}

            {message.content && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                  {message.content}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Technical details */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🔧</span>
            <h2 className="font-semibold">Detalhes técnicos</h2>
          </div>

          <div className="grid gap-3 text-sm">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-slate-500">Recebido:</span>
              <span>{formatDate(message.createdAt)}</span>
            </div>

            {metadata.ip && (
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">IP:</span>
                <span>{metadata.ip}</span>
              </div>
            )}

            {metadata.userAgent && (
              <div className="flex items-center gap-3">
                <Monitor className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">Navegador:</span>
                <span className="truncate">{metadata.userAgent}</span>
              </div>
            )}

            {metadata.referer && (
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-slate-400" />
                <span className="text-slate-500">Página:</span>
                <a
                  href={metadata.referer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate"
                >
                  {metadata.referer}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="card">
          <h3 className="font-semibold mb-4">Ações</h3>
          <div className="flex flex-wrap gap-3">
            {message.status === 'nova' && (
              <button
                onClick={() => updateStatus('lida')}
                className="btn btn-secondary"
              >
                <Check className="h-4 w-4" />
                Marcar como lida
              </button>
            )}

            {message.senderEmail && (
              <a
                href={`mailto:${message.senderEmail}${message.subject ? `?subject=Re: ${message.subject}` : ''}`}
                className="btn btn-primary"
              >
                <Mail className="h-4 w-4" />
                Responder por email
              </a>
            )}

            {message.status !== 'respondida' && (
              <button
                onClick={() => updateStatus('respondida')}
                className="btn btn-secondary"
              >
                <Check className="h-4 w-4" />
                Marcar como respondida
              </button>
            )}

            {message.status !== 'arquivada' && (
              <button
                onClick={() => updateStatus('arquivada')}
                className="btn btn-secondary"
              >
                <Archive className="h-4 w-4" />
                Arquivar
              </button>
            )}

            {message.status !== 'spam' && (
              <button
                onClick={() => updateStatus('spam')}
                className="btn btn-ghost text-red-500 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Marcar como spam
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
