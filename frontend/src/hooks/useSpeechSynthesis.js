// frontend/src/hooks/useSpeechSynthesis.js
import { useState, useCallback, useEffect } from 'react'

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(null)

  // Carregar vozes disponíveis
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices()
      setVoices(availableVoices)
      // Selecionar voz em português se disponível
      const ptVoice = availableVoices.find(v => v.lang === 'pt-BR' || v.lang === 'pt')
      setSelectedVoice(ptVoice || availableVoices[0])
    }

    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  const speak = useCallback((texto, onEnd) => {
    if (!texto || texto.trim() === '') {
      console.log('Nenhum texto para ler')
      return
    }

    // Parar qualquer leitura em andamento
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(texto)
    
    // Configurar voz
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }
    
    // Configurar idioma
    utterance.lang = 'pt-BR'
    
    // Velocidade e tom
    utterance.rate = 0.9
    utterance.pitch = 1.0
    
    // Eventos
    utterance.onstart = () => {
      setIsSpeaking(true)
      console.log('🔊 Iniciando leitura...')
    }
    
    utterance.onend = () => {
      setIsSpeaking(false)
      console.log('✅ Leitura finalizada')
      if (onEnd) onEnd()
    }
    
    utterance.onerror = (event) => {
      console.error('❌ Erro na leitura:', event)
      setIsSpeaking(false)
    }
    
    window.speechSynthesis.speak(utterance)
  }, [selectedVoice])

  const pause = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause()
      setIsSpeaking(false)
    }
  }, [])

  const resume = useCallback(() => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
      setIsSpeaking(true)
    }
  }, [])

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  return {
    isSpeaking,
    speak,
    pause,
    resume,
    stop,
    voices,
    selectedVoice
  }
}