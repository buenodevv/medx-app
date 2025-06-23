'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import { Calendar, Users, Clock, TrendingUp, Plus, UserPlus, Activity, CalendarDays, Search, User } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "@/hooks/use-toast"

interface DashboardStats {
  totalPatients: number
  todayAppointments: number
  avgConsultationTime: number
  occupancyRate: number
}

interface Appointment {
  id: string
  date: string
  time: string
  patient: {
    id: string
    name: string
    phone?: string
  }
  profissional: {
    id: string
    name: string
    specialty?: string
  }
  status: string
}

interface Patient {
  id: string
  name: string
  cpf: string
  phone?: string
  email?: string
}

interface Professional {
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

interface DashboardContentProps {
  clinicId?: string
  clinicName?: string
}

export default function DashboardContent({ clinicId: propClinicId, clinicName: propClinicName }: DashboardContentProps = {}) {
  const { user } = useUser()
  const [clinicData, setClinicData] = useState<{id: string, name: string} | null>(null)
  
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    avgConsultationTime: 0,
    occupancyRate: 0
  })
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false)
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [appointmentLoading, setAppointmentLoading] = useState(false)
  const [patientLoading, setPatientLoading] = useState(false)

  // Estados do modal de agendamento
  const [selectedPatient, setSelectedPatient] = useState<string>('')
  const [selectedProfissional, setSelectedProfissional] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [patientSearch, setPatientSearch] = useState<string>('')
  const [availableTimes, setAvailableTimes] = useState<string[]>([])

  const patientForm = useForm({
    defaultValues: {
      name: '',
      cpf: '',
      phone: '',
      email: '',
      address: ''
    }
  })

  // Buscar dados do dashboard
  useEffect(() => {
    fetchDashboardData()
  }, [clinicId])

  // Buscar pacientes com filtro
  const fetchPatients = async (search: string = '') => {
    try {
      const url = search 
        ? `/api/patients?search=${encodeURIComponent(search)}&clinicId=${clinicId}`
        : `/api/patients?clinicId=${clinicId}`
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
      const response = await fetch(`/api/profissionals?clinicId=${clinicId}`)
      if (response.ok) {
        const data = await response.json()
        setProfessionals(data)
      }
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error)
    }
  }

  // Buscar horários disponíveis
  const fetchAvailableTimes = async (profissionalId: string, date: Date) => {
    try {
      const dateStr = date.toISOString().split('T')[0]
      const response = await fetch(`/api/appointments/available-times?profissionalId=${profissionalId}&date=${dateStr}&clinicId=${clinicId}`)
      
      if (!response.ok) {
        setAvailableTimes([])
        return
      }
      
      const data = await response.json()
      const times = data.availableTimes || []
      setAvailableTimes(times)
    } catch (error) {
      console.error('Erro ao buscar horários disponíveis:', error)
      setAvailableTimes([])
    }
  }

  // Verificar se o profissional trabalha no dia selecionado
  const isProfissionalAvailableOnDate = (profissional: Professional, date: Date): boolean => {
    const dayOfWeek = date.getDay()
    return profissional.workingDays.some(day => day.dayOfWeek === dayOfWeek)
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

    setAppointmentLoading(true)
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
          notes: notes || undefined,
          clinicId: clinicId
        })
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Agendamento criado com sucesso"
        })
        setIsAppointmentDialogOpen(false)
        resetAppointmentForm()
        fetchDashboardData()
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
      setAppointmentLoading(false)
    }
  }

  // Resetar formulário de agendamento
  const resetAppointmentForm = () => {
    setSelectedPatient('')
    setSelectedProfissional('')
    setSelectedDate(undefined)
    setSelectedTime('')
    setNotes('')
    setPatientSearch('')
    setAvailableTimes([])
  }

  // Effects para busca de pacientes e horários
  useEffect(() => {
    fetchPatients()
    fetchProfissionals()
  }, [clinicId])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPatients(patientSearch)
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [patientSearch, clinicId])

  useEffect(() => {
    if (selectedProfissional && selectedDate) {
      fetchAvailableTimes(selectedProfissional, selectedDate)
    } else {
      setAvailableTimes([])
    }
  }, [selectedProfissional, selectedDate, clinicId])

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

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Buscar agendamentos de hoje
      const today = new Date().toISOString().split('T')[0]
      const appointmentsRes = await fetch(`/api/appointments?date=${today}&clinicId=${clinicId}`)
      const appointmentsData = await appointmentsRes.json()
      
      // Buscar pacientes
      const patientsRes = await fetch(`/api/patients?clinicId=${clinicId}`)
      const patientsData = await patientsRes.json()
      
      // Buscar profissionais
      const professionalsRes = await fetch(`/api/profissionals?clinicId=${clinicId}`)
      const professionalsData = await professionalsRes.json()
      
      setAppointments(appointmentsData)
      setProfessionals(professionalsData)
      
      // Calcular estatísticas
      const confirmedAppointments = appointmentsData.filter((apt: Appointment) => 
        apt.status === 'CONFIRMADO' || apt.status === 'FINALIZADO'
      )
      
      setStats({
        totalPatients: patientsData.length,
        todayAppointments: appointmentsData.length,
        avgConsultationTime: 30,
        occupancyRate: Math.round((confirmedAppointments.length / Math.max(appointmentsData.length, 1)) * 100)
      })
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do dashboard.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const onSubmitPatient = async (data: any) => {
    setPatientLoading(true)
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          clinicId: clinicId
        }),
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Paciente cadastrado com sucesso!"
        })
        setIsPatientDialogOpen(false)
        patientForm.reset()
        fetchDashboardData()
      } else {
        throw new Error('Erro ao cadastrar paciente')
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o paciente.",
        variant: "destructive"
      })
    } finally {
      setPatientLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMADO':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'AGENDADO':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'EM_ANDAMENTO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'FINALIZADO':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'CANCELADO':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const statsCards = [
    {
      title: "Pacientes Total",
      value: stats.totalPatients.toString(),
      icon: Users,
      trend: "+2 desde ontem",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Agendamentos Hoje",
      value: stats.todayAppointments.toString(),
      icon: Calendar,
      trend: "+5 esta semana",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Tempo Médio",
      value: `${stats.avgConsultationTime}min`,
      icon: Clock,
      trend: "-3min desde ontem",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: "Taxa de Ocupação",
      value: `${stats.occupancyRate}%`,
      icon: TrendingUp,
      trend: "+12% este mês",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
  ]

  const selectedProfissionalData = professionals.find(p => p.id === selectedProfissional)

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
        <div className="h-96 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard - {clinicName}</h1>
          <p className="text-gray-600 mt-1">Visão geral da sua clínica</p>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-green-500" />
          <span className="text-sm text-green-600 font-medium">Sistema Online</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className={`absolute inset-0 ${stat.bgColor} opacity-50`}></div>
              <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <p className="text-xs text-gray-600">{stat.trend}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <CalendarDays className="h-5 w-5 text-blue-600" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Novo Agendamento */}
            <Dialog open={isAppointmentDialogOpen} onOpenChange={setIsAppointmentDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
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
                        {professionals.map((profissional) => (
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

                  {/* Calendário e Horários */}
                  {selectedProfissional && selectedProfissionalData && (
                    <div className="space-y-4">
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Calendário */}
                        <div className="space-y-3">
                          <Label className="text-base font-medium">Selecionar Data</Label>
                          <div className="flex justify-center">
                            <div className="border rounded-lg p-3 bg-card">
                              <CalendarComponent 
                                mode="single" 
                                selected={selectedDate} 
                                onSelect={setSelectedDate}
                                disabled={(date) => {
                                  if (date < new Date()) return true
                                  return !isProfissionalAvailableOnDate(selectedProfissionalData, date)
                                }}
                                className="rounded-md"
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
                        setIsAppointmentDialogOpen(false)
                        resetAppointmentForm()
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleCreateAppointment}
                      disabled={appointmentLoading}
                      className="min-w-[120px]"
                    >
                      {appointmentLoading ? 'Criando...' : 'Criar Agendamento'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Cadastrar Paciente */}
            <Dialog open={isPatientDialogOpen} onOpenChange={setIsPatientDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 border-primary text-primary hover:bg-primary/10 px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                  <UserPlus className="h-4 w-4" />
                  Cadastrar Paciente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Cadastrar Novo Paciente</DialogTitle>
                </DialogHeader>
                <Form {...patientForm}>
                  <form onSubmit={patientForm.handleSubmit(onSubmitPatient)} className="space-y-4">
                    <FormField
                      control={patientForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nome do paciente" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={patientForm.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="000.000.000-00" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={patientForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="(00) 00000-0000" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={patientForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="email@exemplo.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={patientForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Endereço completo" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsPatientDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={patientLoading}>
                        {patientLoading ? 'Cadastrando...' : 'Cadastrar Paciente'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Agendamentos de Hoje */}
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Calendar className="h-5 w-5 text-green-600" />
            Agendamentos de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum agendamento para hoje</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-mono bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                      {appointment.time}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{appointment.patient.name}</div>
                      <div className="text-sm text-gray-600">
                        Dr(a). {appointment.profissional.name}
                        {appointment.profissional.specialty && ` - ${appointment.profissional.specialty}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor(appointment.status)} border`}>
                      {appointment.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}