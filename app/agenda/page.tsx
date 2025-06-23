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
                <DialogContent className="sm:max-w-[800px] max-h-[95vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Novo Agendamento</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
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

                    {/* Calendário e Horários - Layout Melhorado */}
                    {selectedProfissional && selectedProfissionalData && (
                      <div className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2">
                          {/* Calendário */}
                          <div className="space-y-3">
                            <Label className="text-base font-medium">Selecionar Data</Label>
                            <div className="flex justify-center">
                              <div className="border rounded-lg p-3 bg-card">
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
                                  classNames={{
                                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                    month: "space-y-4",
                                    caption: "flex justify-center pt-1 relative items-center",
                                    caption_label: "text-sm font-medium",
                                    nav: "space-x-1 flex items-center",
                                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                                    nav_button_previous: "absolute left-1",
                                    nav_button_next: "absolute right-1",
                                    table: "w-full border-collapse space-y-1",
                                    head_row: "flex",
                                    head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                                    row: "flex w-full mt-2",
                                    cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                    day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
                                    day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                    day_today: "bg-accent text-accent-foreground",
                                    day_outside: "text-muted-foreground opacity-50",
                                    day_disabled: "text-muted-foreground opacity-50",
                                    day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                    day_hidden: "invisible",
                                  }}
                                />
                              </div>
                            </div>
                            {selectedProfissionalData.workingDays.length > 0 && (
                              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                                <strong>Dias de atendimento:</strong> {selectedProfissionalData.workingDays.map(day => {
                                  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
                                  return `${dayNames[day.dayOfWeek]} (${day.startTime} - ${day.endTime})`
                                }).join(', ')}
                              </div>
                            )}
                          </div>

                          {/* Horários Disponíveis */}
                          <div className="space-y-3">
                            <Label className="text-base font-medium">Horários Disponíveis</Label>
                            <div className="border rounded-lg p-4 min-h-[320px] bg-card">
                              {!selectedDate && (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                  <div className="text-center">
                                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p className="font-medium">Selecione uma data</p>
                                    <p className="text-sm">para ver os horários disponíveis</p>
                                  </div>
                                </div>
                              )}
                              
                              {selectedDate && availableTimes.length === 0 && (
                                <div className="flex items-center justify-center h-full">
                                  <div className="text-center text-muted-foreground">
                                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-30" />
                                    <p className="font-medium">Nenhum horário disponível</p>
                                    <p className="text-sm">para esta data</p>
                                  </div>
                                </div>
                              )}
                              
                              {selectedDate && availableTimes.length > 0 && (
                                <div className="space-y-3">
                                  <div className="text-center p-2 bg-primary/10 rounded-md">
                                    <p className="text-sm font-medium text-primary">
                                      {selectedDate.toLocaleDateString('pt-BR', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                      })}
                                    </p>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 max-h-[220px] overflow-y-auto">
                                    {availableTimes.map((time) => (
                                      <button
                                        key={time}
                                        onClick={() => setSelectedTime(time)}
                                        className={`p-2 text-sm border rounded-md transition-all duration-200 hover:scale-105 ${
                                          selectedTime === time
                                            ? 'bg-primary text-primary-foreground border-primary shadow-md'
                                            : 'hover:bg-muted border-border hover:border-primary/50'
                                        }`}
                                      >
                                        {time}
                                      </button>
                                    ))}
                                  </div>
                                  {selectedTime && (
                                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                                      <p className="text-sm text-green-800 text-center">
                                        <strong>✓ Horário selecionado:</strong> {selectedTime}
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
                      <Label htmlFor="notes">Observações (opcional)</Label>
                      <Textarea 
                        id="notes"
                        placeholder="Observações sobre o agendamento..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-[80px] resize-none"
                      />
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setIsDialogOpen(false)
                          resetForm()
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleCreateAppointment}
                        disabled={!selectedPatient || !selectedProfissional || !selectedDate || !selectedTime || loading}
                        className="min-w-[120px]"
                      >
                        {loading ? 'Criando...' : 'Criar Agendamento'}
                      </Button>
                    </div>
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
