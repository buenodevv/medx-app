'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Users, Clock, TrendingUp, Plus, UserPlus, Activity, CalendarDays } from "lucide-react"
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
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    avgConsultationTime: 0,
    occupancyRate: 0
  })
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [isPatientDialogOpen, setIsPatientDialogOpen] = useState(false)
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const patientForm = useForm({
    defaultValues: {
      name: '',
      cpf: '',
      phone: '',
      email: '',
      address: ''
    }
  })

  const appointmentForm = useForm({
    defaultValues: {
      patientId: '',
      profissionalId: '',
      date: '',
      time: '',
      notes: ''
    }
  })

  // Buscar dados do dashboard
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Buscar agendamentos de hoje
      const today = new Date().toISOString().split('T')[0]
      const appointmentsRes = await fetch(`/api/appointments?date=${today}`)
      const appointmentsData = await appointmentsRes.json()
      
      // Buscar todos os pacientes para estatísticas
      const patientsRes = await fetch('/api/patients')
      const patientsData = await patientsRes.json()
      
      // Buscar profissionais
      const professionalsRes = await fetch('/api/profissionals')
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
        avgConsultationTime: 30, // Valor padrão, pode ser calculado baseado nos dados reais
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
    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Paciente cadastrado com sucesso!"
        })
        setIsPatientDialogOpen(false)
        patientForm.reset()
        fetchDashboardData() // Atualizar dados
      } else {
        throw new Error('Erro ao cadastrar paciente')
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o paciente.",
        variant: "destructive"
      })
    }
  }

  const onSubmitAppointment = async (data: any) => {
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          date: new Date(data.date).toISOString(),
        }),
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Agendamento criado com sucesso!"
        })
        setIsAppointmentDialogOpen(false)
        appointmentForm.reset()
        fetchDashboardData() // Atualizar dados
      } else {
        throw new Error('Erro ao criar agendamento')
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o agendamento.",
        variant: "destructive"
      })
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
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
                  <Icon className={`h-5 w-5 ${stat.color}`} />
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
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                  <Plus className="h-4 w-4" />
                  Novo Agendamento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Novo Agendamento</DialogTitle>
                </DialogHeader>
                <Form {...appointmentForm}>
                  <form onSubmit={appointmentForm.handleSubmit(onSubmitAppointment)} className="space-y-4">
                    <FormField
                      control={appointmentForm.control}
                      name="profissionalId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profissional</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um profissional" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {professionals.map((prof) => (
                                <SelectItem key={prof.id} value={prof.id}>
                                  {prof.name} {prof.specialty && `- ${prof.specialty}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={appointmentForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={appointmentForm.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Horário</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={appointmentForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Observações sobre o agendamento" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsAppointmentDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">Criar Agendamento</Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            {/* Cadastrar Paciente */}
            <Dialog open={isPatientDialogOpen} onOpenChange={setIsPatientDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
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
                      <Button type="submit">Cadastrar Paciente</Button>
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
