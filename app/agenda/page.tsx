"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Clock, User, Search } from "lucide-react"

interface Patient {
  id: string
  name: string
  cpf: string
  phone?: string
  email?: string
}

interface Profissional {
  id: string
  name: string
  specialty?: string
  workingDays: WorkingDay[]
}

interface WorkingDay {
  id: string
  dayOfWeek: number
  startTime: string
  endTime: string
}

interface Appointment {
  id: string
  date: string
  time: string
  status: string
  notes?: string
  patient: {
    id: string
    name: string
    phone?: string
    email?: string
  }
  profissional: {
    id: string
    name: string
    specialty?: string
  }
}

export default function AgendaPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [patients, setPatients] = useState<Patient[]>([])
  const [profissionals, setProfissionals] = useState<Profissional[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  // Estados do formulário
  const [selectedPatient, setSelectedPatient] = useState<string>('')
  const [selectedProfissional, setSelectedProfissional] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [patientSearch, setPatientSearch] = useState<string>('')

  // Buscar pacientes
  const fetchPatients = async (search: string = '') => {
    try {
      const url = search 
        ? `/api/patients?search=${encodeURIComponent(search)}`
        : '/api/patients'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setPatients(data)
      }
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error)
    }
  }

  // Buscar profissionais
  const fetchProfissionals = async () => {
    try {
      const response = await fetch('/api/profissionals')
      if (response.ok) {
        const data = await response.json()
        setProfissionals(data)
      }
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error)
    }
  }

  // Buscar agendamentos do dia
  const fetchAppointments = async (selectedDate: Date) => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0]
      const response = await fetch(`/api/appointments?date=${dateStr}`)
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
      }
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error)
    }
  }

  // Buscar horários disponíveis
  const fetchAvailableTimes = async (profissionalId: string, date: Date) => {
    try {
      const dateStr = date.toISOString().split('T')[0]
      console.log('Frontend - Buscando horários para:', { profissionalId, dateStr })
      const response = await fetch(`/api/appointments/available-times?profissionalId=${profissionalId}&date=${dateStr}`)
      
      console.log('Frontend - Response status:', response.status)
      
      if (!response.ok) {
        console.error('Frontend - Erro ao buscar horários:', response.statusText)
        setAvailableTimes([])
        return
      }
      
      const data = await response.json()
      console.log('Frontend - Dados completos recebidos:', data)
      console.log('Frontend - availableTimes array:', data.availableTimes)
      console.log('Frontend - Tipo de availableTimes:', typeof data.availableTimes)
      console.log('Frontend - Length de availableTimes:', data.availableTimes?.length)
      
      const times = data.availableTimes || []
      console.log('Frontend - Times que serão setados:', times)
      setAvailableTimes(times)
    } catch (error) {
      console.error('Erro ao buscar horários disponíveis:', error)
      setAvailableTimes([])
    }
  }

  // Verificar se o profissional trabalha no dia selecionado
  const isProfissionalAvailableOnDate = (profissional: Profissional, date: Date): boolean => {
    const dayOfWeek = date.getDay()
    return profissional.workingDays.some(day => day.dayOfWeek === dayOfWeek)
  }

  // Filtrar dias disponíveis para o calendário
  const getAvailableDates = (profissional: Profissional) => {
    if (!profissional.workingDays.length) return []
    
    const availableDays = profissional.workingDays.map(day => day.dayOfWeek)
    return availableDays
  }

  // Criar agendamento
  const handleCreateAppointment = async () => {
    if (!selectedPatient || !selectedProfissional || !selectedDate || !selectedTime) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientId: selectedPatient,
          profissionalId: selectedProfissional,
          date: selectedDate.toISOString().split('T')[0],
          time: selectedTime,
          notes: notes || undefined
        })
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Agendamento criado com sucesso"
        })
        setIsDialogOpen(false)
        resetForm()
        if (date) {
          fetchAppointments(date)
        }
      } else {
        const error = await response.json()
        toast({
          title: "Erro",
          description: error.error || "Erro ao criar agendamento",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar agendamento",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Resetar formulário
  const resetForm = () => {
    setSelectedPatient('')
    setSelectedProfissional('')
    setSelectedDate(undefined)
    setSelectedTime('')
    setNotes('')
    setPatientSearch('')
    setAvailableTimes([])
  }

  // Effects
  useEffect(() => {
    fetchPatients()
    fetchProfissionals()
  }, [])

  useEffect(() => {
    if (date) {
      fetchAppointments(date)
    }
  }, [date])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPatients(patientSearch)
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [patientSearch])

  useEffect(() => {
    if (selectedProfissional && selectedDate) {
      fetchAvailableTimes(selectedProfissional, selectedDate)
    } else {
      setAvailableTimes([])
    }
  }, [selectedProfissional, selectedDate])

  useEffect(() => {
    if (!selectedProfissional) {
      setSelectedDate(undefined)
      setSelectedTime('')
    }
  }, [selectedProfissional])

  useEffect(() => {
    if (!selectedDate) {
      setSelectedTime('')
    }
  }, [selectedDate])

  const selectedProfissionalData = profissionals.find(p => p.id === selectedProfissional)

  return (
    <div className="flex flex-col">
      

      <div className="flex-1 p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendário */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Calendário</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Novo Agendamento
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Novo Agendamento</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {/* Seleção de Paciente */}
                    <div className="grid gap-2">
                      <Label htmlFor="patient">Paciente</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="patient-search" 
                          placeholder="Buscar paciente por nome, CPF ou email..." 
                          value={patientSearch}
                          onChange={(e) => setPatientSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar paciente" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.length > 0 ? (
                            patients.map((patient) => (
                              <SelectItem key={patient.id} value={patient.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{patient.name}</span>
                                  <span className="text-sm text-muted-foreground">{patient.cpf}</span>
                                </div>
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                              {patientSearch ? 'Nenhum paciente encontrado' : 'Carregando pacientes...'}
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Seleção de Profissional */}
                    <div className="grid gap-2">
                      <Label htmlFor="profissional">Profissional</Label>
                      <Select 
                        value={selectedProfissional} 
                        onValueChange={setSelectedProfissional}
                        disabled={!selectedPatient}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={selectedPatient ? "Selecionar profissional" : "Selecione um paciente primeiro"} />
                        </SelectTrigger>
                        <SelectContent>
                          {profissionals.map((profissional) => (
                            <SelectItem key={profissional.id} value={profissional.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{profissional.name}</span>
                                {profissional.specialty && (
                                  <span className="text-sm text-muted-foreground">{profissional.specialty}</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Calendário e Horários lado a lado */}
                    {selectedProfissional && selectedProfissionalData && (
                      <div className="grid gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Calendário */}
                          <div className="space-y-2">
                            <Label>Data</Label>
                            <div className="border rounded-md p-3">
                              <Calendar 
                                mode="single" 
                                selected={selectedDate} 
                                onSelect={setSelectedDate}
                                disabled={(date) => {
                                  // Desabilitar datas passadas
                                  if (date < new Date()) return true
                                  // Desabilitar dias em que o profissional não trabalha
                                  return !isProfissionalAvailableOnDate(selectedProfissionalData, date)
                                }}
                                className="rounded-md"
                              />
                            </div>
                            {selectedProfissionalData.workingDays.length > 0 && (
                              <div className="text-sm text-muted-foreground">
                                <strong>Dias de atendimento:</strong> {selectedProfissionalData.workingDays.map(day => {
                                  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
                                  return `${dayNames[day.dayOfWeek]} (${day.startTime} - ${day.endTime})`
                                }).join(', ')}
                              </div>
                            )}
                          </div>

                          {/* Horários Disponíveis */}
                          <div className="space-y-2">
                            <Label>Horários Disponíveis</Label>
                            <div className="border rounded-md p-3 min-h-[280px]">
                              {!selectedDate && (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                  <div className="text-center">
                                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>Selecione uma data para ver os horários</p>
                                  </div>
                                </div>
                              )}
                              
                              {selectedDate && availableTimes.length === 0 && (
                                <div className="flex items-center justify-center h-full">
                                  <div className="text-center text-muted-foreground">
                                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p>Nenhum horário disponível</p>
                                    <p className="text-sm">para esta data</p>
                                  </div>
                                </div>
                              )}
                              
                              {selectedDate && availableTimes.length > 0 && (
                                <div className="space-y-2">
                                  <p className="text-sm font-medium mb-3">
                                    {selectedDate.toLocaleDateString('pt-BR', { 
                                      weekday: 'long', 
                                      year: 'numeric', 
                                      month: 'long', 
                                      day: 'numeric' 
                                    })}
                                  </p>
                                  <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                                    {availableTimes.map((time) => (
                                      <button
                                        key={time}
                                        onClick={() => setSelectedTime(time)}
                                        className={`p-2 text-sm border rounded-md transition-colors ${
                                          selectedTime === time
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'hover:bg-muted border-border'
                                        }`}
                                      >
                                        {time}
                                      </button>
                                    ))}
                                  </div>
                                  {selectedTime && (
                                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
                                      <p className="text-sm text-green-800">
                                        <strong>Horário selecionado:</strong> {selectedTime}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Observações */}
                    <div className="grid gap-2">
                      <Label htmlFor="notes">Observações</Label>
                      <Textarea 
                        id="notes" 
                        placeholder="Observações sobre o agendamento..." 
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => {
                      setIsDialogOpen(false)
                      resetForm()
                    }}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleCreateAppointment}
                      disabled={loading || !selectedPatient || !selectedProfissional || !selectedDate || !selectedTime}
                    >
                      {loading ? 'Salvando...' : 'Salvar Agendamento'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />
            </CardContent>
          </Card>

          {/* Agendamentos do Dia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {date?.toLocaleDateString('pt-BR') === new Date().toLocaleDateString('pt-BR') 
                  ? `Hoje - ${date?.toLocaleDateString('pt-BR')}` 
                  : date?.toLocaleDateString('pt-BR') || 'Selecione uma data'
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{appointment.time}</span>
                      <Badge
                        variant={
                          appointment.status === "CONFIRMADO" ? "default" : 
                          appointment.status === "AGENDADO" ? "secondary" :
                          appointment.status === "EM_ANDAMENTO" ? "outline" :
                          "destructive"
                        }
                        className="text-xs"
                      >
                        {appointment.status.toLowerCase()}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{appointment.patient.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {appointment.profissional.name}
                        {appointment.profissional.specialty && ` • ${appointment.profissional.specialty}`}
                        {appointment.notes && ` • ${appointment.notes}`}
                      </p>
                    </div>
                  </div>
                ))}

                {appointments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum agendamento para {date?.toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
